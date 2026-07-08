import type { PointMois } from "@/lib/queries/stats";

/*
  Graphiques légers en CSS/SVG (aucune dépendance JS type recharts).
  Rendus côté serveur → zéro JavaScript envoyé au navigateur : essentiel
  pour la fluidité sur mobile.
*/

const PALETTE = [
  "#c7a24b",
  "#d8bd7e",
  "#a8863a",
  "#e3cd8f",
  "#8a6a2f",
  "#b89a5a",
];

function grammes(v: number) {
  return `${v.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} g`;
}

/** Barres verticales : grammes par mois (entrées de stock). */
export function ChartGrammesMensuel({ data }: { data: PointMois[] }) {
  const max = Math.max(1, ...data.map((d) => d.grammes));
  return (
    <div className="flex h-[220px] items-end justify-between gap-2 pt-2">
      {data.map((d) => (
        <div
          key={d.mois}
          className="flex flex-1 flex-col items-center justify-end gap-2"
        >
          <span className="text-[0.65rem] tabular-nums text-anthracite/50">
            {d.grammes > 0
              ? Math.round(d.grammes).toLocaleString("fr-FR")
              : ""}
          </span>
          <div className="flex w-full justify-center">
            <div
              className="w-8 rounded-t-md bg-gradient-to-t from-or to-or-clair"
              style={{
                height: `${Math.max(2, (d.grammes / max) * 170)}px`,
              }}
            />
          </div>
          <span className="text-xs capitalize text-anthracite/60">
            {d.mois}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Anneau (donut) en conic-gradient + légende — répartition par carat. */
export function ChartDonutGrammes({
  data,
}: {
  data: { label: string; grammes: number }[];
}) {
  const total = data.reduce((s, d) => s + d.grammes, 0) || 1;
  let acc = 0;
  const stops = data
    .map((d, i) => {
      const start = (acc / total) * 360;
      acc += d.grammes;
      const end = (acc / total) * 360;
      return `${PALETTE[i % PALETTE.length]} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      {/* Anneau */}
      <div
        className="relative size-40 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops})` }}
      >
        <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-white text-center">
          <span className="font-titre text-lg font-semibold text-anthracite">
            {grammes(total)}
          </span>
          <span className="text-[0.65rem] uppercase tracking-wide text-anthracite/40">
            total
          </span>
        </div>
      </div>
      {/* Légende */}
      <ul className="space-y-2">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            <span className="font-medium text-anthracite">{d.label}</span>
            <span className="tabular-nums text-anthracite/60">
              {grammes(d.grammes)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
