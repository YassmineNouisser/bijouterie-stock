import Link from "next/link";
import {
  Scale,
  Gem,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  FileText,
  PackagePlus,
} from "lucide-react";
import { exigerProfil } from "@/lib/auth";
import { getDashboardStats, type PosteStock } from "@/lib/queries/stats";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import {
  ChartDonutGrammes,
  ChartGrammesMensuel,
} from "@/components/dashboard/charts";
import { formatDinar, formatDate, formatGrammes } from "@/lib/format";

function grammes(g: number): string {
  return `${g.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} g`;
}

export default async function DashboardPage() {
  const [profil, stats] = await Promise.all([
    exigerProfil(),
    getDashboardStats(),
  ]);

  const maxType = Math.max(1, ...stats.stockParType.map((t) => t.grammes));
  const alertesTotal = stats.nbAlertes + stats.nbRupture;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Vue d'ensemble"
        titre="Tableau de bord"
        sousTitre={`Bonjour ${profil.nom.split(" ")[0]}, voici l'état de la bijouterie.`}
      />

      {alertesTotal > 0 && (
        <Link
          href="/stock"
          className="flex items-center gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 px-5 py-3.5 text-sm text-amber-800 transition hover:bg-amber-50"
        >
          <AlertTriangle className="size-5 shrink-0 text-amber-500" />
          <span className="flex-1">
            <strong className="font-semibold">{alertesTotal} pièce(s)</strong> à
            surveiller — {stats.nbRupture} en rupture, {stats.nbAlertes} en stock
            faible.
          </span>
          <ChevronRight className="size-4 shrink-0" />
        </Link>
      )}

      {/* Cartes principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Or en stock"
          valeur={grammes(stats.grammesStock)}
          detail="Total disponible"
          icone={Scale}
          accent
        />
        <StatCard
          label="Pièces en stock"
          valeur={String(stats.nbPiecesStock)}
          detail={`${stats.nbProduits} références`}
          icone={Gem}
        />
        <StatCard
          label="Or vendu"
          valeur={grammes(stats.grammesVendus)}
          detail="Grammes écoulés"
          icone={ShoppingBag}
        />
        <StatCard
          label="Chiffre d'affaires"
          valeur={formatDinar(stats.chiffreAffaires)}
          detail={`${stats.nbVentes} facture(s)`}
          icone={TrendingUp}
        />
      </div>

      {/* Résumé du stock disponible : Or / Argent / 18K / 9K (pièces + grammes) */}
      <section className="carte p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-titre text-xl font-semibold text-anthracite">
            Stock disponible
          </h2>
          <span className="eyebrow">Pièces & grammes</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResumeStock
            libelle="Or"
            poste={stats.resumeStock.or}
            pastille="bg-gradient-to-br from-[#e9d29a] to-[#c7a24b]"
          />
          <ResumeStock
            libelle="Argent"
            poste={stats.resumeStock.argent}
            pastille="bg-gradient-to-br from-[#e9e9ee] to-[#b9bcc4]"
          />
          <ResumeStock
            libelle="18K"
            poste={stats.resumeStock.k18}
            pastille="bg-gradient-to-br from-[#e9d29a] to-[#c7a24b]"
          />
          <ResumeStock
            libelle="9K"
            poste={stats.resumeStock.k9}
            pastille="bg-gradient-to-br from-[#f0dfb0] to-[#c9a84f]"
          />
        </div>
      </section>

      {/* Répartition du stock : par carat + par type */}
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="carte p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-titre text-xl font-semibold text-anthracite">
              Or par carat
            </h2>
            <span className="eyebrow">En grammes</span>
          </div>
          {stats.stockParCarat.length === 0 ? (
            <p className="py-12 text-center text-sm text-anthracite/50">
              Aucune donnée.
            </p>
          ) : (
            <ChartDonutGrammes data={stats.stockParCarat} />
          )}
        </section>

        <section className="carte p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-titre text-xl font-semibold text-anthracite">
              Répartition par type
            </h2>
            <span className="eyebrow">Poids disponible</span>
          </div>
          {stats.stockParType.length === 0 ? (
            <p className="py-8 text-center text-sm text-anthracite/50">
              Aucune pièce en stock.
            </p>
          ) : (
            <ul className="space-y-3.5">
              {stats.stockParType.map((t) => (
                <li key={t.type} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium capitalize text-anthracite">
                      {t.type}
                    </span>
                    <span className="shrink-0 tabular-nums text-anthracite/70">
                      {grammes(t.grammes)}
                      <span className="ml-2 text-xs text-anthracite/40">
                        {t.nb} pc
                      </span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-or-soft">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-or-clair to-or"
                      style={{ width: `${(t.grammes / maxType) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Entrées de stock par mois + dernières entrées */}
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="carte p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-titre text-xl font-semibold text-anthracite">
              Entrées de stock
            </h2>
            <span className="eyebrow">Grammes / mois</span>
          </div>
          <ChartGrammesMensuel data={stats.entreesParMois} />
        </section>

        <section className="carte overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-5">
            <PackagePlus className="size-5 text-or" />
            <h2 className="font-titre text-xl font-semibold text-anthracite">
              Dernières entrées
            </h2>
          </div>
          <div className="filet-or" />
          {stats.dernieresEntrees.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-anthracite/50">
              Aucune entrée datée.
            </p>
          ) : (
            <ul>
              {stats.dernieresEntrees.map((e) => (
                <li
                  key={e.reference}
                  className="flex items-center gap-3 border-b border-or-clair/25 px-6 py-3 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-anthracite">
                      {e.designation}
                    </p>
                    <p className="font-mono text-xs text-anthracite/45">
                      {e.reference} · {formatDate(e.date)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-anthracite/70">
                    {formatGrammes(e.poids)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Dernières factures */}
      <section className="carte overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="font-titre text-xl font-semibold text-anthracite">
            Dernières factures
          </h2>
          <Link
            href="/factures"
            className="inline-flex items-center gap-1 text-sm text-or transition hover:gap-2"
          >
            Tout voir <ChevronRight className="size-4" />
          </Link>
        </div>
        <div className="filet-or" />
        {stats.dernieresFactures.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-anthracite/50">
            Aucune facture pour le moment.
          </p>
        ) : (
          <ul>
            {stats.dernieresFactures.map((f) => (
              <li key={f.numero}>
                <Link
                  href={`/factures/${f.numero}`}
                  className="flex items-center gap-4 px-6 py-4 transition hover:bg-or-soft/40"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-or-soft text-or-fonce">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-medium text-anthracite">
                      {f.numero}
                    </p>
                    <p className="truncate text-xs text-anthracite/50">
                      {f.clientNom} · {formatDate(f.date)}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums text-anthracite">
                    {formatDinar(f.total)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Carte résumé d'un poste de stock : pièces + grammage. */
function ResumeStock({
  libelle,
  poste,
  pastille,
}: {
  libelle: string;
  poste: PosteStock;
  pastille: string;
}) {
  return (
    <div className="rounded-xl border border-or-clair/50 bg-white/70 p-4">
      <div className="flex items-center gap-2">
        <span className={`size-3 rounded-full ${pastille}`} />
        <span className="text-sm font-medium text-anthracite">{libelle}</span>
      </div>
      <p className="mt-3 font-titre text-3xl font-semibold tracking-tight text-anthracite">
        {poste.nb}
        <span className="ml-1.5 text-sm font-normal text-anthracite/50">
          pièce{poste.nb > 1 ? "s" : ""}
        </span>
      </p>
      <p className="mt-1 text-sm tabular-nums text-or-fonce">
        {grammes(poste.grammes)}
      </p>
    </div>
  );
}
