import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO, produitsDemo } from "@/lib/demo";

/** Forme normalisée d'un produit pour l'interface. */
export type Produit = {
  id: string;
  reference: string;
  designation: string;
  categorie: string | null;
  matiere: string | null;
  carat: number | null;
  poids_grammes: number | null;
  pierres: string | null;
  prix_vente: number;
  cout_achat: number;
  quantite_stock: number;
  seuil_alerte: number;
  image_url: string | null;
  date_entree: string | null;
  actif: boolean;
};

/** Extrait le nom de catégorie d'une jointure Supabase (objet ou tableau). */
function nomCategorie(rel: unknown): string | null {
  if (Array.isArray(rel)) return rel[0]?.nom ?? null;
  return (rel as { nom: string } | null)?.nom ?? null;
}

const PRODUIT_SELECT =
  "id, reference, designation, matiere, carat, poids_grammes, pierres, prix_vente, cout_achat, quantite_stock, seuil_alerte, image_url, date_entree, actif, categories(nom)";

/**
 * Chargement réel des produits, MIS EN CACHE (données identiques pour tous les
 * utilisateurs). Utilise le client service_role (sans cookies) pour tourner
 * hors du contexte de requête. Le cache est invalidé via le tag "produits"
 * à chaque ajout / modification / suppression / vente / facture.
 */
const chargerProduits = unstable_cache(
  async (): Promise<Produit[]> => {
    const supabase = createAdminClient();
    // Supabase plafonne une requête à 1000 lignes : on pagine pour tout récupérer.
    const PAGE = 1000;
    const produits: Produit[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUIT_SELECT)
        .order("date_entree", { ascending: false, nullsFirst: false })
        .range(from, from + PAGE - 1);

      if (error) throw error;
      const lot = data ?? [];

      for (const p of lot) {
        produits.push({
          id: p.id,
          reference: p.reference,
          designation: p.designation,
          categorie: nomCategorie(p.categories),
          matiere: p.matiere,
          carat: p.carat,
          poids_grammes: p.poids_grammes,
          pierres: p.pierres,
          prix_vente: p.prix_vente,
          cout_achat: p.cout_achat,
          quantite_stock: p.quantite_stock,
          seuil_alerte: p.seuil_alerte,
          image_url: p.image_url,
          date_entree: p.date_entree,
          actif: p.actif,
        });
      }

      if (lot.length < PAGE) break;
    }

    return produits;
  },
  ["produits-liste"],
  { tags: ["produits"], revalidate: 60 },
);

/**
 * Liste des produits.
 * En mode démo : données fictives. Sinon : Supabase (via cache).
 */
export async function getProduits(): Promise<Produit[]> {
  if (DEMO) {
    return produitsDemo.map((p) => ({
      ...p,
      categorie: p.categorie,
      date_entree: null,
    }));
  }
  return chargerProduits();
}

// ---------------------------------------------------------------------
//  Liste PAGINÉE côté serveur (mobile : on n'envoie que ~12 lignes/page)
// ---------------------------------------------------------------------
export type ModeListe = "tous" | "stock" | "vendus";
export type Matiere = "or" | "argent";
export const PAR_PAGE = 12;

export type PageProduits = {
  rows: Produit[];
  total: number; // nombre de résultats pour la matière courante
  comptes: { or: number; argent: number };
};

/** Nettoie la recherche pour l'injecter sans casser la syntaxe PostgREST. */
function nettoyerRecherche(q: string): string {
  return q.replace(/[,()*%]/g, " ").trim();
}

const chargerPage = unstable_cache(
  async (
    mode: ModeListe,
    matiere: Matiere,
    q: string,
    page: number,
  ): Promise<PageProduits> => {
    const supabase = createAdminClient();
    const rechercheOr = q
      ? (`reference.ilike.%${q}%,designation.ilike.%${q}%` as const)
      : null;

    // Compte les pièces d'une matière (avec le filtre stock du mode + recherche).
    const compter = (mat: Matiere) => {
      let x = supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("matiere", mat);
      if (mode === "stock") x = x.gt("quantite_stock", 0);
      else if (mode === "vendus") x = x.lte("quantite_stock", 0);
      if (rechercheOr) x = x.or(rechercheOr);
      return x;
    };

    // Filtres (matière, stock, recherche) AVANT le tri/la pagination.
    let lignes = supabase
      .from("products")
      .select(PRODUIT_SELECT)
      .eq("matiere", matiere);
    if (mode === "stock") lignes = lignes.gt("quantite_stock", 0);
    else if (mode === "vendus") lignes = lignes.lte("quantite_stock", 0);
    if (rechercheOr) lignes = lignes.or(rechercheOr);

    const from = (page - 1) * PAR_PAGE;
    const lignesTriees = lignes
      .order("date_entree", { ascending: false, nullsFirst: false })
      .range(from, from + PAR_PAGE - 1);

    const [resOr, resArgent, resRows] = await Promise.all([
      compter("or"),
      compter("argent"),
      lignesTriees,
    ]);

    const rows: Produit[] = (resRows.data ?? []).map((p) => ({
      id: p.id,
      reference: p.reference,
      designation: p.designation,
      categorie: nomCategorie(p.categories),
      matiere: p.matiere,
      carat: p.carat,
      poids_grammes: p.poids_grammes,
      pierres: p.pierres,
      prix_vente: p.prix_vente,
      cout_achat: p.cout_achat,
      quantite_stock: p.quantite_stock,
      seuil_alerte: p.seuil_alerte,
      image_url: p.image_url,
      date_entree: p.date_entree,
      actif: p.actif,
    }));

    return {
      rows,
      total: matiere === "argent" ? resArgent.count ?? 0 : resOr.count ?? 0,
      comptes: { or: resOr.count ?? 0, argent: resArgent.count ?? 0 },
    };
  },
  ["produits-page"],
  { tags: ["produits"], revalidate: 60 },
);

/** Une page de produits filtrée (mobile-friendly). */
export async function getProduitsPage(
  mode: ModeListe,
  opts: { matiere?: string; q?: string; page?: number },
): Promise<PageProduits> {
  const matiere: Matiere = opts.matiere === "argent" ? "argent" : "or";
  const q = nettoyerRecherche(opts.q ?? "");
  const page = Math.max(1, opts.page ?? 1);

  if (DEMO) {
    const tous = produitsDemo.map((p) => ({
      ...p,
      categorie: p.categorie,
      date_entree: null,
    })) as Produit[];
    const dansMode = (p: Produit) =>
      mode === "stock"
        ? p.quantite_stock > 0
        : mode === "vendus"
          ? p.quantite_stock <= 0
          : true;
    const match = (p: Produit) =>
      !q ||
      p.reference.toLowerCase().includes(q.toLowerCase()) ||
      p.designation.toLowerCase().includes(q.toLowerCase());
    const base = tous.filter((p) => dansMode(p) && match(p));
    const mat = (p: Produit) => (p.matiere === "argent" ? "argent" : "or");
    const filtres = base.filter((p) => mat(p) === matiere);
    return {
      rows: filtres.slice((page - 1) * PAR_PAGE, page * PAR_PAGE),
      total: filtres.length,
      comptes: {
        or: base.filter((p) => mat(p) === "or").length,
        argent: base.filter((p) => mat(p) === "argent").length,
      },
    };
  }

  return chargerPage(mode, matiere, q, page);
}

/** Un produit par son id (pour l'édition). Renvoie null si introuvable. */
export async function getProduit(id: string): Promise<Produit | null> {
  if (DEMO) {
    const p = produitsDemo.find((x) => x.id === id);
    return p ? { ...p, categorie: p.categorie, date_entree: null } : null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUIT_SELECT)
    .eq("id", id)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    reference: data.reference,
    designation: data.designation,
    categorie: nomCategorie(data.categories),
    matiere: data.matiere,
    carat: data.carat,
    poids_grammes: data.poids_grammes,
    pierres: data.pierres,
    prix_vente: data.prix_vente,
    cout_achat: data.cout_achat,
    quantite_stock: data.quantite_stock,
    seuil_alerte: data.seuil_alerte,
    image_url: data.image_url,
    date_entree: data.date_entree,
    actif: data.actif,
  };
}

/** Liste des noms de catégories (pour les filtres / formulaires). */
export async function getCategories(): Promise<string[]> {
  if (DEMO) {
    const { categoriesDemo } = await import("@/lib/demo");
    return categoriesDemo;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("nom")
    .order("nom");
  return (data ?? []).map((c) => c.nom);
}
