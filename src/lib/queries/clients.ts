import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DEMO, clientsDemo, type ClientDemo } from "@/lib/demo";

export type ClientOption = ClientDemo;

/** Liste des clients (pour la sélection lors de la facturation). */
export async function getClients(): Promise<ClientOption[]> {
  if (DEMO) return clientsDemo;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, nom, adresse, telephone, matricule_fiscal")
    .order("nom");

  if (error) throw error;

  return (data ?? []).map((c) => ({
    id: c.id,
    nom: c.nom,
    adresse: c.adresse,
    telephone: c.telephone,
    matriculeFiscal: c.matricule_fiscal,
  }));
}
