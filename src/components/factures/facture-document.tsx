import { Phone, Mail, MapPin, Globe } from "lucide-react";
import { LogoImg } from "./logo-img";
import { bijouterie } from "@/lib/config";
import { calculerTotaux, type FactureData } from "@/lib/facture";
import { formatDinar, formatDate } from "@/lib/format";

/**
 * Feuille de facture A4 reproduisant le letterhead « Youssef Bouzid Bijoux » :
 * en-tête « FACTURE À » + logo, filigrane central, tableau des produits,
 * totaux (prix à régler), encadré signature et bandeau doré de contact.
 *
 * Composant purement présentationnel (imprimable / exportable en PDF).
 */
export function FactureDocument({ facture }: { facture: FactureData }) {
  const t = calculerTotaux(facture.lignes, facture.remise);

  return (
    <div className="facture-sheet relative mx-auto flex min-h-[297mm] w-[210mm] flex-col bg-white text-anthracite shadow-lg">
      {/* Filigrane central (vrai logo, très atténué) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <LogoImg largeur={460} className="opacity-[0.07]" />
      </div>

      {/* Contenu */}
      <div className="relative z-10 flex flex-1 flex-col px-12 pt-10">
        {/* En-tête : FACTURE À / logo */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-sans text-4xl font-extrabold tracking-tight">
              FACTURE À
            </h1>
            <div className="mt-3 space-y-0.5 text-sm text-anthracite/80">
              <p className="text-base font-semibold text-anthracite">
                {facture.client.nom}
              </p>
              {facture.client.adresse && <p>{facture.client.adresse}</p>}
              {facture.client.telephone && <p>{facture.client.telephone}</p>}
              {facture.client.matriculeFiscal && (
                <p>M.F. : {facture.client.matriculeFiscal}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end">
            <LogoImg largeur={200} priority />
            <div className="mt-4 text-right text-sm">
              <p>
                <span className="text-anthracite/50">Facture N° </span>
                <span className="font-semibold">{facture.numero}</span>
              </p>
              <p>
                <span className="text-anthracite/50">Date : </span>
                <span className="font-semibold">{formatDate(facture.date)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tableau des produits */}
        <div className="mt-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-or-logo/70 text-left text-xs uppercase tracking-wider text-anthracite/60">
                <th className="py-2 pr-3 font-semibold">Désignation</th>
                <th className="w-16 py-2 px-3 text-center font-semibold">Qté</th>
                <th className="w-32 py-2 px-3 text-right font-semibold">
                  Prix unitaire
                </th>
                <th className="w-32 py-2 pl-3 text-right font-semibold">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody>
              {facture.lignes.map((l, i) => (
                <tr key={i} className="border-b border-or-logo/20 align-top">
                  <td className="py-3 pr-3">
                    <p className="font-medium text-anthracite">
                      {l.designation}
                    </p>
                    {l.reference && (
                      <p className="font-mono text-xs text-anthracite/45">
                        {l.reference}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">{l.quantite}</td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatDinar(l.prixUnitaire)}
                  </td>
                  <td className="py-3 pl-3 text-right font-medium tabular-nums">
                    {formatDinar(l.quantite * l.prixUnitaire)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaux */}
          <div className="mt-6 flex justify-end">
            <div className="w-72 space-y-1.5 text-sm">
              <Ligne label="Sous-total" valeur={formatDinar(t.sousTotal)} />
              {facture.remise > 0 && (
                <Ligne
                  label="Remise"
                  valeur={`− ${formatDinar(facture.remise)}`}
                />
              )}
              <div className="mt-2 flex items-center justify-between rounded-md bg-or-logo/15 px-4 py-3">
                <span className="font-titre text-base font-semibold">
                  TOTAL À RÉGLER
                </span>
                <span className="font-titre text-xl font-bold tabular-nums">
                  {formatDinar(t.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Signature et cachet */}
        <div className="mt-auto flex justify-end pb-8 pt-10">
          <div className="w-72">
            <p className="mb-2 text-right text-sm font-semibold uppercase tracking-wide text-anthracite/80">
              Signature et cachet
            </p>
            <div className="h-36 rounded-md border border-anthracite/30" />
          </div>
        </div>

        {/* Mention légale (matricule fiscal) */}
        {bijouterie.matriculeFiscal && (
          <p className="pb-2 text-center text-[0.7rem] text-or-logo/80">
            Matricule fiscal : {bijouterie.matriculeFiscal}
          </p>
        )}
      </div>

      {/* Bandeau doré de contact */}
      <footer className="relative z-10 bg-gradient-to-r from-[#b5934c] via-[#c2a45f] to-[#d0b878] px-12 py-5 text-white">
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <Contact icone={Phone} texte={bijouterie.tel} />
          <Contact icone={MapPin} texte={bijouterie.adresse} />
          <Contact icone={Mail} texte={bijouterie.email} />
          <Contact icone={Globe} texte={bijouterie.site} />
        </div>
      </footer>
    </div>
  );
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex items-center justify-between text-anthracite/80">
      <span>{label}</span>
      <span className="tabular-nums">{valeur}</span>
    </div>
  );
}

function Contact({
  icone: Icone,
  texte,
}: {
  icone: typeof Phone;
  texte: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full ring-1 ring-white/70">
        <Icone className="size-3.5" />
      </span>
      <span>{texte}</span>
    </div>
  );
}
