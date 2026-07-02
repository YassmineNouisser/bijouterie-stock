import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DEMO, facturesDemo, getFactureDemo } from "@/lib/demo";
import { calculerTotaux, type FactureData } from "@/lib/facture";

export type FactureListItem = {
  numero: string;
  date: string;
  clientNom: string;
  total: number;
  nbLignes: number;
};

/** Liste des factures (en-têtes) pour l'historique. */
export async function getFactures(): Promise<FactureListItem[]> {
  if (DEMO) {
    return facturesDemo.map((f) => ({
      numero: f.numero,
      date: f.date,
      clientNom: f.client.nom,
      total: calculerTotaux(f.lignes, f.remise).total,
      nbLignes: f.lignes.length,
    }));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("numero, date, total, clients(nom), invoice_items(id)")
    .order("date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((f) => ({
    numero: f.numero,
    date: f.date,
    clientNom:
      (f.clients as unknown as { nom: string } | null)?.nom ??
      "Client de passage",
    total: f.total,
    nbLignes: (f.invoice_items as unknown[] | null)?.length ?? 0,
  }));
}

/** Une facture complète par son numéro (pour l'affichage / PDF). */
export async function getFacture(numero: string): Promise<FactureData | null> {
  if (DEMO) {
    return getFactureDemo(numero) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select(
      "numero, date, remise, clients(nom, adresse, telephone, matricule_fiscal), invoice_items(designation_snap, reference_snap, quantite, prix_unitaire)",
    )
    .eq("numero", numero)
    .single();

  if (!data) return null;

  const client = data.clients as unknown as {
    nom: string;
    adresse: string | null;
    telephone: string | null;
    matricule_fiscal: string | null;
  } | null;

  type ItemRow = {
    designation_snap: string;
    reference_snap: string | null;
    quantite: number;
    prix_unitaire: number;
  };

  return {
    numero: data.numero,
    date: data.date,
    client: {
      nom: client?.nom ?? "Client de passage",
      adresse: client?.adresse ?? null,
      telephone: client?.telephone ?? null,
      matriculeFiscal: client?.matricule_fiscal ?? null,
    },
    lignes: ((data.invoice_items as ItemRow[]) ?? []).map((it) => ({
      reference: it.reference_snap,
      designation: it.designation_snap,
      quantite: it.quantite,
      prixUnitaire: it.prix_unitaire,
    })),
    remise: data.remise,
  };
}
