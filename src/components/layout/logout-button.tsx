"use client";

import { LogOut } from "lucide-react";
import { deconnexion } from "@/lib/actions/auth";

/** Bouton de déconnexion (déclenche la Server Action). */
export function LogoutButton() {
  return (
    <form action={deconnexion}>
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ivoire/70 transition hover:bg-anthracite-doux hover:text-ivoire"
      >
        <LogOut className="size-4" />
        Déconnexion
      </button>
    </form>
  );
}
