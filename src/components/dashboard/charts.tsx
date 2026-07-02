"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { PointMois } from "@/lib/queries/stats";
import { formatDinar } from "@/lib/format";

const OR = "#c7a24b";
const OR_FONCE = "#a8863a";
const PALETTE = ["#c7a24b", "#d8bd7e", "#a8863a", "#e3cd8f", "#8a6a2f", "#b89a5a"];

const axe = { fontSize: 12, fill: "#9a8a6a" };

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e3cd8f",
  background: "#fffdf8",
  boxShadow: "0 10px 30px -12px rgba(150,115,40,0.4)",
  fontSize: 13,
};

function grammes(v: number) {
  return `${v.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} g`;
}

/** Aire : chiffre d'affaires par mois. */
export function ChartCAMensuel({ data }: { data: PointMois[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="grad-ca" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OR} stopOpacity={0.35} />
            <stop offset="100%" stopColor={OR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#efe6d2" vertical={false} />
        <XAxis dataKey="mois" tick={axe} axisLine={false} tickLine={false} />
        <YAxis
          tick={axe}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [formatDinar(Number(v)), "Chiffre d'affaires"]}
        />
        <Area
          type="monotone"
          dataKey="ca"
          stroke={OR_FONCE}
          strokeWidth={2.5}
          fill="url(#grad-ca)"
          dot={{ r: 3, fill: OR_FONCE, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Barres : grammes d'or vendus par mois. */
export function ChartGrammesMensuel({ data }: { data: PointMois[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="grad-gram" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e3cd8f" />
            <stop offset="100%" stopColor={OR} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#efe6d2" vertical={false} />
        <XAxis dataKey="mois" tick={axe} axisLine={false} tickLine={false} />
        <YAxis tick={axe} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          cursor={{ fill: "rgba(199,162,75,0.08)" }}
          contentStyle={tooltipStyle}
          formatter={(v) => [grammes(Number(v)), "Or vendu"]}
        />
        <Bar dataKey="grammes" fill="url(#grad-gram)" radius={[6, 6, 0, 0]} maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Anneau : répartition du stock (en grammes) — ex. par carat. */
export function ChartDonutGrammes({
  data,
}: {
  data: { label: string; grammes: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="grammes"
          nameKey="label"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v, n) => [grammes(Number(v)), String(n)]}
        />
        <Legend
          iconType="circle"
          iconSize={9}
          formatter={(value: string) => (
            <span style={{ color: "#4a4438", fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Anneau : répartition des ventes par catégorie. */
export function ChartCategories({
  data,
}: {
  data: { categorie: string; montant: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="montant"
          nameKey="categorie"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v, n) => [formatDinar(Number(v)), String(n)]}
        />
        <Legend
          iconType="circle"
          iconSize={9}
          formatter={(value: string) => (
            <span style={{ color: "#4a4438", fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
