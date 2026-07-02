"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Loader2, QrCode } from "lucide-react";
import type { EtiquetteProduitData } from "@/components/pdf/etiquette-pdf";

function caracteristiques(p: EtiquetteProduitData): string {
  const parts: string[] = [];
  if (p.matiere) parts.push(p.matiere);
  if (p.carat) parts.push(`${p.carat}k`);
  if (p.poidsGrammes) parts.push(`${p.poidsGrammes.toLocaleString("fr-FR")} g`);
  return parts.join(" · ");
}

/**
 * Aperçu + génération de l'étiquette produit (QR code) pour mini-imprimante
 * thermique Bluetooth (58 mm). On génère un PDF prêt à imprimer.
 */
export function EtiquetteProduit({ produit }: { produit: EtiquetteProduitData }) {
  const [qr, setQr] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(produit.reference, {
      margin: 1,
      width: 240,
      color: { dark: "#111111", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(null));
  }, [produit.reference]);

  const specs = caracteristiques(produit);

  async function enregistrer() {
    if (!qr) return;
    setEnCours(true);
    try {
      const [{ pdf }, { EtiquettePdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/etiquette-pdf"),
      ]);
      const blob = await pdf(
        <EtiquettePdf produit={produit} qr={qr} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `etiquette-${produit.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
      {/* Aperçu à l'échelle (58 mm ≈ 220 px) */}
      <div
        className="shrink-0 overflow-hidden rounded-lg border border-or-clair bg-white shadow-sm"
        style={{ width: 220 }}
      >
        <div className="flex items-center gap-2.5 p-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-lg font-bold leading-tight text-anthracite">
              {produit.reference}
            </p>
            <p className="mt-1 text-[0.6rem] leading-snug text-anthracite/70">
              {produit.designation}
            </p>
            {specs && (
              <p className="mt-1.5 text-[0.62rem] font-semibold text-or-fonce">
                {specs}
              </p>
            )}
          </div>
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="QR" className="size-[56px] shrink-0" />
          ) : (
            <div className="flex size-[56px] shrink-0 items-center justify-center rounded bg-ivoire text-or/40">
              <QrCode className="size-6" />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <p className="text-sm text-anthracite/60">
          Étiquette prête pour l&apos;impression thermique (58 mm).
          Enregistrez le PDF puis imprimez-le depuis l&apos;application de
          votre mini-imprimante Bluetooth.
        </p>
        <button
          type="button"
          onClick={enregistrer}
          disabled={!qr || enCours}
          className="btn-or disabled:opacity-50"
        >
          {enCours ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {enCours ? "Génération…" : "Enregistrer l'étiquette (PDF)"}
        </button>
      </div>
    </div>
  );
}
