import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEMO, profilDemo } from "@/lib/demo";

export type Role = "admin" | "vendeur";

export type ProfilActuel = {
  id: string;
  email: string | null;
  nom: string;
  role: Role;
};

/**
 * Récupère l'utilisateur connecté et son profil (rôle, nom).
 * Renvoie `null` si non authentifié.
 *
 * Mémoïsé par requête via `cache()` : même si le layout ET la page
 * l'appellent, l'appel réseau à Supabase n'a lieu qu'une seule fois
 * (évite les allers-retours redondants → plus rapide).
 */
export const getProfil = cache(async (): Promise<ProfilActuel | null> => {
  // Mode démo : profil admin fictif, aucun appel Supabase.
  if (DEMO) return profilDemo;

  const supabase = await createClient();

  // Le proxy (proxy.ts) a déjà validé et rafraîchi la session via getUser()
  // juste avant le rendu. On lit donc la session localement (sans appel
  // réseau supplémentaire) pour récupérer l'utilisateur → page plus rapide.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return null;

  const { data: profil } = await supabase
    .from("profiles")
    .select("nom, role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? null,
    nom: profil?.nom ?? user.email ?? "",
    role: (profil?.role as Role) ?? "vendeur",
  };
});

/**
 * Comme `getProfil` mais redirige vers /login si non connecté.
 * Garantit un profil non-nul dans les pages protégées.
 */
export async function exigerProfil(): Promise<ProfilActuel> {
  const profil = await getProfil();
  if (!profil) redirect("/login");
  return profil;
}

/** Raccourci : l'utilisateur courant est-il admin ? */
export async function estAdmin(): Promise<boolean> {
  const profil = await getProfil();
  return profil?.role === "admin";
}
