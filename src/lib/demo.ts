/**
 * MODE DÉMO — pour travailler le design sans backend Supabase.
 * Activé via NEXT_PUBLIC_DEMO=true dans .env.local.
 *
 * Quand il est actif :
 *  - le proxy ne redirige plus vers /login (accès libre à l'app) ;
 *  - l'authentification renvoie un profil admin fictif ;
 *  - les requêtes lisent des données de démonstration en mémoire.
 *
 * ⚠️ Rien n'est persisté. À désactiver pour brancher la vraie base.
 */
export const DEMO = process.env.NEXT_PUBLIC_DEMO === "true";

import type { ProfilActuel } from "@/lib/auth";

/** Profil fictif utilisé en mode démo (admin, voit tout). */
export const profilDemo: ProfilActuel = {
  id: "demo-user",
  email: "demo@bouzidbijouterie.tn",
  nom: "Mode démo",
  role: "admin",
};

// --- Données de démonstration (catalogue) ---------------------------

export type ProduitDemo = {
  id: string;
  reference: string;
  designation: string;
  categorie: string;
  matiere: string;
  carat: number | null;
  poids_grammes: number | null;
  pierres: string | null;
  prix_vente: number;
  cout_achat: number;
  quantite_stock: number;
  seuil_alerte: number;
  image_url: string | null;
  actif: boolean;
};

export const categoriesDemo = [
  "Bague",
  "Collier",
  "Bracelet",
  "Alliance",
  "Boucles d'oreilles",
];

// --- Clients de démonstration ---------------------------------------

export type ClientDemo = {
  id: string;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  matriculeFiscal: string | null;
};

export const clientsDemo: ClientDemo[] = [
  {
    id: "c1",
    nom: "Mme Leïla Ben Ammar",
    adresse: "12, rue de Marseille, Tunis",
    telephone: "+216 22 345 678",
    matriculeFiscal: null,
  },
  {
    id: "c2",
    nom: "M. Karim Trabelsi",
    adresse: "El Berka, Tunis",
    telephone: "+216 98 111 222",
    matriculeFiscal: "1234567/A/M/000",
  },
  {
    id: "c3",
    nom: "Bijouterie El Yasmine (revendeur)",
    adresse: "Avenue de la Liberté, Sousse",
    telephone: "+216 73 222 333",
    matriculeFiscal: "7654321/B/C/000",
  },
];

// --- Factures de démonstration --------------------------------------

import type { FactureData } from "@/lib/facture";

export const facturesDemo: FactureData[] = [
  {
    numero: "FAC-000124",
    date: "2026-06-24",
    client: {
      nom: "Mme Leïla Ben Ammar",
      adresse: "12, rue de Marseille, Tunis",
      telephone: "+216 22 345 678",
      matriculeFiscal: null,
    },
    lignes: [
      {
        reference: "BG-001",
        designation: "Bague solitaire diamant — or 18k",
        quantite: 1,
        prixUnitaire: 2450,
      },
      {
        reference: "AL-001",
        designation: "Alliance classique — or 18k",
        quantite: 2,
        prixUnitaire: 1280,
      },
    ],
    remise: 0,
  },
  {
    numero: "FAC-000123",
    date: "2026-06-20",
    client: {
      nom: "M. Karim Trabelsi",
      adresse: "El Berka, Tunis",
      telephone: "+216 98 111 222",
      matriculeFiscal: "1234567/A/M/000",
    },
    lignes: [
      {
        reference: "CL-001",
        designation: "Collier maille gourmette — or 18k",
        quantite: 1,
        prixUnitaire: 4100,
      },
    ],
    remise: 100,
  },
  {
    numero: "FAC-000122",
    date: "2026-05-20",
    client: { nom: "M. Karim Trabelsi", adresse: "El Berka, Tunis", telephone: "+216 98 111 222", matriculeFiscal: "1234567/A/M/000" },
    lignes: [
      { reference: "CL-001", designation: "Collier maille gourmette — or 18k", quantite: 1, prixUnitaire: 4100 },
    ],
    remise: 0,
  },
  {
    numero: "FAC-000121",
    date: "2026-05-06",
    client: { nom: "Mme Leïla Ben Ammar", adresse: "12, rue de Marseille, Tunis", telephone: "+216 22 345 678", matriculeFiscal: null },
    lignes: [
      { reference: "AL-002", designation: "Alliance diamantée — or 21k", quantite: 1, prixUnitaire: 2200 },
      { reference: "BO-001", designation: "Boucles d'oreilles puces — or 18k", quantite: 1, prixUnitaire: 1650 },
    ],
    remise: 0,
  },
  {
    numero: "FAC-000120",
    date: "2026-04-26",
    client: { nom: "Bijouterie El Yasmine (revendeur)", adresse: "Avenue de la Liberté, Sousse", telephone: "+216 73 222 333", matriculeFiscal: "7654321/B/C/000" },
    lignes: [
      { reference: "BR-001", designation: "Bracelet jonc ciselé — or 21k", quantite: 1, prixUnitaire: 3150 },
      { reference: "BO-001", designation: "Boucles d'oreilles puces — or 18k", quantite: 2, prixUnitaire: 1650 },
    ],
    remise: 0,
  },
  {
    numero: "FAC-000119",
    date: "2026-04-11",
    client: { nom: "Mme Sonia Khelifi", adresse: "Lafayette, Tunis", telephone: "+216 27 888 999", matriculeFiscal: null },
    lignes: [
      { reference: "BG-001", designation: "Bague solitaire diamant — or 18k", quantite: 2, prixUnitaire: 2450 },
    ],
    remise: 100,
  },
  {
    numero: "FAC-000118",
    date: "2026-03-30",
    client: { nom: "Mme Leïla Ben Ammar", adresse: "12, rue de Marseille, Tunis", telephone: "+216 22 345 678", matriculeFiscal: null },
    lignes: [
      { reference: "CL-001", designation: "Collier maille gourmette — or 18k", quantite: 1, prixUnitaire: 4100 },
      { reference: "AL-001", designation: "Alliance classique — or 18k", quantite: 1, prixUnitaire: 1280 },
    ],
    remise: 0,
  },
  {
    numero: "FAC-000117",
    date: "2026-03-15",
    client: { nom: "M. Karim Trabelsi", adresse: "El Berka, Tunis", telephone: "+216 98 111 222", matriculeFiscal: "1234567/A/M/000" },
    lignes: [
      { reference: "AL-002", designation: "Alliance diamantée — or 21k", quantite: 2, prixUnitaire: 2200 },
    ],
    remise: 0,
  },
  {
    numero: "FAC-000116",
    date: "2026-02-22",
    client: { nom: "Bijouterie El Yasmine (revendeur)", adresse: "Avenue de la Liberté, Sousse", telephone: "+216 73 222 333", matriculeFiscal: "7654321/B/C/000" },
    lignes: [
      { reference: "BR-001", designation: "Bracelet jonc ciselé — or 21k", quantite: 2, prixUnitaire: 3150 },
    ],
    remise: 150,
  },
  {
    numero: "FAC-000115",
    date: "2026-02-09",
    client: { nom: "Mme Leïla Ben Ammar", adresse: "12, rue de Marseille, Tunis", telephone: "+216 22 345 678", matriculeFiscal: null },
    lignes: [
      { reference: "BG-001", designation: "Bague solitaire diamant — or 18k", quantite: 1, prixUnitaire: 2450 },
      { reference: "BO-001", designation: "Boucles d'oreilles puces — or 18k", quantite: 1, prixUnitaire: 1650 },
    ],
    remise: 0,
  },
  {
    numero: "FAC-000114",
    date: "2026-01-28",
    client: { nom: "M. Anis Gharbi", adresse: "Menzah 6, Tunis", telephone: "+216 50 444 555", matriculeFiscal: null },
    lignes: [
      { reference: "AL-001", designation: "Alliance classique — or 18k", quantite: 2, prixUnitaire: 1280 },
    ],
    remise: 0,
  },
  {
    numero: "FAC-000113",
    date: "2026-01-12",
    client: { nom: "M. Karim Trabelsi", adresse: "El Berka, Tunis", telephone: "+216 98 111 222", matriculeFiscal: "1234567/A/M/000" },
    lignes: [
      { reference: "CL-001", designation: "Collier maille gourmette — or 18k", quantite: 1, prixUnitaire: 4100 },
    ],
    remise: 0,
  },
];

export function getFactureDemo(numero: string): FactureData | undefined {
  return facturesDemo.find((f) => f.numero === numero);
}

export const produitsDemo: ProduitDemo[] = [
  {
    id: "p1",
    reference: "BG-001",
    designation: "Bague solitaire diamant",
    categorie: "Bague",
    matiere: "or",
    carat: 18,
    poids_grammes: 3.5,
    pierres: "1 diamant 0,30 ct",
    prix_vente: 2450,
    cout_achat: 1800,
    quantite_stock: 5,
    seuil_alerte: 2,
    image_url: null,
    actif: true,
  },
  {
    id: "p2",
    reference: "CL-001",
    designation: "Collier maille gourmette",
    categorie: "Collier",
    matiere: "or",
    carat: 18,
    poids_grammes: 12.2,
    pierres: null,
    prix_vente: 4100,
    cout_achat: 3200,
    quantite_stock: 3,
    seuil_alerte: 1,
    image_url: null,
    actif: true,
  },
  {
    id: "p3",
    reference: "BR-001",
    designation: "Bracelet jonc ciselé",
    categorie: "Bracelet",
    matiere: "or",
    carat: 21,
    poids_grammes: 8.75,
    pierres: null,
    prix_vente: 3150,
    cout_achat: 2400,
    quantite_stock: 4,
    seuil_alerte: 2,
    image_url: null,
    actif: true,
  },
  {
    id: "p4",
    reference: "AL-001",
    designation: "Alliance classique",
    categorie: "Alliance",
    matiere: "or",
    carat: 18,
    poids_grammes: 4,
    pierres: null,
    prix_vente: 1280,
    cout_achat: 950,
    quantite_stock: 10,
    seuil_alerte: 3,
    image_url: null,
    actif: true,
  },
  {
    id: "p5",
    reference: "BO-001",
    designation: "Boucles d'oreilles puces",
    categorie: "Boucles d'oreilles",
    matiere: "or",
    carat: 18,
    poids_grammes: 2.1,
    pierres: "2 diamants 0,10 ct",
    prix_vente: 1650,
    cout_achat: 1200,
    quantite_stock: 1,
    seuil_alerte: 2,
    image_url: null,
    actif: true,
  },
  {
    id: "p6",
    reference: "AL-002",
    designation: "Alliance diamantée",
    categorie: "Alliance",
    matiere: "or",
    carat: 21,
    poids_grammes: 4.6,
    pierres: "5 diamants",
    prix_vente: 2200,
    cout_achat: 1700,
    quantite_stock: 0,
    seuil_alerte: 2,
    image_url: null,
    actif: true,
  },
];
