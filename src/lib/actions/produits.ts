"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEMO } from "@/lib/demo";

export type EtatProduit = { erreur?: string; ok?: boolean } | undefined;

/**
 * Supprime un produit (réservé aux admins — la RLS le force aussi côté base).
 * En mode démo : suppression simulée (rien n'est persisté).
 */
export async function supprimerProduit(
  id: string,
): Promise<{ ok: boolean; erreur?: string }> {
  if (DEMO) return { ok: true };

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return { ok: false, erreur: error.message };
  }
  revalidatePath("/produits");
  return { ok: true };
}

function lireFormulaire(formData: FormData) {
  const nombre = (v: FormDataEntryValue | null) =>
    v === null || v === "" ? null : Number(v);

  return {
    reference: String(formData.get("reference") ?? "").trim(),
    designation: String(formData.get("designation") ?? "").trim(),
    categorie: String(formData.get("categorie") ?? "").trim() || null,
    matiere: String(formData.get("matiere") ?? "").trim() || null,
    carat: nombre(formData.get("carat")),
    poids_grammes: nombre(formData.get("poids_grammes")),
    pierres: String(formData.get("pierres") ?? "").trim() || null,
    prix_vente: nombre(formData.get("prix_vente")) ?? 0,
    cout_achat: nombre(formData.get("cout_achat")) ?? 0,
    quantite_stock: nombre(formData.get("quantite_stock")) ?? 0,
    seuil_alerte: nombre(formData.get("seuil_alerte")) ?? 0,
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    date_entree: String(formData.get("date_entree") ?? "").trim() || null,
    actif: formData.get("actif") === "on",
  };
}

/**
 * Enregistre un produit (création ou édition).
 * En mode démo : enregistrement simulé (rien n'est persisté).
 * Le branchement Supabase complet (catégorie, upload image) sera finalisé
 * à l'étape « Catalogue produits (CRUD) ».
 */
export async function enregistrerProduit(
  productId: string | null,
  _prev: EtatProduit,
  formData: FormData,
): Promise<EtatProduit> {
  const data = lireFormulaire(formData);

  if (!data.reference || !data.designation) {
    return { erreur: "La référence et la désignation sont obligatoires." };
  }

  if (DEMO) {
    // Mode démo : on simule un succès sans rien écrire.
    return { ok: true };
  }

  const supabase = await createClient();

  // Résout la catégorie (nom -> id) si fournie.
  let category_id: string | null = null;
  if (data.categorie) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("nom", data.categorie)
      .single();
    category_id = cat?.id ?? null;
  }

  const payload = {
    reference: data.reference,
    designation: data.designation,
    category_id,
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

  const { error } = productId
    ? await supabase.from("products").update(payload).eq("id", productId)
    : await supabase.from("products").insert(payload);

  if (error) {
    return { erreur: "Enregistrement impossible : " + error.message };
  }

  revalidatePath("/produits");
  redirect("/produits");
}
