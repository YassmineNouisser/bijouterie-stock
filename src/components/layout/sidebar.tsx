"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { liensNav } from "./nav";
import { LogoutButton } from "./logout-button";
import { LogoImg } from "@/components/factures/logo-img";
import type { Role } from "@/lib/auth";

type Props = {
  nom: string;
  role: Role;
};

/**
 * Navigation latérale responsive.
 * - Bureau (md+) : barre fixe à gauche.
 * - Mobile : barre supérieure + menu coulissant.
 */
export function Sidebar({ nom, role }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const pathname = usePathname();

  const contenu = (
    <div className="relative flex h-full flex-col bg-gradient-to-b from-[#1a1917] to-anthracite-900 text-ivoire">
      {/* Liseré doré supérieur */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-or/60 to-transparent" />

      {/* Marque (logo en blanc sur fond sombre) */}
      <div className="flex justify-center px-5 pb-6 pt-7">
        <LogoImg largeur={148} priority className="brightness-0 invert" />
      </div>
      <div className="mx-5 filet-or opacity-40" />

      {/* Liens */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {liensNav.map(({ href, libelle, icone: Icone }) => {
          const actif = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOuvert(false)}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                actif
                  ? "bg-gradient-to-r from-or/20 to-or/[0.04] text-or"
                  : "text-ivoire/60 hover:bg-white/[0.04] hover:text-ivoire"
              }`}
            >
              {actif && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-or" />
              )}
              <Icone
                className={`size-[1.05rem] shrink-0 transition ${actif ? "text-or" : "text-ivoire/45 group-hover:text-or/80"}`}
              />
              <span className={actif ? "font-medium" : ""}>{libelle}</span>
            </Link>
          );
        })}
      </nav>

      {/* Pied : utilisateur + déconnexion */}
      <div className="px-4 pb-5">
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
          <div className="flex items-center gap-3 px-1 pb-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-or to-or-fonce text-sm font-semibold text-anthracite">
              {nom.trim().charAt(0).toUpperCase() || "U"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ivoire">{nom}</p>
              <p className="text-[0.7rem] uppercase tracking-wider text-or/80">
                {role}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Barre supérieure mobile */}
      <header className="flex items-center justify-between bg-gradient-to-b from-[#1a1917] to-anthracite-900 px-4 py-3 text-ivoire shadow-md md:hidden">
        <LogoImg largeur={120} priority className="brightness-0 invert" />
        <button
          type="button"
          onClick={() => setOuvert(true)}
          aria-label="Ouvrir le menu"
          className="rounded-lg p-1.5 text-ivoire/80 transition hover:bg-white/10 hover:text-or"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Tiroir mobile */}
      {ouvert && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOuvert(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 shadow-2xl">
            <button
              type="button"
              onClick={() => setOuvert(false)}
              aria-label="Fermer le menu"
              className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-ivoire hover:bg-anthracite-doux"
            >
              <X className="size-5" />
            </button>
            {contenu}
          </div>
        </div>
      )}

      {/* Barre latérale bureau */}
      <aside className="hidden w-72 shrink-0 md:block">{contenu}</aside>
    </>
  );
}
