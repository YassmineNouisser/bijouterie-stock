import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DEMO, produitsDemo, facturesDemo } from "@/lib/demo";
import { calculerTotaux } from "@/lib/facture";
import { statutStock } from "@/lib/stock";

export type PointMois = { mois: string; ca: number; grammes: number };

export type DashboardStats = {
  // Stock
  grammesStock: number;
  nbPiecesStock: number;
  nbProduits: number;
  nbAlertes: number;
  nbRupture: number;
  stockParCarat: { label: string; grammes: number }[];
  stockParType: { type: string; grammes: number; nb: number }[];
  entreesParMois: PointMois[];
  dernieresEntrees: {
    reference: string;
    designation: string;
    poids: number | null;
    carat: number | null;
    date: string | null;
  }[];
  // Ventes
  chiffreAffaires: number;
  nbVentes: number;
  grammesVendus: number;
  dernieresFactures: {
    numero: string;
    date: string;
    clientNom: string;
    total: number;
  }[];
};

type ProduitStock = {
  reference: string;
  designation: string;
  poids_grammes: number | null;
  carat: number | null;
  quantite_stock: number;
  seuil_alerte: number;
  date_entree: string | null;
};

/** Les 6 derniers mois glissants : [{ key: "2026-01", label: "janv." }]. */
function derniers6Mois(): { key: string; label: string }[] {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("fr-FR", { month: "short" });
  const out: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ key, label: fmt.format(d).replace(".", "") });
  }
  return out;
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Métriques de stock calculées à partir des produits en stock. */
function metriquesStock(prods: ProduitStock[]) {
  const enStock = prods.filter((p) => p.quantite_stock > 0);
  const poids = (p: ProduitStock) => (p.poids_grammes ?? 0) * p.quantite_stock;

  const grammesStock = r3(enStock.reduce((s, p) => s + poids(p), 0));
  const nbPiecesStock = enStock.reduce((s, p) => s + p.quantite_stock, 0);

  // Par carat (18K, 21K…)
  const parCarat = new Map<string, number>();
  for (const p of enStock) {
    const key = p.carat ? `${p.carat}K` : "Autre";
    parCarat.set(key, (parCarat.get(key) ?? 0) + poids(p));
  }

  // Par type (premier mot de la désignation : bague, collier, فردة…)
  const parType = new Map<string, { grammes: number; nb: number }>();
  for (const p of enStock) {
    const key = (p.designation.trim().split(/\s+/)[0] || "Autre").toLowerCase();
    const cur = parType.get(key) ?? { grammes: 0, nb: 0 };
    parType.set(key, {
      grammes: cur.grammes + poids(p),
      nb: cur.nb + p.quantite_stock,
    });
  }

  // Entrées de stock par mois (grammes)
  const mois = derniers6Mois();
  const gMois = new Map(mois.map((m) => [m.key, 0]));
  for (const p of enStock) {
    if (!p.date_entree) continue;
    const key = p.date_entree.slice(0, 7);
    if (gMois.has(key)) gMois.set(key, gMois.get(key)! + poids(p));
  }

  const dernieresEntrees = [...enStock]
    .filter((p) => p.date_entree)
    .sort((a, b) => (a.date_entree! < b.date_entree! ? 1 : -1))
    .slice(0, 6)
    .map((p) => ({
      reference: p.reference,
      designation: p.designation,
      poids: p.poids_grammes,
      carat: p.carat,
      date: p.date_entree,
    }));

  return {
    grammesStock,
    nbPiecesStock,
    nbProduits: prods.length,
    nbAlertes: prods.filter(
      (p) => statutStock(p.quantite_stock, p.seuil_alerte) === "alerte",
    ).length,
    nbRupture: prods.filter((p) => p.quantite_stock <= 0).length,
    stockParCarat: [...parCarat.entries()]
      .map(([label, grammes]) => ({ label, grammes: r3(grammes) }))
      .sort((a, b) => b.grammes - a.grammes),
    stockParType: [...parType.entries()]
      .map(([type, v]) => ({ type, grammes: r3(v.grammes), nb: v.nb }))
      .sort((a, b) => b.grammes - a.grammes)
      .slice(0, 8),
    entreesParMois: mois.map((m) => ({
      mois: m.label,
      ca: 0,
      grammes: r3(gMois.get(m.key) ?? 0),
    })),
    dernieresEntrees,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return DEMO ? statsDemo() : statsReel();
}

// --- Mode démo -------------------------------------------------------
function statsDemo(): DashboardStats {
  const prods: ProduitStock[] = produitsDemo.map((p) => ({
    reference: p.reference,
    designation: p.designation,
    poids_grammes: p.poids_grammes,
    carat: p.carat,
    quantite_stock: p.quantite_stock,
    seuil_alerte: p.seuil_alerte,
    date_entree: null,
  }));

  let chiffreAffaires = 0;
  let grammesVendus = 0;
  const refToPoids = new Map(
    produitsDemo.map((p) => [p.reference, p.poids_grammes ?? 0]),
  );
  for (const f of facturesDemo) {
    chiffreAffaires += calculerTotaux(f.lignes, f.remise).total;
    for (const l of f.lignes)
      grammesVendus += l.quantite * (refToPoids.get(l.reference ?? "") ?? 0);
  }

  return {
    ...metriquesStock(prods),
    chiffreAffaires: r3(chiffreAffaires),
    nbVentes: facturesDemo.length,
    grammesVendus: r3(grammesVendus),
    dernieresFactures: [...facturesDemo]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5)
      .map((f) => ({
        numero: f.numero,
        date: f.date,
        clientNom: f.client.nom,
        total: calculerTotaux(f.lignes, f.remise).total,
      })),
  };
}

// --- Helpers d'extraction des relations Supabase --------------------
function texteDepuis(rel: unknown, cle: string): string | null {
  const o = Array.isArray(rel) ? rel[0] : rel;
  if (o && typeof o === "object" && cle in o) {
    return String((o as Record<string, unknown>)[cle] ?? "") || null;
  }
  return null;
}

// --- Mode réel (Supabase) -------------------------------------------
async function statsReel(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [{ data: produits }, { data: invoices }, { data: items }] =
    await Promise.all([
      supabase
        .from("products")
        .select(
          "reference, designation, poids_grammes, carat, quantite_stock, seuil_alerte, date_entree",
        ),
      supabase
        .from("invoices")
        .select("numero, date, total, clients(nom)")
        .order("date", { ascending: false }),
      supabase.from("invoice_items").select("quantite, products(poids_grammes)"),
    ]);

  const prods = (produits ?? []) as ProduitStock[];
  const facs = invoices ?? [];

  let grammesVendus = 0;
  for (const it of items ?? []) {
    const rel = it.products;
    const o = Array.isArray(rel) ? rel[0] : rel;
    const poids =
      o && typeof o === "object" && "poids_grammes" in o
        ? Number((o as Record<string, unknown>).poids_grammes) || 0
        : 0;
    grammesVendus += it.quantite * poids;
  }

  return {
    ...metriquesStock(prods),
    chiffreAffaires: facs.reduce((s, f) => s + (f.total ?? 0), 0),
    nbVentes: facs.length,
    grammesVendus: r3(grammesVendus),
    dernieresFactures: facs.slice(0, 5).map((f) => ({
      numero: f.numero,
      date: f.date,
      clientNom: texteDepuis(f.clients, "nom") ?? "Client",
      total: f.total,
    })),
  };
}
