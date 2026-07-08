import { getProduitsPage, PAR_PAGE } from "@/lib/queries/produits";
import { exigerProfil } from "@/lib/auth";
import { ProduitsListe } from "@/components/produits/produits-liste";
import { PageHeader } from "@/components/ui/page-header";

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ matiere?: string; q?: string; page?: string }>;
}) {
  const [profil, sp] = await Promise.all([exigerProfil(), searchParams]);
  const page = Number(sp.page) || 1;
  const data = await getProduitsPage("stock", {
    matiere: sp.matiere,
    q: sp.q,
    page,
  });
  const total = data.comptes.or + data.comptes.argent;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Inventaire"
        titre="Stock"
        sousTitre={`${total} pièce${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}`}
      />

      <ProduitsListe
        rows={data.rows}
        comptes={data.comptes}
        total={data.total}
        matiere={sp.matiere === "argent" ? "argent" : "or"}
        q={sp.q ?? ""}
        page={page}
        parPage={PAR_PAGE}
        estAdmin={profil.role === "admin"}
      />
    </div>
  );
}
