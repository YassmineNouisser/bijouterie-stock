import { exigerProfil } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";

/**
 * Layout de l'espace protégé.
 * Vérifie l'authentification (redirige vers /login sinon) et affiche la
 * navigation. La protection est aussi assurée en amont par `proxy.ts`.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profil = await exigerProfil();

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Sidebar nom={profil.nom} role={profil.role} />
      <main className="flex-1 overflow-x-hidden p-5 md:p-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
