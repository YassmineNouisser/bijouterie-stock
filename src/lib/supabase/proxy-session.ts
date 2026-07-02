import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rafraîchit la session Supabase à chaque requête et protège les routes.
 * Appelé depuis `proxy.ts` (ex-`middleware.ts` — renommé dans Next.js 16).
 *
 * Règle : tout utilisateur NON authentifié est renvoyé vers /login,
 * sauf sur /login lui-même et les routes publiques.
 */
export async function updateSession(request: NextRequest) {
  // Mode démo (NEXT_PUBLIC_DEMO=true) : pas d'auth, accès libre à l'app.
  if (process.env.NEXT_PUBLIC_DEMO === "true") {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT : ne pas insérer de code entre createServerClient et getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const estPublic = pathname === "/login" || pathname.startsWith("/auth");

  // Non connecté + page protégée -> redirection vers /login
  if (!user && !estPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Déjà connecté + page de login -> redirection vers le tableau de bord
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
