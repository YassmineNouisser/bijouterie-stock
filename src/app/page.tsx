import { redirect } from "next/navigation";

/**
 * Accueil : renvoie vers l'espace de gestion.
 * `proxy.ts` redirige vers /login si l'utilisateur n'est pas authentifié.
 */
export default function Home() {
  redirect("/dashboard");
}
