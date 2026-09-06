import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Inbox, Coins, Percent, Info } from "lucide-react";
import { formatCHF } from "@/admin/lib/format";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";

type Granularity = "jour" | "semaine" | "mois";

const PLATFORM_LABEL: Record<string, string> = {
  meta: "Meta", google: "Google Ads", tiktok: "TikTok",
};
const PLATFORM_COLOR: Record<string, string> = {
  meta: "#1877F2", google: "#EA4335", tiktok: "#000000", autre: "#64748b",
};

const pad = (n: number) => String(n).padStart(2, "0");
const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Clé de regroupement d'une date selon la granularité. */
function bucketKey(dateStr: string, g: Granularity): string {
  const d = new Date(`${dateStr}T00:00:00`);
  if (g === "jour") return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  if (g === "mois") return d.toLocaleDateString("fr-CH", { month: "short", year: "2-digit" });
  // semaine : numéro ISO approximatif (lundi)
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `sem. ${pad(monday.getDate())}/${pad(monday.getMonth() + 1)}`;
}

const AdminAcquisition = () => {
  const [granularity, setGranularity] = useState<Granularity>("mois");

  // Début du mois courant (pour les KPI + tableaux)
  const now = new Date();
  const monthStart = isoDay(new Date(now.getFullYear(), now.getMonth(), 1));

  const { data: spend = [], isLoading: loadingSpend } = useQuery({
    queryKey: ["ad-spend"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("ad_spend" as any) as any)
        .select("date, platform, produit, spend, results, campaign_name")
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Array<{
        date: string; platform: string; produit: string | null;
        spend: number; results: number; campaign_name: string | null;
      }>;
    },
  });

  const { data: leadsMonth = [] } = useQuery({
    queryKey: ["acq-leads-month", monthStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("produit, cree_le")
        .gte("cree_le", monthStart);
      if (error) throw error;
      return (data ?? []) as Array<{ produit: string | null; cree_le: string }>;
    },
  });

  const spendMonth = useMemo(() => spend.filter((s) => s.date >= monthStart), [spend, monthStart]);

  // --- KPI du mois ---
  const totalSpend = spendMonth.reduce((a, s) => a + Number(s.spend || 0), 0);
  const totalLeads = leadsMonth.length;
  const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

  // --- Graphe : dépense par bucket ---
  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of spend) {
      const k = bucketKey(s.date, granularity);
      map.set(k, (map.get(k) ?? 0) + Number(s.spend || 0));
    }
    return [...map.entries()].map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [spend, granularity]);

  // --- Tableau par plateforme (mois) ---
  const byPlatform = useMemo(() => {
    const map = new Map<string, { spend: number; results: number }>();
    for (const s of spendMonth) {
      const cur = map.get(s.platform) ?? { spend: 0, results: 0 };
      cur.spend += Number(s.spend || 0);
      cur.results += Number(s.results || 0);
      map.set(s.platform, cur);
    }
    return [...map.entries()].map(([platform, v]) => ({
      platform, ...v, cpl: v.results > 0 ? v.spend / v.results : 0,
    }));
  }, [spendMonth]);

  // --- Tableau par produit (mois) : dépense (ad_spend) + leads (leads) ---
  const byProduct = useMemo(() => {
    const spendMap = new Map<string, number>();
    for (const s of spendMonth) {
      const p = s.produit || "non attribué";
      spendMap.set(p, (spendMap.get(p) ?? 0) + Number(s.spend || 0));
    }
    const leadMap = new Map<string, number>();
    for (const l of leadsMonth) {
      const p = l.produit || "non attribué";
      leadMap.set(p, (leadMap.get(p) ?? 0) + 1);
    }
    const keys = new Set([...spendMap.keys(), ...leadMap.keys()]);
    return [...keys].map((produit) => {
      const sp = spendMap.get(produit) ?? 0;
      const ld = leadMap.get(produit) ?? 0;
      return { produit, spend: sp, leads: ld, cpl: ld > 0 ? sp / ld : 0 };
    }).sort((a, b) => b.spend - a.spend);
  }, [spendMonth, leadsMonth]);

  const empty = !loadingSpend && spend.length === 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" /> Acquisition
            </h1>
            <p className="text-sm text-muted-foreground">Dépenses publicitaires, CPL et rentabilité par produit.</p>
          </div>
          <div className="flex gap-1 rounded-lg border p-1">
            {(["jour", "semaine", "mois"] as Granularity[]).map((g) => (
              <Button key={g} size="sm" variant={granularity === g ? "default" : "ghost"}
                onClick={() => setGranularity(g)} className="capitalize">
                {g}
              </Button>
            ))}
          </div>
        </div>

        {empty && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-start gap-3 text-sm">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Aucune dépense pour l'instant.</p>
              <p className="text-muted-foreground">
                Connecte tes comptes publicitaires (Meta, Google Ads) pour que les dépenses remontent
                automatiquement ici. La page se remplira dès la première synchronisation.
              </p>
            </div>
          </div>
        )}

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Coins} label="Dépense (mois)" value={formatCHF(totalSpend)} />
          <KpiCard icon={Inbox} label="Leads (mois)" value={String(totalLeads)} />
          <KpiCard icon={Percent} label="CPL moyen" value={totalLeads > 0 ? formatCHF(cpl) : "—"} />
          <KpiCard icon={TrendingUp} label="Marge estimée" value="—" hint="prix de vente à configurer" />
        </div>

        {/* Graphe dépense */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-4">Dépense publicitaire ({granularity})</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => formatCHF(v)} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tableaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium mb-3">Par plateforme (mois)</p>
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground uppercase">
                  <tr><th className="text-left py-2">Plateforme</th><th className="text-right">Dépense</th><th className="text-right">Résultats</th><th className="text-right">CPL</th></tr>
                </thead>
                <tbody>
                  {byPlatform.length === 0 ? (
                    <tr><td colSpan={4} className="py-3 text-center text-muted-foreground">—</td></tr>
                  ) : byPlatform.map((r) => (
                    <tr key={r.platform} className="border-t">
                      <td className="py-2 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: PLATFORM_COLOR[r.platform] ?? PLATFORM_COLOR.autre }} />
                        {PLATFORM_LABEL[r.platform] ?? r.platform}
                      </td>
                      <td className="text-right">{formatCHF(r.spend)}</td>
                      <td className="text-right">{r.results}</td>
                      <td className="text-right">{r.results > 0 ? formatCHF(r.cpl) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium mb-3">Par produit (mois)</p>
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground uppercase">
                  <tr><th className="text-left py-2">Produit</th><th className="text-right">Dépense</th><th className="text-right">Leads</th><th className="text-right">CPL</th></tr>
                </thead>
                <tbody>
                  {byProduct.length === 0 ? (
                    <tr><td colSpan={4} className="py-3 text-center text-muted-foreground">—</td></tr>
                  ) : byProduct.map((r) => (
                    <tr key={r.produit} className="border-t">
                      <td className="py-2">{r.produit}</td>
                      <td className="text-right">{formatCHF(r.spend)}</td>
                      <td className="text-right">{r.leads}</td>
                      <td className="text-right">{r.leads > 0 && r.spend > 0 ? formatCHF(r.cpl) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

const KpiCard = ({ icon: Icon, label, value, hint }: { icon: typeof Coins; label: string; value: string; hint?: string }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </CardContent>
  </Card>
);

export default AdminAcquisition;
