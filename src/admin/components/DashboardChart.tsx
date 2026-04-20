import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { formatCHF } from "@/admin/lib/format";

export type ChartMetric = "revenue" | "leads" | "invoices_issued" | "invoices_pending";

const METRIC_CONFIG: Record<ChartMetric, { label: string; color: string; isCurrency: boolean }> = {
  revenue: { label: "Chiffre d'affaires", color: "hsl(var(--optimis-green))", isCurrency: true },
  leads: { label: "Leads livrés", color: "hsl(38 60% 55%)", isCurrency: false },
  invoices_issued: { label: "Factures émises", color: "hsl(220 60% 55%)", isCurrency: false },
  invoices_pending: { label: "Factures en attente", color: "hsl(25 75% 55%)", isCurrency: false },
};

interface MonthlyPoint {
  month: string; // "Jan" etc.
  monthIndex: number;
  revenue: number;
  leads: number;
  invoices_issued: number;
  invoices_pending: number;
}

interface Props {
  data: MonthlyPoint[];
  metric: ChartMetric;
  selectedMonth: number | "all"; // 0..11 ou "all"
}

const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

export function DashboardChart({ data, metric, selectedMonth }: Props) {
  const cfg = METRIC_CONFIG[metric];

  // Si un mois est sélectionné, on génère une vue par jour (déterministe via seed mois)
  const chartData = useMemo(() => {
    if (selectedMonth === "all") {
      return data.map((d) => ({ name: d.month, value: d[metric] }));
    }
    const monthData = data[selectedMonth];
    if (!monthData) return [];
    const total = monthData[metric];
    // Distribution déterministe sur 30 jours
    const seed = (selectedMonth + 1) * 7;
    const weights = DAYS.map((d) => 0.5 + Math.abs(Math.sin(d * seed * 0.13)));
    const sumW = weights.reduce((s, w) => s + w, 0);
    return DAYS.map((d, i) => ({
      name: String(d),
      value: Math.round((total * weights[i]) / sumW),
    }));
  }, [data, metric, selectedMonth]);

  const formatValue = (v: number) => (cfg.isCurrency ? formatCHF(v) : v.toLocaleString("fr-CH"));

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[hsl(var(--optimis-green))]">{cfg.label}</h3>
            <p className="text-xs text-muted-foreground">
              {selectedMonth === "all" ? "Vue annuelle par mois" : "Vue mensuelle par jour"}
            </p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cfg.color} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={cfg.color} stopOpacity={0.55} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(v) => (cfg.isCurrency ? `${(v / 1000).toFixed(0)}k` : String(v))}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--background))",
                  fontSize: 12,
                }}
                formatter={(v: number) => [formatValue(v), cfg.label]}
              />
              <Bar
                dataKey="value"
                fill={`url(#grad-${metric})`}
                radius={[8, 8, 0, 0]}
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export { METRIC_CONFIG };
