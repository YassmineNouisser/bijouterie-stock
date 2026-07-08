import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProduits } from "@/lib/queries/produits";
import { getClients } from "@/lib/queries/clients";
import { FactureForm } from "@/components/factures/facture-form";

// Next.js 16 : `searchParams` est asynchrone.
export default async function NouvelleFacturePage({
  searchParams,
}: {
  searchParams: Promise<{ produit?: string }>;
}) {
  const [{ produit: produitInitialId }, produits, clients] = await Promise.all([
    searchParams,
    getProduits(),
    getClients(),
  ]);

  // Date du jour (calculée côté serveur pour éviter tout décalage d'hydratation).
  const dateDuJour = new Date().toISOString().slice(0, 10);

  // Produits actifs proposés à la vente (y compris ceux déjà marqués vendus,
  // pour pouvoir établir la facture d'un article sorti du stock).
  const options = produits
    .filter((p) => p.actif)
    .map((p) => ({
      id: p.id,
      reference: p.reference,
      designation: p.designation,
      stock: p.quantite_stock,
    }));

  // Produit pré-sélectionné (venant du pop-up « Vendu »), s'il existe.
  const produitInitial =
    produitInitialId && options.some((o) => o.id === produitInitialId)
      ? produitInitialId
      : undefined;

  return (
    <div className="space-y-6">
      <div className="sans-impression">
        <Link
          href="/factures"
          className="inline-flex items-center gap-1 text-sm text-anthracite/60 transition hover:text-or"
        >
          <ChevronLeft className="size-4" /> Factures
        </Link>
        <h1 className="mt-2 font-titre text-3xl font-semibold text-anthracite">
          Nouvelle facture
        </h1>
        <p className="mt-1 text-sm text-anthracite/60">
          Sélectionnez les produits et le client ; l&apos;aperçu se met à jour
          en direct.
        </p>
      </div>

      <FactureForm
        produits={options}
        clients={clients}
        dateDuJour={dateDuJour}
        produitInitialId={produitInitial}
      />
    </div>
  );
}
