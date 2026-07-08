"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, AlertTriangle } from "lucide-react";
import { FactureDocument } from "./facture-document";
import { BoutonImprimer } from "./bouton-imprimer";
import { BoutonEnregistrerPdf } from "./bouton-enregistrer-pdf";
import {
  creerFactureAction,
  type ResultatFacture,
} from "@/lib/actions/factures";
import { calculerTotaux, type FactureData } from "@/lib/facture";
import { formatDinar } from "@/lib/format";

export type ProduitOption = {
  id: string;
  reference: string;
  designation: string;
  stock: number;
};
export type ClientOption = {
  id: string;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  matriculeFiscal: string | null;
};

// Le prix est saisi à la main pour chaque ligne (cours de l'or variable).
type LigneEtat = { productId: string; quantite: number; prix: string };

export function FactureForm({
  produits,
  clients,
  dateDuJour,
  produitInitialId,
}: {
  produits: ProduitOption[];
  clients: ClientOption[];
  dateDuJour: string;
  produitInitialId?: string;
}) {
  const router = useRouter();
  const produitsMap = useMemo(
    () => Object.fromEntries(produits.map((p) => [p.id, p])),
    [produits],
  );

  // Ligne pré-remplie si on arrive depuis le pop-up « Vendu ».
  const [lignes, setLignes] = useState<LigneEtat[]>(
    produitInitialId && produitsMap[produitInitialId]
      ? [{ productId: produitInitialId, quantite: 1, prix: "" }]
      : [],
  );
  const [clientMode, setClientMode] = useState<"existant" | "nouveau">(
    clients.length ? "existant" : "nouveau",
  );
  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "");
  const [nc, setNc] = useState({ nom: "", adresse: "", telephone: "", mf: "" });
  const [remise, setRemise] = useState("0");
  const [etat, setEtat] = useState<ResultatFacture | null>(null);
  const [enCours, startTransition] = useTransition();

  // --- Manipulation des lignes ---
  function ajouterProduit(id: string) {
    if (!id) return;
    setLignes((ls) => {
      const i = ls.findIndex((l) => l.productId === id);
      if (i >= 0) {
        const copie = [...ls];
        copie[i] = { ...copie[i], quantite: copie[i].quantite + 1 };
        return copie;
      }
      // Quantité par défaut 1, prix vide à saisir.
      return [...ls, { productId: id, quantite: 1, prix: "" }];
    });
  }
  function changerQuantite(id: string, q: number) {
    setLignes((ls) =>
      ls.map((l) =>
        l.productId === id ? { ...l, quantite: Math.max(1, q) } : l,
      ),
    );
  }
  function changerPrix(id: string, prix: string) {
    setLignes((ls) =>
      ls.map((l) => (l.productId === id ? { ...l, prix } : l)),
    );
  }
  function retirer(id: string) {
    setLignes((ls) => ls.filter((l) => l.productId !== id));
  }

  // --- Données dérivées pour l'aperçu ---
  const remiseNum = Number(remise) || 0;
  const clientSel = clients.find((c) => c.id === clientId);

  const facture: FactureData = {
    numero: etat?.ok ? etat.numero : "Brouillon",
    date: dateDuJour,
    client:
      clientMode === "existant"
        ? {
            nom: clientSel?.nom ?? "—",
            adresse: clientSel?.adresse,
            telephone: clientSel?.telephone,
            matriculeFiscal: clientSel?.matriculeFiscal,
          }
        : {
            nom: nc.nom || "—",
            adresse: nc.adresse,
            telephone: nc.telephone,
            matriculeFiscal: nc.mf,
          },
    lignes: lignes.map((l) => {
      const p = produitsMap[l.productId];
      return {
        reference: p.reference,
        designation: p.designation,
        quantite: l.quantite,
        prixUnitaire: Number(l.prix) || 0,
      };
    }),
    remise: remiseNum,
  };

  const totaux = calculerTotaux(facture.lignes, remiseNum);

  const clientOk =
    clientMode === "existant" ? !!clientId : nc.nom.trim().length > 0;
  // Chaque ligne doit avoir un prix unitaire renseigné (> 0).
  const prixOk = lignes.every((l) => (Number(l.prix) || 0) > 0);
  const peutEnregistrer =
    lignes.length > 0 && clientOk && prixOk && !enCours;

  function enregistrer() {
    setEtat(null);
    startTransition(async () => {
      const res = await creerFactureAction({
        clientId: clientMode === "existant" ? clientId : null,
        nouveauClient:
          clientMode === "nouveau"
            ? {
                nom: nc.nom,
                adresse: nc.adresse,
                telephone: nc.telephone,
                matriculeFiscal: nc.mf,
              }
            : null,
        remise: remiseNum,
        lignes: lignes.map((l) => ({
          productId: l.productId,
          quantite: l.quantite,
          prixUnitaire: Number(l.prix) || 0,
        })),
      });
      setEtat(res);
      if (res.ok && !res.demo) {
        router.push(`/factures/${encodeURIComponent(res.numero)}`);
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Colonne gauche : client + paramètres */}
        <div className="space-y-6">
          {/* Client */}
          <section className="space-y-4 rounded-xl border border-or-clair/60 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-titre text-lg font-semibold">Client</h2>
              <div className="flex rounded-md border border-or-clair p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setClientMode("existant")}
                  className={`rounded px-3 py-1 transition ${clientMode === "existant" ? "bg-anthracite text-ivoire" : "text-anthracite/60"}`}
                >
                  Existant
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode("nouveau")}
                  className={`rounded px-3 py-1 transition ${clientMode === "nouveau" ? "bg-anthracite text-ivoire" : "text-anthracite/60"}`}
                >
                  Nouveau
                </button>
              </div>
            </div>

            {clientMode === "existant" ? (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className={inputClass}
              >
                {clients.length === 0 && <option value="">Aucun client</option>}
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Nom du client *"
                  value={nc.nom}
                  onChange={(e) => setNc({ ...nc, nom: e.target.value })}
                  className={`${inputClass} sm:col-span-2`}
                />
                <input
                  placeholder="Adresse"
                  value={nc.adresse}
                  onChange={(e) => setNc({ ...nc, adresse: e.target.value })}
                  className={`${inputClass} sm:col-span-2`}
                />
                <input
                  placeholder="Téléphone"
                  value={nc.telephone}
                  onChange={(e) => setNc({ ...nc, telephone: e.target.value })}
                  className={inputClass}
                />
                <input
                  placeholder="Matricule fiscal"
                  value={nc.mf}
                  onChange={(e) => setNc({ ...nc, mf: e.target.value })}
                  className={inputClass}
                />
              </div>
            )}
          </section>

          {/* Paramètres */}
          <section className="space-y-4 rounded-xl border border-or-clair/60 bg-white p-5">
            <h2 className="font-titre text-lg font-semibold">Paramètres</h2>
            <div className="grid gap-4">
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Remise (DT)</span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={remise}
                  onChange={(e) => setRemise(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </section>
        </div>

        {/* Colonne droite : produits */}
        <section className="space-y-4 rounded-xl border border-or-clair/60 bg-white p-5">
          <h2 className="font-titre text-lg font-semibold">Produits</h2>

          <div className="flex gap-2">
            <select
              value=""
              onChange={(e) => ajouterProduit(e.target.value)}
              className={`${inputClass} flex-1`}
            >
              <option value="">Ajouter un produit…</option>
              {produits.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.reference} — {p.designation}
                </option>
              ))}
            </select>
          </div>

          {lignes.length === 0 ? (
            <p className="rounded-md border border-dashed border-or-clair bg-ivoire/40 py-8 text-center text-sm text-anthracite/50">
              Aucun produit. Ajoutez-en depuis la liste ci-dessus.
            </p>
          ) : (
            <ul className="divide-y divide-or-clair/40">
              {lignes.map((l) => {
                const p = produitsMap[l.productId];
                const depasse = l.quantite > p.stock;
                const prixNum = Number(l.prix) || 0;
                return (
                  <li key={l.productId} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-anthracite">
                        {p.designation}
                      </p>
                      <p className="text-xs text-anthracite/50">
                        {p.reference}
                        {depasse && (
                          <span className="ml-2 inline-flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="size-3" />
                            stock {p.stock}
                          </span>
                        )}
                      </p>
                    </div>
                    <label className="flex flex-col items-center gap-0.5">
                      <span className="text-[0.65rem] uppercase tracking-wide text-anthracite/40">
                        Prix (DT)
                      </span>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={l.prix}
                        onChange={(e) =>
                          changerPrix(l.productId, e.target.value)
                        }
                        placeholder="0.000"
                        className="w-24 rounded-md border border-or-clair px-2 py-1.5 text-right text-sm outline-none focus:border-or"
                      />
                    </label>
                    <label className="flex flex-col items-center gap-0.5">
                      <span className="text-[0.65rem] uppercase tracking-wide text-anthracite/40">
                        Qté
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={l.quantite}
                        onChange={(e) =>
                          changerQuantite(l.productId, Number(e.target.value))
                        }
                        className="w-16 rounded-md border border-or-clair px-2 py-1.5 text-center text-sm outline-none focus:border-or"
                      />
                    </label>
                    <span className="w-28 text-right text-sm font-medium tabular-nums">
                      {formatDinar(prixNum * l.quantite)}
                    </span>
                    <button
                      type="button"
                      onClick={() => retirer(l.productId)}
                      aria-label="Retirer"
                      className="rounded p-1 text-anthracite/40 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Totaux */}
          <div className="space-y-1.5 border-t border-or-clair/50 pt-4 text-sm">
            <Ligne label="Sous-total" valeur={formatDinar(totaux.sousTotal)} />
            {remiseNum > 0 && (
              <Ligne label="Remise" valeur={`− ${formatDinar(remiseNum)}`} />
            )}
            <div className="flex items-center justify-between border-t border-or-clair/50 pt-2 font-titre text-base font-semibold">
              <span>Total à régler</span>
              <span className="tabular-nums">{formatDinar(totaux.total)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Messages */}
      {etat && !etat.ok && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {etat.erreur}
        </p>
      )}
      {etat?.ok && (
        <p className="flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
          <Check className="size-4" />
          {etat.demo
            ? "Facture simulée (mode démo) — branchez la vraie base pour l'enregistrer et générer le numéro séquentiel."
            : `Facture ${etat.numero} enregistrée.`}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-or-clair/50 pt-5 sans-impression">
        <BoutonImprimer />
        {lignes.length > 0 && <BoutonEnregistrerPdf facture={facture} />}
        <button
          type="button"
          onClick={enregistrer}
          disabled={!peutEnregistrer}
          className="btn-sombre disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" />
          {enCours ? "Enregistrement…" : "Enregistrer la facture"}
        </button>
      </div>

      {/* Aperçu en direct */}
      <div>
        <h2 className="mb-3 font-titre text-lg font-semibold text-anthracite sans-impression">
          Aperçu
        </h2>
        <div className="overflow-x-auto pb-4">
          <FactureDocument facture={facture} />
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-or-clair bg-white px-3 py-2 text-sm outline-none transition focus:border-or focus:ring-2 focus:ring-or/30";
const labelClass =
  "text-xs font-medium uppercase tracking-wide text-anthracite/50";

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex items-center justify-between text-anthracite/80">
      <span>{label}</span>
      <span className="tabular-nums">{valeur}</span>
    </div>
  );
}
