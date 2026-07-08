"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Pencil,
  Plus,
  Gem,
  QrCode,
  Trash2,
  ShoppingBag,
  RotateCcw,
  FileText,
  X,
} from "lucide-react";
import type { Produit, Matiere } from "@/lib/queries/produits";
import { supprimerProduit, basculerVendu } from "@/lib/actions/produits";
import { statutStock, badgeStatut } from "@/lib/stock";
import { formatGrammes, formatDate } from "@/lib/format";

/**
 * Poids affiché : pour un ensemble (plusieurs pièces), le champ `pierres`
 * contient l'opération (« 36,4 + 7,4 ») → on montre « opération = total ».
 */
function poidsAffiche(p: Produit): string {
  const total = formatGrammes(p.poids_grammes);
  if (p.pierres && p.pierres.includes("+")) return `${p.pierres} = ${total}`;
  return total;
}

/**
 * Liste paginée CÔTÉ SERVEUR : ne reçoit qu'une page (~12 lignes). Les filtres
 * (matière, recherche, page) passent par l'URL → le serveur renvoie la page
 * suivante. Léger pour le mobile (on n'envoie jamais tout le catalogue).
 */
export function ProduitsListe({
  rows,
  comptes,
  total,
  matiere,
  q,
  page,
  parPage,
  estAdmin,
}: {
  rows: Produit[];
  comptes: { or: number; argent: number };
  total: number;
  matiere: Matiere;
  q: string;
  page: number;
  parPage: number;
  estAdmin: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [nav, demarrerNav] = useTransition();
  const [suppression, demarrerSuppression] = useTransition();
  const [vente, demarrerVente] = useTransition();
  const [recherche, setRecherche] = useState(q);
  const [venduPopup, setVenduPopup] = useState<{
    id: string;
    designation: string;
    reference: string;
  } | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / parPage));
  const pageCourante = Math.min(Math.max(1, page), totalPages);

  function lien(m: Matiere, qq: string, p: number): string {
    const sp = new URLSearchParams();
    if (m === "argent") sp.set("matiere", "argent");
    if (qq.trim()) sp.set("q", qq.trim());
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `${pathname}?${s}` : pathname;
  }
  function aller(url: string) {
    demarrerNav(() => router.push(url));
  }

  // Recherche : on attend 350 ms après la frappe avant de recharger la page.
  useEffect(() => {
    const t = setTimeout(() => {
      if (recherche.trim() !== q) aller(lien(matiere, recherche, 1));
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche]);

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

  function marquerVendu(p: Produit) {
    demarrerVente(async () => {
      const res = await basculerVendu(p.id, true);
      if (res.ok) {
        setVenduPopup({
          id: p.id,
          designation: p.designation,
          reference: p.reference,
        });
        router.refresh();
      } else window.alert(res.erreur ?? "Opération impossible.");
    });
  }

  function remettreEnStock(p: Produit) {
    demarrerVente(async () => {
      const res = await basculerVendu(p.id, false);
      if (res.ok) router.refresh();
      else window.alert(res.erreur ?? "Opération impossible.");
    });
  }

  return (
    <div className="space-y-5">
      {/* Onglets matière : Or / Argent */}
      <div className="inline-flex gap-1 rounded-full border border-or-clair/60 bg-white p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <OngletMatiere
          actif={matiere === "or"}
          onClick={() => aller(lien("or", recherche, 1))}
          libelle="Or"
          compte={comptes.or}
        />
        <OngletMatiere
          actif={matiere === "argent"}
          onClick={() => aller(lien("argent", recherche, 1))}
          libelle="Argent"
          compte={comptes.argent}
        />
      </div>

      {/* Recherche */}
      <div className="carte p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-anthracite/40" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une référence ou une désignation…"
            className="w-full rounded-md border border-or-clair bg-ivoire/40 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-or focus:ring-2 focus:ring-or/30"
          />
        </div>
      </div>

      {/* Compteur */}
      <p className="text-xs uppercase tracking-[0.15em] text-anthracite/40">
        {total} pièce{total > 1 ? "s" : ""}
      </p>

      <div className={nav ? "opacity-50 transition-opacity" : ""}>
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
              {rows.map((p) => {
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
                      <div className="flex items-center justify-end gap-1 opacity-80 transition duration-200 group-hover:opacity-100">
                        {p.quantite_stock > 0 ? (
                          <button
                            type="button"
                            onClick={() => marquerVendu(p)}
                            disabled={vente}
                            className="inline-flex items-center gap-1.5 rounded-full bg-anthracite px-3 py-1.5 text-xs font-medium text-ivoire transition hover:bg-anthracite-doux disabled:opacity-50"
                          >
                            <ShoppingBag className="size-3.5" />
                            Vendu
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => remettreEnStock(p)}
                            disabled={vente}
                            title="Remettre en stock"
                            className="inline-flex items-center gap-1.5 rounded-full border border-or-clair px-3 py-1.5 text-xs font-medium text-anthracite/60 transition hover:border-or hover:text-or disabled:opacity-50"
                          >
                            <RotateCcw className="size-3.5" />
                            Remettre
                          </button>
                        )}
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
          {rows.map((p) => {
            const statut = statutStock(p.quantite_stock, p.seuil_alerte);
            const badge = badgeStatut[statut];
            return (
              <div key={p.id} className="carte carte-survol p-4">
                <Link href={`/produits/${p.id}`} className="flex gap-3.5">
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
                <div className="mt-3 flex justify-end border-t border-or-clair/30 pt-3">
                  {p.quantite_stock > 0 ? (
                    <button
                      type="button"
                      onClick={() => marquerVendu(p)}
                      disabled={vente}
                      className="inline-flex items-center gap-1.5 rounded-full bg-anthracite px-4 py-1.5 text-xs font-medium text-ivoire transition hover:bg-anthracite-doux disabled:opacity-50"
                    >
                      <ShoppingBag className="size-3.5" />
                      Vendu
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => remettreEnStock(p)}
                      disabled={vente}
                      className="inline-flex items-center gap-1.5 rounded-full border border-or-clair px-4 py-1.5 text-xs font-medium text-anthracite/60 transition hover:border-or hover:text-or disabled:opacity-50"
                    >
                      <RotateCcw className="size-3.5" />
                      Remettre en stock
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vide */}
      {total === 0 && (
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
            onClick={() => aller(lien(matiere, recherche, pageCourante - 1))}
            disabled={pageCourante === 1 || nav}
            className="rounded-full border border-or-clair/70 bg-white px-4 py-1.5 text-sm text-anthracite/70 transition hover:border-or hover:text-or disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-xs uppercase tracking-[0.15em] text-anthracite/50">
            Page {pageCourante} / {totalPages}
          </span>
          <button
            onClick={() => aller(lien(matiere, recherche, pageCourante + 1))}
            disabled={pageCourante === totalPages || nav}
            className="rounded-full border border-or-clair/70 bg-white px-4 py-1.5 text-sm text-anthracite/70 transition hover:border-or hover:text-or disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Pop-up après « Vendu » : proposer d'aller à la facture pré-remplie */}
      {venduPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-anthracite/50"
            onClick={() => setVenduPopup(null)}
          />
          <div className="relative w-full max-w-sm carte p-6 text-center">
            <button
              type="button"
              onClick={() => setVenduPopup(null)}
              aria-label="Fermer"
              className="absolute right-3 top-3 rounded-full p-1.5 text-anthracite/40 transition hover:bg-ivoire hover:text-anthracite"
            >
              <X className="size-4" />
            </button>
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
              <ShoppingBag className="size-5" />
            </span>
            <h3 className="mt-4 font-titre text-lg font-semibold text-anthracite">
              Produit marqué vendu
            </h3>
            <p className="mt-1 text-sm text-anthracite/60">
              «&nbsp;{venduPopup.designation}&nbsp;» ({venduPopup.reference}) est
              sorti du stock. Veux-tu établir la facture&nbsp;?
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  const cible = `/factures/nouvelle?produit=${encodeURIComponent(
                    venduPopup.id,
                  )}`;
                  setVenduPopup(null);
                  router.push(cible);
                }}
                className="btn-or w-full"
              >
                <FileText className="size-4" />
                Aller à la facture
              </button>
              <button
                type="button"
                onClick={() => setVenduPopup(null)}
                className="w-full rounded-full px-5 py-2.5 text-sm text-anthracite/60 transition hover:text-anthracite"
              >
                Plus tard
              </button>
            </div>
          </div>
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
function Vignette({ url, taille }: { url: string | null; taille: string }) {
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
