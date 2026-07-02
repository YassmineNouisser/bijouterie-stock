"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { FactureData } from "@/lib/facture";

/**
 * Bouton « Enregistrer PDF » : génère un vrai PDF (@react-pdf/renderer)
 * et le télécharge sur le poste. La lib est importée dynamiquement au clic
 * (jamais côté serveur, hors du bundle initial).
 */
export function BoutonEnregistrerPdf({ facture }: { facture: FactureData }) {
  const [enCours, setEnCours] = useState(false);

  async function enregistrer() {
    setEnCours(true);
    try {
      const [{ pdf }, { FacturePdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/facture-pdf"),
      ]);
      const logoSrc = `${window.location.origin}/logo-bouzid.png`;
      const blob = await pdf(
        <FacturePdf facture={facture} logoSrc={logoSrc} />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${facture.numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <button type="button" onClick={enregistrer} disabled={enCours} className="btn-or">
      {enCours ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {enCours ? "Génération…" : "Enregistrer PDF"}
    </button>
  );
}
