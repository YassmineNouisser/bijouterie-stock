import { getProduits } from "@/lib/queries/produits";
import { exigerProfil } from "@/lib/auth";
import { ProduitsListe } from "@/components/produits/produits-liste";
import { PageHeader } from "@/components/ui/page-header";

export default async function StockPage() {
  const [profil, produits] = await Promise.all([
    exigerProfil(),
    getProduits(),
  ]);

  // Le stock = les pièces encore disponibles (quantité > 0).
  const disponibles = produits.filter((p) => p.quantite_stock > 0);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Inventaire"
        titre="Stock"
        sousTitre={`${disponibles.length} pièce${disponibles.length > 1 ? "s" : ""} disponible${disponibles.length > 1 ? "s" : ""}`}
      />

      <ProduitsListe
        produits={disponibles}
        estAdmin={profil.role === "admin"}
      />
    </div>
  );
}
