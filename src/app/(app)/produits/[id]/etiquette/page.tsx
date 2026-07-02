import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProduit } from "@/lib/queries/produits";
import { EtiquetteProduit } from "@/components/produits/etiquette-produit";
import { PageHeader } from "@/components/ui/page-header";

export default async function EtiquettePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produit = await getProduit(id);
  if (!produit) notFound();

  return (
    <div className="space-y-7">
      <div>
        <Link
          href={`/produits/${produit.id}`}
          className="inline-flex items-center gap-1 text-sm text-anthracite/60 transition hover:text-or"
        >
          <ChevronLeft className="size-4" /> {produit.designation}
        </Link>
      </div>

      <PageHeader
        eyebrow="Impression thermique"
        titre="Étiquette produit"
        sousTitre={`Référence ${produit.reference}`}
      />

      <div className="carte p-6">
        <EtiquetteProduit
          produit={{
            reference: produit.reference,
            designation: produit.designation,
            matiere: produit.matiere,
            carat: produit.carat,
            poidsGrammes: produit.poids_grammes,
          }}
        />
      </div>
    </div>
  );
}
