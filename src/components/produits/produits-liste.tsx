"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Pencil, Plus, Gem, QrCode, Trash2 } from "lucide-react";
import type { Produit } from "@/lib/queries/produits";
import { supprimerProduit } from "@/lib/actions/produits";
import { statutStock, badgeStatut } from "@/lib/stock";
import { formatGrammes, formatDate } from "@/lib/format";

type FiltreStock = "tous" | "disponible" | "alerte" | "rupture";
type Matiere = "or" | "argent";
const PAR_PAGE = 8;

/** Or par défaut : tout ce qui n'est pas explicitement « argent ». */
function matiereDe(p: Produit): Matiere {
  return p.matiere === "argent" ? "argent" : "or";
}

/**
 * Poids affiché : pour un ensemble (plusieurs pièces), le champ `pierres`
 * contient l'opération (« 36,4 + 7,4 ») → on montre « opération = total ».
 */
function poidsAffiche(p: Produit): string {
  const total = formatGrammes(p.poids_grammes);
  if (p.pierres && p.pierres.includes("+")) return `${p.pierres} = ${total}`;
  return total;
}

export function ProduitsListe({
  produits,
  estAdmin,
}: {
  produits: Produit[];
  estAdmin: boolean;
}) {
  const [matiere, setMatiere] = useState<Matiere>("or");
  const [recherche, setRecherche] = useState("");
  const [filtreStock, setFiltreStock] = useState<FiltreStock>("tous");
  const [page, setPage] = useState(1);

  // Nombre de produits par matière (indépendant des autres filtres).
  const comptes = useMemo(() => {
    let or = 0;
    let argent = 0;
    for (const p of produits) matiereDe(p) === "argent" ? argent++ : or++;
    return { or, argent };
  }, [produits]);

  const router = useRouter();
  const [suppression, demarrerSuppression] = useTransition();

  function supprimer(p: Produit) {
    if (
      !window.confirm(
        `Supprimer définitivement « ${p.designation} » (${p.reference}) ?\nCette action est irréversible.`,
      )
    )
      return;
    demarrerSuppression(async () => {
      const res = await supprimerProduit(p.id);
      if (res.ok) router.refresh();
      else window.alert(res.erreur ?? "Suppression impossible.");
    });
  }

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return produits.filter((p) => {
      if (matiereDe(p) !== matiere) return false;
      if (
        q &&
        !p.reference.toLowerCase().includes(q) &&
        !p.designation.toLowerCase().includes(q)
      )
        return false;
      if (filtreStock !== "tous") {
        if (statutStock(p.quantite_stock, p.seuil_alerte) !== filtreStock)
          return false;
      }
      return true;
    });
  }, [produits, matiere, recherche, filtreStock]);

  const totalPages = Math.max(1, Math.ceil(filtres.length / PAR_PAGE));
  const pageCourante = Math.min(page, totalPages);
  const visibles = filtres.slice(
    (pageCourante - 1) * PAR_PAGE,
    pageCourante * PAR_PAGE,
  );

  // Réinitialise la pagination à chaque changement de filtre.
  function changer<T>(setter: (v: T) => void, valeur: T) {
    setter(valeur);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      {/* Onglets matière : Or / Argent */}
      <div className="inline-flex gap-1 rounded-full border border-or-clair/60 bg-white/60 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur">
        <OngletMatiere
          actif={matiere === "or"}
          onClick={() => changer(setMatiere, "or")}
          libelle="Or"
          compte={comptes.or}
        />
        <OngletMatiere
          actif={matiere === "argent"}
          onClick={() => changer(setMatiere, "argent")}
          libelle="Argent"
          compte={comptes.argent}
        />
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-col gap-3 carte p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-anthracite/40" />
          <input
            value={recherche}
            onChange={(e) => changer(setRecherche, e.target.value)}
            placeholder="Rechercher une référence ou une désignation…"
            className="w-full rounded-md border border-or-clair bg-ivoire/40 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-or focus:ring-2 focus:ring-or/30"
          />
        </div>

        <select
          value={filtreStock}
          onChange={(e) => changer(setFiltreStock, e.target.value as FiltreStock)}
          className="rounded-md border border-or-clair bg-white px-3 py-2 text-sm outline-none focus:border-or"
        >
          <option value="tous">Tout le stock</option>
          <option value="disponible">Disponible</option>
          <option value="alerte">Stock faible</option>
          <option value="rupture">Rupture</option>
        </select>
      </div>

      {/* Compteur */}
      <p className="text-xs uppercase tracking-[0.15em] text-anthracite/40">
        {filtres.length} pièce{filtres.length > 1 ? "s" : ""}
      </p>

      {/* Table (bureau) */}
      <div className="hidden overflow-hidden carte md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-or-clair/50 bg-gradient-to-r from-ivoire/80 via-creme/50 to-ivoire/80 text-left text-[0.66rem] uppercase tracking-[0.18em] text-or-fonce/75">
              <th className="px-6 py-4 font-semibold">Référence</th>
              <th className="px-6 py-4 font-semibold">Désignation</th>
              <th className="px-6 py-4 font-semibold">Poids</th>
              <th className="px-6 py-4 font-semibold">Entrée</th>
              <th className="px-6 py-4 font-semibold">Stock</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {visibles.map((p) => {
              const statut = statutStock(p.quantite_stock, p.seuil_alerte);
              const badge = badgeStatut[statut];
              return (
                <tr
                  key={p.id}
                  className="group border-b border-or-clair/20 transition-colors duration-200 last:border-0 odd:bg-white even:bg-ivoire/35 hover:bg-or-soft/50"
                >
                  <td className="relative px-6 py-5">
                    <span className="absolute left-0 top-1/2 h-9 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-or-clair to-or opacity-0 transition duration-200 group-hover:opacity-100" />
                    <span className="rounded-md bg-white px-2.5 py-1 font-mono text-xs text-anthracite/55 ring-1 ring-or-clair/50">
                      {p.reference}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Vignette url={p.image_url} taille="size-14" />
                      <div>
                        <span className="font-titre text-base font-medium text-anthracite">
                          {p.designation}
                        </span>
                        {p.carat && (
                          <span className="ml-2 text-xs font-medium italic text-or">
                            {p.matiere} {p.carat}k
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 tabular-nums text-anthracite/75">
                    {poidsAffiche(p)}
                  </td>
                  <td className="px-6 py-5 text-anthracite/55">
                    {formatDate(p.date_entree)}
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${badge.classe}`}
                    >
                      <span className="size-1.5 rounded-full bg-current opacity-70" />
                      {badge.libelle}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-1 opacity-70 transition duration-200 group-hover:opacity-100">
                      <Link
                        href={`/produits/${p.id}/etiquette`}
                        title="Étiquette / QR"
                        aria-label="Étiquette / QR"
                        className="inline-flex size-8 items-center justify-center rounded-full text-anthracite/55 transition hover:bg-white hover:text-or hover:shadow-sm"
                      >
                        <QrCode className="size-4" />
                      </Link>
                      <Link
                        href={`/produits/${p.id}`}
                        title="Modifier"
                        aria-label="Modifier"
                        className="inline-flex size-8 items-center justify-center rounded-full text-anthracite/55 transition hover:bg-white hover:text-or hover:shadow-sm"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      {estAdmin && (
                        <button
                          type="button"
                          onClick={() => supprimer(p)}
                          disabled={suppression}
                          title="Supprimer"
                          aria-label="Supprimer"
                          className="inline-flex size-8 items-center justify-center rounded-full text-anthracite/55 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cartes (mobile) */}
      <div className="space-y-3 md:hidden">
        {visibles.map((p) => {
          const statut = statutStock(p.quantite_stock, p.seuil_alerte);
          const badge = badgeStatut[statut];
          return (
            <Link
              key={p.id}
              href={`/produits/${p.id}`}
              className="flex gap-3.5 carte carte-survol p-4"
            >
              <Vignette url={p.image_url} taille="size-14" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-medium text-anthracite">
                    {p.designation}
                  </p>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classe}`}
                  >
                    <span className="size-1.5 rounded-full bg-current opacity-70" />
                    {badge.libelle}
                  </span>
                </div>
                <p className="font-mono text-xs text-anthracite/50">
                  {p.reference}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-anthracite/50 tabular-nums">
                    {poidsAffiche(p)}
                  </span>
                  <span className="text-xs text-anthracite/50">
                    Stock : {p.quantite_stock}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Vide */}
      {filtres.length === 0 && (
        <div className="rounded-xl border border-dashed border-or-clair bg-white py-16 text-center text-anthracite/50">
          <p>Aucun produit ne correspond à ces critères.</p>
          <Link
            href="/produits/nouveau"
            className="mt-3 inline-flex items-center gap-1 text-sm text-or hover:underline"
          >
            <Plus className="size-4" /> Ajouter un produit
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pageCourante === 1}
            className="rounded-full border border-or-clair/70 bg-white px-4 py-1.5 text-sm text-anthracite/70 transition hover:border-or hover:text-or disabled:opacity-40 disabled:hover:border-or-clair/70 disabled:hover:text-anthracite/70"
          >
            Précédent
          </button>
          <span className="text-xs uppercase tracking-[0.15em] text-anthracite/50">
            Page {pageCourante} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={pageCourante === totalPages}
            className="rounded-full border border-or-clair/70 bg-white px-4 py-1.5 text-sm text-anthracite/70 transition hover:border-or hover:text-or disabled:opacity-40 disabled:hover:border-or-clair/70 disabled:hover:text-anthracite/70"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

/** Onglet de sélection de matière (Or / Argent) avec pastille et compteur. */
function OngletMatiere({
  actif,
  onClick,
  libelle,
  compte,
}: {
  actif: boolean;
  onClick: () => void;
  libelle: string;
  compte: number;
}) {
  // Pastille : dégradé or ou argent selon la matière.
  const pastille =
    libelle === "Or"
      ? "bg-gradient-to-br from-[#e9d29a] to-[#c7a24b]"
      : "bg-gradient-to-br from-[#e9e9ee] to-[#b9bcc4]";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition duration-300 ${
        actif
          ? "bg-white text-anthracite shadow-[0_6px_16px_-8px_rgba(150,115,40,0.55)] ring-1 ring-or-clair"
          : "text-anthracite/45 hover:text-anthracite"
      }`}
    >
      <span
        className={`size-2.5 rounded-full ${pastille} ${actif ? "" : "opacity-50"}`}
      />
      {libelle}
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          actif ? "chip-or" : "bg-anthracite/5 text-anthracite/40"
        }`}
      >
        {compte}
      </span>
    </button>
  );
}

/** Miniature produit : photo si disponible, sinon écrin doré avec icône. */
function Vignette({
  url,
  taille,
}: {
  url: string | null;
  taille: string;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={`${taille} shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-or-clair/60`}
      />
    );
  }
  return (
    <div
      className={`flex ${taille} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ivoire to-creme text-or/60 shadow-inner ring-1 ring-or-clair/50`}
    >
      <Gem className="size-4" />
    </div>
  );
}
