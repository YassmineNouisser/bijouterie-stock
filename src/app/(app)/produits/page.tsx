import Link from "next/link";
import { Plus } from "lucide-react";
import { getProduitsPage, PAR_PAGE } from "@/lib/queries/produits";
import { exigerProfil } from "@/lib/auth";
import { ProduitsListe } from "@/components/produits/produits-liste";
import { PageHeader } from "@/components/ui/page-header";

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ matiere?: string; q?: string; page?: string }>;
}) {
  const [profil, sp] = await Promise.all([exigerProfil(), searchParams]);
  const page = Number(sp.page) || 1;
  const data = await getProduitsPage("tous", {
    matiere: sp.matiere,
    q: sp.q,
    page,
  });
  const total = data.comptes.or + data.comptes.argent;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Catalogue"
        titre="Produits"
        sousTitre={`${total} référence${total > 1 ? "s" : ""} en boutique`}
        action={
          <Link href="/produits/nouveau" className="btn-or">
            <Plus className="size-4" />
            Nouveau produit
          </Link>
        }
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
