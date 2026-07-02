import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, QrCode } from "lucide-react";
import { getProduit, getCategories } from "@/lib/queries/produits";
import { exigerProfil } from "@/lib/auth";
import { ProduitForm } from "@/components/produits/produit-form";
import { DEMO } from "@/lib/demo";

// Next.js 16 : `params` est asynchrone.
export default async function EditionProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profil, produit, categories] = await Promise.all([
    exigerProfil(),
    getProduit(id),
    getCategories(),
  ]);

  if (!produit) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Link
            href="/produits"
            className="inline-flex items-center gap-1 text-sm text-anthracite/50 transition hover:text-or"
          >
            <ChevronLeft className="size-4" /> Produits
          </Link>
          <h1 className="mt-2 font-titre text-3xl font-semibold text-anthracite">
            {produit.designation}
          </h1>
          <p className="font-mono text-sm text-anthracite/50">
            {produit.reference}
          </p>
        </div>
        <Link
          href={`/produits/${produit.id}/etiquette`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-or-clair bg-white px-4 py-2 text-sm font-medium text-anthracite transition hover:border-or hover:text-or-fonce"
        >
          <QrCode className="size-4" />
          Étiquette
        </Link>
      </div>

      <ProduitForm
        produit={produit}
        categories={categories}
        estAdmin={profil.role === "admin"}
        demo={DEMO}
      />
    </div>
  );
}
