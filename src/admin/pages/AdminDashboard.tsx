import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingBag, FileText, Clock, TrendingUp, TrendingDown, Percent } from "lucide-react";
import { RevenueCostChart, RevenueCostPoint } from "@/admin/components/RevenueCostChart";
import { formatCHF, formatCAD, formatMoney, toCHF, type Currency, formatDate, STATUS_LABELS } from "@/admin/lib/format";
import { DOMAIN_LABELS_FULL } from "@/admin/lib/productCategories";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const MONTH_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MONTH_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

// Données mensuelles : tout à zéro tant qu'il n'y a pas d'activité réelle
const EMPTY_MONTHLY = Array.from({ length: 12 }, () => ({
  revenue: 0,
  leads: 0,
  invoices_issued: 0,
  invoices_pending: 0,
}));

export default function AdminDashboard() {
  // "all" = année / 0..11 = mois
  const [period, setPeriod] = useState<"all" | number>("all");

  const { data: activeClientsCount } = useQuery({
    queryKey: ["admin-active-clients-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("admin_clients")
        .select("id", { count: "exact", head: true })
        .eq("status", "actif");
      return count ?? 0;
    },
  });

  // Agrégation CA + Coûts depuis admin_order_lines (joint sur admin_products pour récupérer avg_cpl)
  const { data: financials } = useQuery({
    queryKey: ["admin-financials"],
    queryFn: async () => {
      const { data } = await (supabase.from("admin_order_lines" as any) as any)
        .select("quantity, unit_price, currency, fx_rate_to_chf, product_id, admin_orders(order_date), admin_products(avg_cpl, currency, fx_rate_to_chf)");
      const totals: Record<Currency, { native: number; chf: number }> = {
        CHF: { native: 0, chf: 0 },
        CAD: { native: 0, chf: 0 },
      };
      let totalRevenueChf = 0;
      let totalCostChf = 0;
      const monthlyAgg: { revenue: number; cost: number }[] = Array.from({ length: 12 }, () => ({ revenue: 0, cost: 0 }));

      (data ?? []).forEach((l: any) => {
        const cur: Currency = (l.currency as Currency) ?? "CHF";
        const qty = Number(l.quantity) || 0;
        const amt = qty * (Number(l.unit_price) || 0);
        const fx = Number(l.fx_rate_to_chf) || 1;
        const revChf = toCHF(amt, cur, fx);
        totals[cur].native += amt;
        totals[cur].chf += revChf;
        totalRevenueChf += revChf;

        // Coût = avg_cpl du produit × quantité (converti en CHF)
        const prod = l.admin_products;
        const cplCur: Currency = (prod?.currency as Currency) ?? "CHF";
        const cplFx = Number(prod?.fx_rate_to_chf) || 1;
        const costNative = qty * (Number(prod?.avg_cpl) || 0);
        const costChf = toCHF(costNative, cplCur, cplFx);
        totalCostChf += costChf;

        // Bucket mensuel
        const date = l.admin_orders?.order_date ? new Date(l.admin_orders.order_date) : null;
        if (date && !isNaN(date.getTime())) {
          const m = date.getMonth();
          monthlyAgg[m].revenue += revChf;
          monthlyAgg[m].cost += costChf;
        }
      });

      return { totals, totalRevenueChf, totalCostChf, monthlyAgg };
    },
  });


  const monthly = useMemo(
    () => EMPTY_MONTHLY.map((m, i) => ({ ...m, month: MONTH_SHORT[i], monthIndex: i })),
    []
  );

  const periodStats = useMemo(() => {
    if (period === "all") {
      return monthly.reduce(
        (acc, m) => ({
          revenue: acc.revenue + m.revenue,
          leads: acc.leads + m.leads,
          invoices_issued: acc.invoices_issued + m.invoices_issued,
          invoices_pending: acc.invoices_pending + m.invoices_pending,
        }),
        { revenue: 0, leads: 0, invoices_issued: 0, invoices_pending: 0 }
      );
    }
    return monthly[period];
  }, [monthly, period]);

  const { data: recentClients } = useQuery({
    queryKey: ["admin-recent-clients"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_clients")
        .select("id, company_name, contact_name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: recentInvoices } = useQuery({
    queryKey: ["admin-recent-invoices"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_invoices")
        .select("id, invoice_number, total, status, invoice_date, currency, fx_rate_to_chf, admin_clients(company_name)")
        .order("invoice_date", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data } = await (supabase
        .from("admin_orders") as any)
        .select("id, order_date, order_number, admin_clients(company_name), admin_order_lines(quantity, unit_price, currency, fx_rate_to_chf, domain)")
        .order("order_date", { ascending: false })
        .limit(5);
      return (data ?? []) as any[];
    },
  });

  // Sélection des données financières selon période
  const monthlyAgg = financials?.monthlyAgg ?? Array.from({ length: 12 }, () => ({ revenue: 0, cost: 0 }));
  const periodFinancials = useMemo(() => {
    if (period === "all") {
      return {
        revenue: financials?.totalRevenueChf ?? 0,
        cost: financials?.totalCostChf ?? 0,
      };
    }
    const m = monthlyAgg[period] ?? { revenue: 0, cost: 0 };
    return { revenue: m.revenue, cost: m.cost };
  }, [financials, monthlyAgg, period]);

  const totalRevenue = periodFinancials.revenue;
  const totalCost = periodFinancials.cost;
  const totalMargin = totalRevenue - totalCost;
  const marginPct = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

  const cadNative = financials?.totals.CAD.native ?? 0;
  const chfNative = financials?.totals.CHF.native ?? 0;

  const chartData: RevenueCostPoint[] = useMemo(
    () =>
      monthlyAgg.map((m, i) => ({
        name: MONTH_SHORT[i],
        revenue: Math.round(m.revenue),
        cost: Math.round(m.cost),
        margin: Math.round(m.revenue - m.cost),
      })),
    [monthlyAgg]
  );

  const secondaryCards = [
    { label: "Clients actifs", value: activeClientsCount ?? "—", icon: Users, color: "from-emerald-500/10 to-emerald-500/5" },
    { label: "Leads livrés", value: periodStats.leads, icon: ShoppingBag, color: "from-blue-500/10 to-blue-500/5" },
    { label: "Factures émises", value: periodStats.invoices_issued, icon: FileText, color: "from-violet-500/10 to-violet-500/5" },
    { label: "Factures en attente", value: periodStats.invoices_pending, icon: Clock, color: "from-orange-500/10 to-orange-500/5" },
  ];

  const statusVariant = (status: string) => {
    if (status === "payee" || status === "actif") return "default";
    if (status === "en_attente" || status === "envoyee") return "secondary";
    return "outline";
  };

  const periodLabel = period === "all" ? "Année complète" : MONTH_LABELS[period];

  return (
    <AdminLayout title="Dashboard" subtitle={`Vue d'ensemble · ${periodLabel}`}>
      {/* Sélecteur de période */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <span className="text-sm font-medium text-muted-foreground">Période :</span>
        <Select
          value={period === "all" ? "all" : String(period)}
          onValueChange={(v) => setPeriod(v === "all" ? "all" : Number(v))}
        >
          <SelectTrigger className="w-full sm:w-56 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Année complète</SelectItem>
            {MONTH_LABELS.map((m, i) => (
              <SelectItem key={m} value={String(i)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI principaux : CA / Coûts / Marge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border-0 cursor-help">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <TrendingUp className="h-5 w-5 text-[hsl(var(--optimis-green))]" />
                    {cadNative > 0 && <span className="text-[10px] font-semibold text-muted-foreground">CHF + CAD</span>}
                  </div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Chiffre d'affaires</p>
                  <p className="text-3xl font-bold text-[hsl(var(--optimis-green))] mt-1">{formatCHF(totalRevenue)}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Prix de vente des leads livrés</p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="space-y-1">
              <p className="font-semibold text-xs">Détail par devise (total)</p>
              <p className="text-xs">🇨🇭 CHF natif : <strong>{formatCHF(chfNative)}</strong></p>
              <p className="text-xs">🇨🇦 CAD natif : <strong>{formatCAD(cadNative)}</strong></p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Card className="bg-gradient-to-br from-rose-500/15 to-rose-500/5 border-0">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <TrendingDown className="h-5 w-5 text-rose-600" />
            </div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Coût total</p>
            <p className="text-3xl font-bold text-rose-700 mt-1">{formatCHF(totalCost)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Σ (avg_cpl × quantité)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-0">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <Percent className="h-5 w-5 text-amber-600" />
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${marginPct >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                {marginPct.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Marge nette</p>
            <p className={`text-3xl font-bold mt-1 ${totalMargin >= 0 ? "text-[hsl(var(--optimis-green))]" : "text-rose-700"}`}>
              {formatCHF(totalMargin)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">CA − Coût</p>
          </CardContent>
        </Card>
      </div>

      {/* Cartes secondaires */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {secondaryCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className={`bg-gradient-to-br ${color} border-0`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Icon className="h-5 w-5 text-[hsl(var(--optimis-green))]" />
              </div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
              <p className="text-2xl font-bold text-[hsl(var(--optimis-green))] mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphique combiné CA / Coûts / Marge */}
      <div className="mb-8">
        <RevenueCostChart
          data={chartData}
          subtitle={period === "all" ? "Vue annuelle par mois (données réelles)" : `Mois sélectionné : ${periodLabel}`}
        />
      </div>

      {/* Listes récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[hsl(var(--optimis-green))]">Derniers clients</h3>
              <Link to="/admin/clients" className="text-sm text-[hsl(var(--optimis-green))] hover:underline">Voir tout</Link>
            </div>
            <div className="space-y-3">
              {recentClients?.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{c.company_name}</p>
                    <p className="text-xs text-muted-foreground">{c.contact_name}</p>
                  </div>
                  <Badge variant={statusVariant(c.status)}>{STATUS_LABELS[c.status]}</Badge>
                </div>
              ))}
              {recentClients?.length === 0 && <p className="text-sm text-muted-foreground">Aucun client</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[hsl(var(--optimis-green))]">Dernières factures</h3>
              <Link to="/admin/factures" className="text-sm text-[hsl(var(--optimis-green))] hover:underline">Voir tout</Link>
            </div>
            <div className="space-y-3">
              {recentInvoices?.map((i: any) => {
                const cur: Currency = (i.currency as Currency) ?? "CHF";
                const fx = Number(i.fx_rate_to_chf) || 1;
                return (
                  <div key={i.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{i.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">{i.admin_clients?.company_name} · {formatDate(i.invoice_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatMoney(Number(i.total), cur)}
                        {cur === "CAD" && (
                          <span className="text-[10px] text-muted-foreground ml-1">
                            (≈ {formatCHF(toCHF(Number(i.total), cur, fx))})
                          </span>
                        )}
                      </p>
                      <Badge variant={statusVariant(i.status)} className="text-xs">{STATUS_LABELS[i.status]}</Badge>
                    </div>
                  </div>
                );
              })}
              {recentInvoices?.length === 0 && <p className="text-sm text-muted-foreground">Aucune facture</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[hsl(var(--optimis-green))]">Dernières commandes</h3>
              <Link to="/admin/commandes" className="text-sm text-[hsl(var(--optimis-green))] hover:underline">Voir tout</Link>
            </div>
            <div className="space-y-3">
              {recentOrders?.map((o: any) => {
                const lns = o.admin_order_lines ?? [];
                const totalChf = lns.reduce(
                  (s: number, l: any) =>
                    s + toCHF((Number(l.quantity) || 0) * (Number(l.unit_price) || 0), (l.currency as Currency) ?? "CHF", Number(l.fx_rate_to_chf) || 1),
                  0
                );
                const totalQty = lns.reduce((s: number, l: any) => s + (Number(l.quantity) || 0), 0);
                const firstDomain = lns[0]?.domain;
                const more = lns.length > 1 ? ` + ${lns.length - 1}` : "";
                return (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{o.admin_clients?.company_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {firstDomain ? (DOMAIN_LABELS_FULL[firstDomain] ?? firstDomain) : "—"}{more} · {formatDate(o.order_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCHF(totalChf)}</p>
                      <p className="text-xs text-muted-foreground">{totalQty} leads · {lns.length} ligne{lns.length > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                );
              })}
              {recentOrders?.length === 0 && <p className="text-sm text-muted-foreground">Aucune commande</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
