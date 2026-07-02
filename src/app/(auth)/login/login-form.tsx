"use client";

import { useActionState } from "react";
import { connexion, type EtatConnexion } from "@/lib/actions/auth";

const etatInitial: EtatConnexion = undefined;

export function LoginForm() {
  const [etat, action, enCours] = useActionState(connexion, etatInitial);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-anthracite">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="vous@exemple.tn"
          className="rounded-md border border-or-clair bg-white px-4 py-2.5 text-anthracite outline-none transition focus:border-or focus:ring-2 focus:ring-or/30"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="motDePasse"
          className="text-sm font-medium text-anthracite"
        >
          Mot de passe
        </label>
        <input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="rounded-md border border-or-clair bg-white px-4 py-2.5 text-anthracite outline-none transition focus:border-or focus:ring-2 focus:ring-or/30"
        />
      </div>

      {etat?.erreur && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-700"
        >
          {etat.erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={enCours}
        className="btn-sombre mt-2 w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enCours ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
