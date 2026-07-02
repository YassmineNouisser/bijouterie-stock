import Link from "next/link";
import { Plus, FileText, ChevronRight } from "lucide-react";
import { getFactures } from "@/lib/queries/factures";
import { formatDinar, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";

export default async function FacturesPage() {
  const factures = await getFactures();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Ventes"
        titre="Factures"
        sousTitre={`${factures.length} facture${factures.length > 1 ? "s" : ""} émise${factures.length > 1 ? "s" : ""}`}
        action={
          <Link href="/factures/nouvelle" className="btn-or">
            <Plus className="size-4" />
            Nouvelle facture
          </Link>
        }
      />

      {factures.length === 0 ? (
        <div className="carte border-dashed py-16 text-center text-anthracite/50">
          Aucune facture pour le moment.
        </div>
      ) : (
        <div className="carte overflow-hidden">
          {/* En-têtes (bureau) */}
          <div className="hidden border-b border-or-clair/60 bg-ivoire/50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-anthracite/50 md:grid md:grid-cols-[1fr_1.5fr_1fr_auto] md:gap-4">
            <span>Numéro</span>
            <span>Client</span>
            <span className="text-right">Total TTC</span>
            <span className="w-5" />
          </div>

          {factures.map((f) => (
            <Link
              key={f.numero}
              href={`/factures/${f.numero}`}
              className="flex items-center justify-between gap-4 border-b border-or-clair/30 px-5 py-4 transition last:border-0 hover:bg-ivoire/40 md:grid md:grid-cols-[1fr_1.5fr_1fr_auto]"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ivoire text-or">
                  <FileText className="size-4" />
                </span>
                <div>
                  <p className="font-mono text-sm font-medium text-anthracite">
                    {f.numero}
                  </p>
                  <p className="text-xs text-anthracite/50">
                    {formatDate(f.date)} · {f.nbLignes} article
                    {f.nbLignes > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <p className="hidden truncate text-sm text-anthracite/80 md:block">
                {f.clientNom}
              </p>

              <p className="text-right font-medium tabular-nums text-anthracite">
                {formatDinar(f.total)}
              </p>

              <ChevronRight className="hidden size-5 text-anthracite/30 md:block" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
