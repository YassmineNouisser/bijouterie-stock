import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client administrateur (clé service_role) — contourne la RLS.
 * ⚠️ À n'utiliser QUE dans du code serveur (Server Actions / Route Handlers),
 * jamais importé dans un composant client. Le `import "server-only"` ci-dessus
 * fait échouer le build si ce fichier est inclus dans un bundle navigateur.
 *
 * Réservé aux opérations privilégiées (ex. création de comptes vendeurs).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
