-- =====================================================================
--  Migration 0005 : prix saisi à la main + suppression TVA / timbre
--
--  Le cours de l'or est variable : le prix de vente n'est plus porté par
--  le produit mais saisi ligne par ligne au moment de la facture.
--  Les factures n'appliquent plus ni TVA ni timbre fiscal :
--    total = sous-total − remise.
--
--  On remplace `creer_facture` par une nouvelle signature :
--    (p_client_id uuid, p_remise numeric, p_items jsonb)
--  où p_items = [{ "product_id": uuid, "quantite": int, "prix_unitaire": numeric }]
-- =====================================================================

-- Ancienne version (avec TVA et timbre) : supprimée.
drop function if exists public.creer_facture(uuid, numeric, numeric, numeric, jsonb);

create or replace function public.creer_facture(
  p_client_id uuid,
  p_remise    numeric,
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
  v_prix        numeric(12,3);
  v_sous_total  numeric(12,3) := 0;
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

  insert into invoices (numero, client_id, remise, created_by)
  values (v_numero, p_client_id, coalesce(p_remise, 0), v_uid)
  returning id into v_invoice_id;

  -- Parcours des lignes : verrou produit, contrôle stock, insertion ligne + mouvement.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantite := (v_item ->> 'quantite')::integer;
    v_prix     := coalesce((v_item ->> 'prix_unitaire')::numeric, 0);

    if v_quantite is null or v_quantite <= 0 then
      raise exception 'Quantité invalide dans la facture.';
    end if;

    if v_prix <= 0 then
      raise exception 'Prix unitaire manquant ou invalide dans la facture.';
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

    v_sous_total := v_sous_total + (v_prix * v_quantite);

    insert into invoice_items
      (invoice_id, product_id, reference_snap, designation_snap, quantite, prix_unitaire, montant)
    values
      (v_invoice_id, v_product.id, v_product.reference, v_product.designation,
       v_quantite, v_prix, v_prix * v_quantite);

    update products
    set quantite_stock = quantite_stock - v_quantite
    where id = v_product.id;

    insert into stock_movements (product_id, type, quantite, motif, invoice_id, created_by)
    values (v_product.id, 'vente', -v_quantite, 'Facture ' || v_numero, v_invoice_id, v_uid);
  end loop;

  -- Total = sous-total − remise (arrondi au millime). Ni TVA ni timbre.
  v_total := round(v_sous_total - coalesce(p_remise, 0), 3);

  update invoices
  set sous_total = v_sous_total,
      total      = v_total
  where id = v_invoice_id;

  return jsonb_build_object('id', v_invoice_id, 'numero', v_numero);
end;
$$;

grant execute on function public.creer_facture(uuid, numeric, jsonb) to authenticated;
