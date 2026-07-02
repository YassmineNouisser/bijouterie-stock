import { Hammer } from "lucide-react";

/** Écran provisoire pour les sections pas encore développées. */
export function EnConstruction({
  titre,
  description,
}: {
  titre: string;
  description: string;
}) {
  return (
    <div className="space-y-7">
      <h1 className="font-titre text-[2rem] font-semibold tracking-tight text-anthracite">
        {titre}
      </h1>
      <div className="carte flex flex-col items-center gap-4 py-24 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-or-soft to-creme text-or-fonce shadow-sm">
          <Hammer className="size-6" />
        </div>
        <p className="max-w-md text-anthracite/55">{description}</p>
        <span className="rounded-full bg-or/10 px-3.5 py-1 text-xs font-medium tracking-wide text-or-fonce">
          Bientôt disponible
        </span>
      </div>
    </div>
  );
}
