import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase côté navigateur (composants "use client").
 * N'utilise QUE la clé anon publique — jamais la clé service_role ici.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
