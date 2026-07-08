"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEMO } from "@/lib/demo";

export type LignePayload = {
  productId: string;
  quantite: number;
  prixUnitaire: number;
};

export type CreerFacturePayload = {
  clientId: string | null;
  nouveauClient: {
    nom: string;
    adresse?: string;
    telephone?: string;
    matriculeFiscal?: string;
  } | null;
  remise: number;
  lignes: LignePayload[];
};

export type ResultatFacture =
  | { ok: true; numero: string; demo?: boolean }
  | { ok: false; erreur: string };

/**
 * Crée une facture.
 * - Mode démo : aucune écriture, numéro fictif renvoyé.
 * - Réel : crée le client si besoin, puis appelle la fonction SQL atomique
 *   `creer_facture` (numéro séquentiel + lignes + mouvements + décrément stock).
 */
export async function creerFactureAction(
  payload: CreerFacturePayload,
): Promise<ResultatFacture> {
  if (!payload.lignes.length) {
    return { ok: false, erreur: "Ajoutez au moins un produit à la facture." };
  }
  const aClient =
    payload.clientId || (payload.nouveauClient?.nom ?? "").trim().length > 0;
  if (!aClient) {
    return { ok: false, erreur: "Sélectionnez ou saisissez un client." };
  }

  if (DEMO) {
    return { ok: true, numero: "FAC-DÉMO", demo: true };
  }

  const supabase = await createClient();

  // 1) Résout l'identifiant client (création si nouveau).
  let clientId = payload.clientId;
  if (!clientId && payload.nouveauClient) {
    const { data, error } = await supabase
      .from("clients")
      .insert({
        nom: payload.nouveauClient.nom,
        adresse: payload.nouveauClient.adresse || null,
        telephone: payload.nouveauClient.telephone || null,
        matricule_fiscal: payload.nouveauClient.matriculeFiscal || null,
      })
      .select("id")
      .single();
    if (error) return { ok: false, erreur: "Création du client impossible." };
    clientId = data.id;
  }

  // 2) Appelle la fonction SQL atomique (numéro généré côté base).
  // Prix saisi à la main par ligne (cours de l'or variable) ; ni TVA ni timbre.
  const { data, error } = await supabase.rpc("creer_facture", {
    p_client_id: clientId,
    p_remise: payload.remise,
    p_items: payload.lignes.map((l) => ({
      product_id: l.productId,
      quantite: l.quantite,
      prix_unitaire: l.prixUnitaire,
    })),
  });

  if (error) {
    return { ok: false, erreur: error.message };
  }

  updateTag("produits");
  updateTag("factures");
  revalidatePath("/factures");
  revalidatePath("/produits");
  const res = data as { id: string; numero: string };
  return { ok: true, numero: res.numero };
}
