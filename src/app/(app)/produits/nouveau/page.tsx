import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCategories } from "@/lib/queries/produits";
import { exigerProfil } from "@/lib/auth";
import { ProduitForm } from "@/components/produits/produit-form";
import { DEMO } from "@/lib/demo";

export default async function NouveauProduitPage() {
  const [profil, categories] = await Promise.all([
    exigerProfil(),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/produits"
          className="inline-flex items-center gap-1 text-sm text-anthracite/50 transition hover:text-or"
        >
          <ChevronLeft className="size-4" /> Produits
        </Link>
        <h1 className="mt-2 font-titre text-3xl font-semibold text-anthracite">
          Nouveau produit
        </h1>
      </div>

      <ProduitForm
        categories={categories}
        estAdmin={profil.role === "admin"}
        demo={DEMO}
      />
    </div>
  );
}
