"use client";

import { Printer } from "lucide-react";

/**
 * Déclenche l'impression du navigateur (export PDF).
 * Les styles `@media print` (globals.css) n'impriment que la feuille de facture.
 */
export function BoutonImprimer() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-md bg-anthracite px-4 py-2.5 text-sm font-medium text-ivoire transition hover:bg-anthracite-doux"
    >
      <Printer className="size-4" />
      Imprimer / PDF
    </button>
  );
}
