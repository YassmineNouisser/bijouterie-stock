import { getProduits } from "@/lib/queries/produits";
import { exigerProfil } from "@/lib/auth";
import { ProduitsListe } from "@/components/produits/produits-liste";
import { PageHeader } from "@/components/ui/page-header";

export default async function VendusPage() {
  const [profil, produits] = await Promise.all([
    exigerProfil(),
    getProduits(),
  ]);

  // Articles vendus = sortis du stock (quantité 0).
  const vendus = produits.filter((p) => p.quantite_stock <= 0);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Historique"
        titre="Articles vendus"
        sousTitre={`${vendus.length} article${vendus.length > 1 ? "s" : ""} vendu${vendus.length > 1 ? "s" : ""}`}
      />

      <ProduitsListe produits={vendus} estAdmin={profil.role === "admin"} />
    </div>
  );
}
