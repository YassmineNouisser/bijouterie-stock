-- =====================================================================
--  Migration 0004 : données de démonstration
--  À exécuter avec le rôle service_role (éditeur SQL Supabase) : la RLS
--  est contournée. Idempotent grâce aux `on conflict`.
-- =====================================================================

-- Catégories
insert into categories (nom) values
  ('Bague'), ('Collier'), ('Bracelet'), ('Alliance'), ('Boucles d''oreilles')
on conflict (nom) do nothing;

-- Produits de démo (montants en DT, 3 décimales)
insert into products
  (reference, designation, category_id, matiere, carat, poids_grammes, pierres,
   prix_vente, cout_achat, quantite_stock, seuil_alerte, actif)
values
  ('BG-001', 'Bague solitaire diamant',
     (select id from categories where nom = 'Bague'),
     'or', 18, 3.500, '1 diamant 0,30 ct', 2450.000, 1800.000, 5, 2, true),
  ('CL-001', 'Collier maille gourmette',
     (select id from categories where nom = 'Collier'),
     'or', 18, 12.200, null, 4100.000, 3200.000, 3, 1, true),
  ('BR-001', 'Bracelet jonc ciselé',
     (select id from categories where nom = 'Bracelet'),
     'or', 21, 8.750, null, 3150.000, 2400.000, 4, 2, true),
  ('AL-001', 'Alliance classique',
     (select id from categories where nom = 'Alliance'),
     'or', 18, 4.000, null, 1280.000, 950.000, 10, 3, true),
  ('BO-001', 'Boucles d''oreilles puces',
     (select id from categories where nom = 'Boucles d''oreilles'),
     'or', 18, 2.100, '2 diamants 0,10 ct', 1650.000, 1200.000, 1, 2, true),
  ('AL-002', 'Alliance diamantée',
     (select id from categories where nom = 'Alliance'),
     'or', 21, 4.600, '5 diamants', 2200.000, 1700.000, 0, 2, true)
on conflict (reference) do nothing;
