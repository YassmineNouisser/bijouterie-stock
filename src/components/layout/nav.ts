import {
  LayoutDashboard,
  Gem,
  Boxes,
  FileText,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";

export type LienNav = {
  href: string;
  libelle: string;
  icone: LucideIcon;
};

/** Liens de navigation principaux de l'espace de gestion. */
export const liensNav: LienNav[] = [
  { href: "/dashboard", libelle: "Tableau de bord", icone: LayoutDashboard },
  { href: "/produits", libelle: "Produits", icone: Gem },
  { href: "/stock", libelle: "Stock", icone: Boxes },
  { href: "/factures", libelle: "Factures", icone: FileText },
  { href: "/vendus", libelle: "Articles vendus", icone: PackageCheck },
];
