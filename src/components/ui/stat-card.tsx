import type { LucideIcon } from "lucide-react";

/** Carte de statistique du tableau de bord. */
export function StatCard({
  label,
  valeur,
  detail,
  icone: Icone,
  accent = false,
}: {
  label: string;
  valeur: string;
  detail?: string;
  icone: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div className="carte carte-survol relative overflow-hidden p-5">
      {/* Halo doré décoratif */}
      <div className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-or/10 blur-2xl" />

      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        <span
          className={`flex size-10 items-center justify-center rounded-xl ${
            accent
              ? "bg-gradient-to-br from-or to-or-fonce text-white shadow-sm"
              : "bg-or-soft text-or-fonce"
          }`}
        >
          <Icone className="size-5" />
        </span>
      </div>

      <p
        className={`mt-4 font-titre text-3xl font-semibold tracking-tight ${
          accent ? "text-dore" : "text-anthracite"
        }`}
      >
        {valeur}
      </p>
      {detail && <p className="mt-1 text-xs text-anthracite/50">{detail}</p>}
    </div>
  );
}
