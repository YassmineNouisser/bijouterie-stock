import Link from "next/link";
import { Plus } from "lucide-react";
import { getProduits } from "@/lib/queries/produits";
import { exigerProfil } from "@/lib/auth";
import { ProduitsListe } from "@/components/produits/produits-liste";
import { PageHeader } from "@/components/ui/page-header";

export default async function ProduitsPage() {
  const [profil, produits] = await Promise.all([
    exigerProfil(),
    getProduits(),
  ]);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Catalogue"
        titre="Produits"
        sousTitre={`${produits.length} référence${produits.length > 1 ? "s" : ""} en boutique`}
        action={
          <Link href="/produits/nouveau" className="btn-or">
            <Plus className="size-4" />
            Nouveau produit
          </Link>
        }
      />

      <ProduitsListe produits={produits} estAdmin={profil.role === "admin"} />
    </div>
  );
}
