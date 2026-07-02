/** Statut de stock dérivé de la quantité et du seuil d'alerte. */
export type StatutStock = "rupture" | "alerte" | "disponible";

export function statutStock(
  quantite: number,
  seuil: number,
): StatutStock {
  if (quantite <= 0) return "rupture";
  if (quantite <= seuil) return "alerte";
  return "disponible";
}

/** Libellé + classes Tailwind du badge de statut. */
export const badgeStatut: Record<
  StatutStock,
  { libelle: string; classe: string }
> = {
  rupture: {
    libelle: "Rupture",
    classe: "bg-rose-50/70 text-rose-700/90 ring-1 ring-rose-600/15",
  },
  alerte: {
    libelle: "Stock faible",
    classe: "bg-amber-50/70 text-amber-700/90 ring-1 ring-amber-600/20",
  },
  disponible: {
    libelle: "Disponible",
    classe: "bg-emerald-50/60 text-emerald-800/80 ring-1 ring-emerald-700/15",
  },
};
