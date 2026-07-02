-- =====================================================================
--  Migration 0002 : Row Level Security (RLS) + policies
--  Règles :
--   - lecture / écriture réservées aux utilisateurs AUTHENTIFIÉS ;
--   - SUPPRESSION (delete) réservée au rôle ADMIN ;
--   - le coût d'achat (products.cout_achat) est masqué côté application
--     pour les vendeurs (admin et vendeur partagent le rôle `authenticated`).
-- =====================================================================

-- Helper : l'utilisateur courant est-il admin ?
-- security definer pour lire profiles sans déclencher la RLS (pas de récursion).
create or replace function public.est_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Active la RLS sur toutes les tables
alter table profiles        enable row level security;
alter table categories      enable row level security;
alter table clients         enable row level security;
alter table products        enable row level security;
alter table invoices        enable row level security;
alter table invoice_items   enable row level security;
alter table stock_movements enable row level security;

-- ---------------------------------------------------------------------
--  profiles : chacun lit tous les profils (pour afficher les noms),
--  modifie le sien ; les admins gèrent tout.
-- ---------------------------------------------------------------------
create policy "profiles_select" on profiles
  for select to authenticated using (true);

create policy "profiles_update_self" on profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_admin_all" on profiles
  for all to authenticated
  using (est_admin()) with check (est_admin());

-- ---------------------------------------------------------------------
--  Modèle commun (categories, clients, products, invoices,
--  invoice_items, stock_movements) :
--   select / insert / update -> authentifiés ; delete -> admin.
-- ---------------------------------------------------------------------
create policy "categories_read"   on categories for select to authenticated using (true);
create policy "categories_write"  on categories for insert to authenticated with check (true);
create policy "categories_update" on categories for update to authenticated using (true) with check (true);
create policy "categories_delete" on categories for delete to authenticated using (est_admin());

create policy "clients_read"   on clients for select to authenticated using (true);
create policy "clients_write"  on clients for insert to authenticated with check (true);
create policy "clients_update" on clients for update to authenticated using (true) with check (true);
create policy "clients_delete" on clients for delete to authenticated using (est_admin());

create policy "products_read"   on products for select to authenticated using (true);
create policy "products_write"  on products for insert to authenticated with check (true);
create policy "products_update" on products for update to authenticated using (true) with check (true);
create policy "products_delete" on products for delete to authenticated using (est_admin());

create policy "invoices_read"   on invoices for select to authenticated using (true);
create policy "invoices_write"  on invoices for insert to authenticated with check (true);
create policy "invoices_update" on invoices for update to authenticated using (true) with check (true);
create policy "invoices_delete" on invoices for delete to authenticated using (est_admin());

create policy "invoice_items_read"   on invoice_items for select to authenticated using (true);
create policy "invoice_items_write"  on invoice_items for insert to authenticated with check (true);
create policy "invoice_items_update" on invoice_items for update to authenticated using (true) with check (true);
create policy "invoice_items_delete" on invoice_items for delete to authenticated using (est_admin());

create policy "stock_movements_read"   on stock_movements for select to authenticated using (true);
create policy "stock_movements_write"  on stock_movements for insert to authenticated with check (true);
create policy "stock_movements_update" on stock_movements for update to authenticated using (true) with check (true);
create policy "stock_movements_delete" on stock_movements for delete to authenticated using (est_admin());

-- ---------------------------------------------------------------------
--  Storage : bucket public « produits » pour les photos.
--  Lecture publique (affichage des images), écriture pour authentifiés,
--  suppression pour admins.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('produits', 'produits', true)
on conflict (id) do nothing;

create policy "produits_public_read" on storage.objects
  for select using (bucket_id = 'produits');

create policy "produits_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'produits');

create policy "produits_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'produits');

create policy "produits_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'produits' and est_admin());
