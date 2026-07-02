import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy-session";

/**
 * Next.js 16 : le fichier `middleware.ts` a été renommé `proxy.ts`
 * et la fonction exportée doit s'appeler `proxy` (runtime Node.js).
 * On y rafraîchit la session Supabase et on garde les routes protégées.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Applique le proxy à toutes les routes SAUF :
     * - _next/static, _next/image (fichiers statiques)
     * - favicon.ico, manifest, icônes, images (fichiers publics)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
