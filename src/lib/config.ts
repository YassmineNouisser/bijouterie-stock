/**
 * Configuration de la bijouterie (mentions légales, facturation).
 * Source : variables d'environnement (pas de table `parametres`).
 * Les valeurs NEXT_PUBLIC_* sont accessibles côté client comme serveur.
 */
export const bijouterie = {
  nom: process.env.NEXT_PUBLIC_BIJOU_NOM ?? "Youssef Bouzid Bijoux",
  adresse: process.env.NEXT_PUBLIC_BIJOU_ADRESSE ?? "24, souk el bey, El Berka",
  tel: process.env.NEXT_PUBLIC_BIJOU_TEL ?? "+216 97 476 401",
  email: process.env.NEXT_PUBLIC_BIJOU_EMAIL ?? "youssefbouzid631@gmail.com",
  site: process.env.NEXT_PUBLIC_BIJOU_SITE ?? "bouzidbijouteriebyyoussef.tn",
  matriculeFiscal: process.env.NEXT_PUBLIC_BIJOU_MATRICULE_FISCAL ?? "",
  rib: process.env.NEXT_PUBLIC_BIJOU_RIB ?? "",
} as const;
