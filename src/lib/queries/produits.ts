import "server-only";
import { createClient } from "@/lib/supabase/server";
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
 * Liste des produits.
 * En mode démo : données fictives. Sinon : Supabase (avec jointure catégorie).
 */
export async function getProduits(): Promise<Produit[]> {
  if (DEMO) {
    return produitsDemo.map((p) => ({
      ...p,
      categorie: p.categorie,
      date_entree: null,
    }));
  }

  const supabase = await createClient();

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
