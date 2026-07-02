/** Types et calculs partagés pour les factures. */

export type LigneFacture = {
  reference?: string | null;
  designation: string;
  quantite: number;
  prixUnitaire: number;
};

export type ClientFacture = {
  nom: string;
  adresse?: string | null;
  telephone?: string | null;
  matriculeFiscal?: string | null;
};

export type FactureData = {
  numero: string;
  date: string; // ISO
  client: ClientFacture;
  lignes: LigneFacture[];
  remise: number;
};

export type TotauxFacture = {
  sousTotal: number;
  total: number; // à régler (sous-total − remise)
};

/** Arrondi au millime (3 décimales). */
function r3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Calcule les totaux d'une facture.
 * Total = sous-total − remise (ni TVA ni timbre fiscal).
 */
export function calculerTotaux(
  lignes: LigneFacture[],
  remise: number,
): TotauxFacture {
  const sousTotal = r3(
    lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0),
  );
  const total = r3(sousTotal - (remise || 0));
  return { sousTotal, total };
}
