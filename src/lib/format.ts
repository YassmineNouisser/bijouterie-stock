/**
 * Helpers de formatage — Dinar Tunisien (DT) et dates en français.
 * Le dinar s'affiche avec 3 décimales (millimes).
 */

const nfDinar = new Intl.NumberFormat("fr-TN", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

/**
 * Formate un nombre puis remplace les espaces insécables/fines (U+00A0,
 * U+202F) du séparateur de milliers par une espace normale. Indispensable
 * pour le PDF (@react-pdf) : les polices intégrées n'ont pas ces glyphes.
 */
function dinar(n: number): string {
  return nfDinar.format(n).replace(/\s/g, " ");
}

/** Formate un montant en dinars : 1280.5 -> "1 280,500 DT". */
export function formatDinar(montant: number | null | undefined): string {
  return `${dinar(montant ?? 0)} DT`;
}

/** Formate un nombre brut à 3 décimales, sans suffixe. */
export function formatMontant(montant: number | null | undefined): string {
  return dinar(montant ?? 0);
}

/** Formate un poids en grammes : 3.5 -> "3,500 g". */
export function formatGrammes(poids: number | null | undefined): string {
  if (poids == null) return "—";
  return `${dinar(poids)} g`;
}

const nfDate = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Formate une date ISO (ou Date) en jj/mm/aaaa. */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return nfDate.format(d);
}
