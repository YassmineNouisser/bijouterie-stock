-- =====================================================================
--  Bouzid Bijouterie by Youssef — Schéma de base de données
--  Migration 0001 : types, tables, index, trigger de création de profil
--  Devise : Dinar Tunisien (DT) — montants en numeric(.,3) (millimes)
-- =====================================================================

-- Extension pour gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
--  Types énumérés
-- ---------------------------------------------------------------------
create type role_utilisateur as enum ('admin', 'vendeur');
create type type_mouvement   as enum ('entree', 'sortie', 'vente', 'ajustement');

-- ---------------------------------------------------------------------
--  profiles — lié à auth.users (1 ligne par compte)
-- ---------------------------------------------------------------------
create table profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       role_utilisateur not null default 'vendeur',
  nom        text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  categories
-- ---------------------------------------------------------------------
create table categories (
  id         uuid primary key default gen_random_uuid(),
  nom        text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  clients
-- ---------------------------------------------------------------------
create table clients (
  id               uuid primary key default gen_random_uuid(),
  nom              text not null,
  telephone        text,
  adresse          text,
  matricule_fiscal text,
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  products
--  cout_achat : visible des admins uniquement (filtré dans la couche
--  de requêtes serveur — admin et vendeur partagent le rôle Postgres
--  `authenticated`, le masquage colonne se fait donc côté application).
-- ---------------------------------------------------------------------
create table products (
  id             uuid primary key default gen_random_uuid(),
  reference      text not null unique,
  designation    text not null,
  category_id    uuid references categories (id) on delete set null,
  matiere        text,                         -- or, argent…
  carat          smallint,                     -- 18 / 21 / 24
  poids_grammes  numeric(10, 3),
  pierres        text,
  prix_vente     numeric(12, 3) not null default 0,
  cout_achat     numeric(12, 3) not null default 0,   -- admin only
  quantite_stock integer not null default 0,
  seuil_alerte   integer not null default 0,
  image_url      text,
  actif          boolean not null default true,
  created_at     timestamptz not null default now()
);

create index products_category_idx on products (category_id);
create index products_actif_idx    on products (actif);

-- ---------------------------------------------------------------------
--  invoices — le numéro est généré côté base (cf. 0003), jamais côté client
-- ---------------------------------------------------------------------
create table invoices (
  id            uuid primary key default gen_random_uuid(),
  numero        text not null unique,
  client_id     uuid references clients (id) on delete set null,
  date          date not null default current_date,
  sous_total    numeric(12, 3) not null default 0,   -- avant remise
  remise        numeric(12, 3) not null default 0,
  tva_taux      numeric(5, 2)  not null default 19,  -- 7 / 13 / 19
  tva_montant   numeric(12, 3) not null default 0,
  timbre_fiscal numeric(12, 3) not null default 0,
  total         numeric(12, 3) not null default 0,   -- TTC
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index invoices_client_idx on invoices (client_id);
create index invoices_date_idx   on invoices (date);

-- ---------------------------------------------------------------------
--  invoice_items — snapshots figés (l'historique reste juste si le
--  produit est modifié/supprimé plus tard)
-- ---------------------------------------------------------------------
create table invoice_items (
  id              uuid primary key default gen_random_uuid(),
  invoice_id      uuid not null references invoices (id) on delete cascade,
  product_id      uuid references products (id) on delete set null,
  reference_snap  text not null,
  designation_snap text not null,
  quantite        integer not null check (quantite > 0),
  prix_unitaire   numeric(12, 3) not null,
  montant         numeric(12, 3) not null
);

create index invoice_items_invoice_idx on invoice_items (invoice_id);

-- ---------------------------------------------------------------------
--  stock_movements — historique de tous les mouvements
-- ---------------------------------------------------------------------
create table stock_movements (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  type       type_mouvement not null,
  quantite   integer not null,            -- signe : + entrée / - sortie/vente
  motif      text,
  invoice_id uuid references invoices (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index stock_movements_product_idx on stock_movements (product_id);

-- ---------------------------------------------------------------------
--  Trigger : crée automatiquement un profil à l'inscription d'un compte
--  Le rôle peut être fourni dans les métadonnées (raw_user_meta_data.role),
--  sinon « vendeur » par défaut.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nom, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nom', new.email, ''),
    coalesce((new.raw_user_meta_data ->> 'role')::role_utilisateur, 'vendeur')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
