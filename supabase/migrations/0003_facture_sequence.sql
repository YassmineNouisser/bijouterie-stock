-- =====================================================================
--  Migration 0003 : numérotation des factures + création atomique
--
--  Obligation légale tunisienne : numéro de facture séquentiel, continu
--  et jamais réutilisé. Il est généré par une SÉQUENCE Postgres, jamais
--  en comptant les lignes côté client.
--
--  Format retenu : FAC-000123 (continu global, sans remise à zéro).
-- =====================================================================

create sequence if not exists facture_seq start with 1 increment by 1;

-- Génère le prochain numéro de facture (consomme la séquence).
create or replace function public.prochain_numero_facture()
returns text
language sql
volatile
as $$
  select 'FAC-' || lpad(nextval('facture_seq')::text, 6, '0');
$$;

-- ---------------------------------------------------------------------
--  creer_facture — crée une facture de façon ATOMIQUE :
--    1. vérifie le stock disponible (verrou sur les lignes produit) ;
--    2. calcule les montants à partir du prix de vente courant ;
--    3. génère le numéro via la séquence ;
--    4. insère la facture + ses lignes ;
--    5. enregistre les mouvements de stock (type « vente ») ;
--    6. décrémente le stock.
--  Tout échoue ensemble si une étape échoue (transaction unique).
--
--  p_items : jsonb tableau d'objets { "product_id": uuid, "quantite": int }
--  Retourne : { "id": uuid, "numero": text }
-- ---------------------------------------------------------------------
create or replace function public.creer_facture(
  p_client_id uuid,
  p_remise    numeric,
  p_tva_taux  numeric,
  p_timbre    numeric,
  p_items     jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid         uuid := auth.uid();
  v_item        jsonb;
  v_product     products%rowtype;
  v_quantite    integer;
  v_sous_total  numeric(12,3) := 0;
  v_base        numeric(12,3);
  v_tva_montant numeric(12,3);
  v_total       numeric(12,3);
  v_numero      text;
  v_invoice_id  uuid;
begin
  -- Sécurité : seul un utilisateur authentifié peut facturer.
  if v_uid is null then
    raise exception 'Authentification requise pour créer une facture.';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'La facture doit contenir au moins une ligne.';
  end if;

  -- Numéro de facture (séquence) + en-tête provisoire.
  v_numero := prochain_numero_facture();

  insert into invoices (numero, client_id, tva_taux, timbre_fiscal, remise, created_by)
  values (v_numero, p_client_id, coalesce(p_tva_taux, 0), coalesce(p_timbre, 0),
          coalesce(p_remise, 0), v_uid)
  returning id into v_invoice_id;

  -- Parcours des lignes : verrou produit, contrôle stock, insertion ligne + mouvement.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantite := (v_item ->> 'quantite')::integer;

    if v_quantite is null or v_quantite <= 0 then
      raise exception 'Quantité invalide dans la facture.';
    end if;

    select * into v_product
    from products
    where id = (v_item ->> 'product_id')::uuid
    for update;

    if not found then
      raise exception 'Produit introuvable : %', v_item ->> 'product_id';
    end if;

    if v_product.quantite_stock < v_quantite then
      raise exception 'Stock insuffisant pour % (réf. %) : disponible %, demandé %',
        v_product.designation, v_product.reference, v_product.quantite_stock, v_quantite;
    end if;

    v_sous_total := v_sous_total + (v_product.prix_vente * v_quantite);

    insert into invoice_items
      (invoice_id, product_id, reference_snap, designation_snap, quantite, prix_unitaire, montant)
    values
      (v_invoice_id, v_product.id, v_product.reference, v_product.designation,
       v_quantite, v_product.prix_vente, v_product.prix_vente * v_quantite);

    update products
    set quantite_stock = quantite_stock - v_quantite
    where id = v_product.id;

    insert into stock_movements (product_id, type, quantite, motif, invoice_id, created_by)
    values (v_product.id, 'vente', -v_quantite, 'Facture ' || v_numero, v_invoice_id, v_uid);
  end loop;

  -- Calcul des montants (TVA appliquée après remise, arrondi au millime).
  v_base        := round(v_sous_total - coalesce(p_remise, 0), 3);
  v_tva_montant := round(v_base * coalesce(p_tva_taux, 0) / 100, 3);
  v_total       := round(v_base + v_tva_montant + coalesce(p_timbre, 0), 3);

  update invoices
  set sous_total  = v_sous_total,
      tva_montant = v_tva_montant,
      total       = v_total
  where id = v_invoice_id;

  return jsonb_build_object('id', v_invoice_id, 'numero', v_numero);
end;
$$;

-- Les utilisateurs authentifiés peuvent appeler la fonction.
grant execute on function public.creer_facture(uuid, numeric, numeric, numeric, jsonb) to authenticated;
