import { Bar, BarChart, CartesianGrid, Legend, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { formatCHF } from "@/admin/lib/format";

export interface RevenueCostPoint {
  name: string;
  revenue: number;
  cost: number;
  margin: number;
}

interface Props {
  data: RevenueCostPoint[];
  title?: string;
  subtitle?: string;
}

export function RevenueCostChart({ data, title = "CA · Coûts · Marge", subtitle }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[hsl(var(--optimis-green))]">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--optimis-green))" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="hsl(var(--optimis-green))" stopOpacity={0.55} />
                </linearGradient>
                <linearGradient id="grad-cost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0 70% 55%)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(0 70% 55%)" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--background))",
                  fontSize: 12,
                }}
                formatter={(v: number, name: string) => [formatCHF(v), name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="revenue" name="CA" fill="url(#grad-revenue)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cost" name="Coût" fill="url(#grad-cost)" radius={[6, 6, 0, 0]} />
              <Line type="monotone" dataKey="margin" name="Marge" stroke="hsl(38 80% 50%)" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
