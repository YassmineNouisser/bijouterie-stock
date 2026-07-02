import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getFacture } from "@/lib/queries/factures";
import { FactureDocument } from "@/components/factures/facture-document";
import { BoutonImprimer } from "@/components/factures/bouton-imprimer";
import { BoutonEnregistrerPdf } from "@/components/factures/bouton-enregistrer-pdf";

// Next.js 16 : `params` est asynchrone. L'`id` ici est le numéro de facture.
export default async function FacturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const facture = await getFacture(decodeURIComponent(id));

  if (!facture) notFound();

  return (
    <div className="space-y-5">
      {/* Barre d'actions (masquée à l'impression) */}
      <div className="sans-impression flex items-center justify-between">
        <Link
          href="/factures"
          className="inline-flex items-center gap-1 text-sm text-anthracite/60 transition hover:text-or"
        >
          <ChevronLeft className="size-4" /> Factures
        </Link>
        <div className="flex items-center gap-3">
          <BoutonImprimer />
          <BoutonEnregistrerPdf facture={facture} />
        </div>
      </div>

      {/* Aperçu de la facture (défilement horizontal si écran étroit) */}
      <div className="overflow-x-auto pb-4">
        <FactureDocument facture={facture} />
      </div>
    </div>
  );
}
