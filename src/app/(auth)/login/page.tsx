import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { LogoImg } from "@/components/factures/logo-img";

export const metadata: Metadata = {
  title: "Connexion — Bouzid Bijoux",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-b from-ivoire via-creme/40 to-ivoire px-4 py-12">
      {/* Halos dorés décoratifs */}
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-or/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-or/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* En-tête de marque */}
        <div className="mb-8 flex flex-col items-center">
          <LogoImg largeur={250} priority />
          <div className="mt-5 filet-or w-24" />
          <p className="eyebrow mt-3">Espace de gestion</p>
        </div>

        {/* Carte de connexion */}
        <div className="carte p-8">
          <h1 className="mb-1 font-titre text-2xl font-semibold text-anthracite">
            Connexion
          </h1>
          <p className="mb-6 text-sm text-anthracite/50">
            Accédez à votre espace de gestion.
          </p>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-anthracite/40">
          Accès réservé au personnel autorisé.
        </p>
      </div>
    </main>
  );
}
