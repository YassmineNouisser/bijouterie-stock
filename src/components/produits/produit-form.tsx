"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ImagePlus, Check, Loader2, X } from "lucide-react";
import {
  enregistrerProduit,
  type EtatProduit,
} from "@/lib/actions/produits";
import { createClient } from "@/lib/supabase/client";
import type { Produit } from "@/lib/queries/produits";

const carats = [18, 21, 24];

export function ProduitForm({
  produit,
  categories,
  estAdmin,
  demo,
}: {
  produit?: Produit;
  categories: string[];
  estAdmin: boolean;
  demo: boolean;
}) {
  const action = enregistrerProduit.bind(null, produit?.id ?? null);
  const [etat, formAction, enCours] = useActionState<EtatProduit, FormData>(
    action,
    undefined,
  );

  // L'image est uploadée directement vers Supabase Storage depuis le
  // navigateur (on n'envoie que l'URL à la Server Action → pas de limite 1 Mo).
  const [imageUrl, setImageUrl] = useState(produit?.image_url ?? "");
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [uploadErreur, setUploadErreur] = useState<string | null>(null);

  async function onFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setUploadErreur(null);

    if (fichier.size > 5 * 1024 * 1024) {
      setUploadErreur("Image trop lourde (5 Mo maximum).");
      return;
    }

    // Mode démo : aperçu local uniquement, rien n'est envoyé.
    if (demo) {
      setImageUrl(URL.createObjectURL(fichier));
      return;
    }

    setUploadEnCours(true);
    try {
      const supabase = createClient();
      const ext = fichier.name.split(".").pop() || "jpg";
      const chemin = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("produits")
        .upload(chemin, fichier, { contentType: fichier.type });
      if (error) {
        setUploadErreur("Upload impossible : " + error.message);
        return;
      }
      const { data } = supabase.storage.from("produits").getPublicUrl(chemin);
      setImageUrl(data.publicUrl);
    } finally {
      setUploadEnCours(false);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {etat?.ok && (
        <p className="flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
          <Check className="size-4" />
          Produit enregistré{demo ? " (simulé — mode démo)" : ""}.
        </p>
      )}
      {etat?.erreur && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {etat.erreur}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">
          <Section titre="Identification">
            <div className="grid gap-4 sm:grid-cols-2">
              <Champ label="Référence *">
                <input
                  name="reference"
                  required
                  defaultValue={produit?.reference}
                  placeholder="BG-001"
                  className={inputClass}
                />
              </Champ>
              <Champ label="Catégorie">
                <select
                  name="categorie"
                  defaultValue={produit?.categorie ?? ""}
                  className={inputClass}
                >
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Champ>
            </div>
            <Champ label="Désignation *">
              <input
                name="designation"
                required
                defaultValue={produit?.designation}
                placeholder="Bague solitaire diamant"
                className={inputClass}
              />
            </Champ>
          </Section>

          <Section titre="Caractéristiques">
            <div className="grid gap-4 sm:grid-cols-3">
              <Champ label="Matière">
                <input
                  name="matiere"
                  defaultValue={produit?.matiere ?? ""}
                  placeholder="or, argent…"
                  className={inputClass}
                />
              </Champ>
              <Champ label="Carat">
                <select
                  name="carat"
                  defaultValue={produit?.carat ?? ""}
                  className={inputClass}
                >
                  <option value="">—</option>
                  {carats.map((k) => (
                    <option key={k} value={k}>
                      {k} carats
                    </option>
                  ))}
                </select>
              </Champ>
              <Champ label="Poids (g)">
                <input
                  name="poids_grammes"
                  type="number"
                  step="0.001"
                  defaultValue={produit?.poids_grammes ?? ""}
                  placeholder="3.500"
                  className={inputClass}
                />
              </Champ>
            </div>
            <Champ label="Pierres">
              <input
                name="pierres"
                defaultValue={produit?.pierres ?? ""}
                placeholder="1 diamant 0,30 ct"
                className={inputClass}
              />
            </Champ>
          </Section>

          <Section titre="Stock">
            <div className="grid gap-4 sm:grid-cols-2">
              {estAdmin && (
                <Champ label="Coût d'achat (DT) · admin">
                  <input
                    name="cout_achat"
                    type="number"
                    step="0.001"
                    defaultValue={produit?.cout_achat ?? ""}
                    placeholder="1800.000"
                    className={inputClass}
                  />
                </Champ>
              )}
              <Champ label="Quantité en stock">
                <input
                  name="quantite_stock"
                  type="number"
                  defaultValue={produit?.quantite_stock ?? 0}
                  className={inputClass}
                />
              </Champ>
              <Champ label="Seuil d'alerte">
                <input
                  name="seuil_alerte"
                  type="number"
                  defaultValue={produit?.seuil_alerte ?? 0}
                  className={inputClass}
                />
              </Champ>
              <Champ label="Date d'entrée en stock">
                <input
                  name="date_entree"
                  type="date"
                  defaultValue={produit?.date_entree ?? ""}
                  className={inputClass}
                />
              </Champ>
            </div>
          </Section>
        </div>

        {/* Colonne latérale : photo + statut */}
        <div className="space-y-6">
          <Section titre="Photo">
            {/* Seule l'URL est envoyée à la Server Action (champ caché). */}
            <input type="hidden" name="image_url" value={imageUrl} />

            {imageUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Aperçu du produit"
                  className="aspect-square w-full rounded-lg border border-or-clair/60 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  aria-label="Retirer la photo"
                  className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white transition hover:bg-black/75"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-or-clair bg-ivoire/40 text-anthracite/50 transition hover:border-or hover:text-or">
                {uploadEnCours ? (
                  <Loader2 className="size-8 animate-spin" />
                ) : (
                  <ImagePlus className="size-8" />
                )}
                <span className="text-sm">
                  {uploadEnCours ? "Envoi en cours…" : "Ajouter une photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFichier}
                  disabled={uploadEnCours}
                  className="hidden"
                />
              </label>
            )}

            {uploadErreur && (
              <p className="text-xs text-red-600">{uploadErreur}</p>
            )}
            {demo && (
              <p className="text-xs text-anthracite/40">
                Mode démo : aperçu local, l&apos;image n&apos;est pas enregistrée.
              </p>
            )}
          </Section>

          <Section titre="Statut">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-anthracite">Produit actif</span>
              <input
                type="checkbox"
                name="actif"
                defaultChecked={produit?.actif ?? true}
                className="size-5 accent-or"
              />
            </label>
          </Section>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-or-clair/50 pt-5">
        <Link
          href="/produits"
          className="rounded-md px-4 py-2.5 text-sm text-anthracite/60 transition hover:text-anthracite"
        >
          Annuler
        </Link>
        <button
          type="submit"
          disabled={enCours}
          className="btn-sombre disabled:opacity-60"
        >
          {enCours ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-or-clair bg-white px-3 py-2 text-sm outline-none transition focus:border-or focus:ring-2 focus:ring-or/30";

function Section({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-or-clair/60 bg-white p-5">
      <h2 className="font-titre text-lg font-semibold text-anthracite">
        {titre}
      </h2>
      {children}
    </section>
  );
}

function Champ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-anthracite/50">
        {label}
      </span>
      {children}
    </label>
  );
}
