# Bouzid Bijouterie by Youssef — Application de gestion

Application web de gestion pour une bijouterie de luxe (Tunisie) : produits,
stock, ventes et facturation PDF conforme à la réglementation tunisienne.
Interface en **français**, devise **Dinar Tunisien (DT)** à 3 décimales.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (thème déclaré dans `src/app/globals.css`)
- **Supabase** (PostgreSQL + Auth + Storage)
- Déploiement **Vercel**

> ⚠️ Next.js 16 introduit des changements : le `middleware.ts` devient
> `src/proxy.ts` (fonction `proxy`), `cookies()` est asynchrone. Voir
> `node_modules/next/dist/docs/` avant toute modification.

## 1. Prérequis

- Node.js 20+
- Un projet [Supabase](https://supabase.com)

## 2. Variables d'environnement

Copier le modèle puis renseigner les valeurs :

```bash
cp .env.local.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé secrète — **serveur uniquement** |
| `NEXT_PUBLIC_BIJOU_*` | Identité de la bijouterie (mentions légales) |
| `NEXT_PUBLIC_TVA_DEFAUT` / `NEXT_PUBLIC_TIMBRE_FISCAL` | Paramètres de facturation |

> Les infos de la bijouterie (matricule fiscal, TVA, timbre) sont stockées en
> variables d'environnement — il n'y a pas de table `parametres`.

## 3. Base de données (migrations)

Dans le **SQL Editor** de Supabase, exécuter les fichiers de
`supabase/migrations/` **dans l'ordre** :

1. `0001_schema.sql` — types, tables, trigger de création de profil
2. `0002_rls.sql` — Row Level Security, policies, bucket Storage `produits`
3. `0003_facture_sequence.sql` — séquence + fonction `creer_facture` (atomique)
4. `0004_seed.sql` — catégories et produits de démonstration (optionnel)

### Créer le premier administrateur

1. Créer un compte via **Authentication > Users** (ou la page `/login` après
   inscription). Un profil `vendeur` est créé automatiquement.
2. Le passer admin dans le SQL Editor :

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'admin@exemple.tn');
```

## 4. Lancement local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) → redirige vers `/login`.

## 5. Déploiement Vercel

1. Importer le dépôt dans Vercel.
2. Renseigner les mêmes variables d'environnement (Project Settings >
   Environment Variables).
3. Déployer. Le build utilise `next build`.

## Sécurité

- **RLS activée sur toutes les tables.** Suppression réservée au rôle `admin`.
- Le coût d'achat (`products.cout_achat`) est masqué aux vendeurs côté requêtes
  serveur (admin et vendeur partagent le rôle Postgres `authenticated`).
- La clé `service_role` n'est jamais exposée au navigateur (`import "server-only"`).
- Le numéro de facture est généré par une **séquence Postgres** (`creer_facture`),
  jamais côté client — obligation légale tunisienne.

## État d'avancement

- [x] Fondations (clients Supabase, proxy, charte graphique)
- [x] Migrations SQL (schéma, RLS, séquence facture, seed)
- [x] **Authentification & rôles** (login, protection, admin/vendeur)
- [ ] Catalogue produits (CRUD)
- [ ] Gestion de stock
- [ ] Facturation PDF
- [ ] Tableau de bord
- [ ] PWA
