"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EtatConnexion = { erreur?: string } | undefined;

/**
 * Server Action de connexion (email / mot de passe).
 * Compatible `useActionState` : (état précédent, FormData) -> état.
 * En cas de succès, redirige vers le tableau de bord.
 */
export async function connexion(
  _prev: EtatConnexion,
  formData: FormData,
): Promise<EtatConnexion> {
  const email = String(formData.get("email") ?? "").trim();
  const motDePasse = String(formData.get("motDePasse") ?? "");

  if (!email || !motDePasse) {
    return { erreur: "Veuillez saisir votre email et votre mot de passe." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });

  if (error) {
    return { erreur: "Email ou mot de passe incorrect." };
  }

  // redirect() lève une exception interne : la laisser hors du bloc d'erreur.
  redirect("/dashboard");
}

/** Server Action de déconnexion. */
export async function deconnexion(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
