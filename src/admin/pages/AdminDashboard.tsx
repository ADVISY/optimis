import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingBag, FileText, Clock, TrendingUp } from "lucide-react";
import { formatCHF, formatDate, STATUS_LABELS } from "@/admin/lib/format";
import { DOMAIN_LABELS_FULL } from "@/admin/lib/productCategories";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DashboardChart, ChartMetric, METRIC_CONFIG } from "@/admin/components/DashboardChart";

const MONTH_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MONTH_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

// Données fictives réalistes par mois (CHF / leads / factures)
const MOCK_MONTHLY = [
  { revenue: 18500, leads: 42, invoices_issued: 8, invoices_pending: 3 },
  { revenue: 22300, leads: 51, invoices_issued: 9, invoices_pending: 2 },
  { revenue: 27800, leads: 63, invoices_issued: 11, invoices_pending: 4 },
  { revenue: 31200, leads: 71, invoices_issued: 12, invoices_pending: 3 },
  { revenue: 29400, leads: 67, invoices_issued: 11, invoices_pending: 5 },
  { revenue: 34800, leads: 82, invoices_issued: 14, invoices_pending: 4 },
  { revenue: 28600, leads: 65, invoices_issued: 10, invoices_pending: 6 },
  { revenue: 24900, leads: 58, invoices_issued: 9, invoices_pending: 3 },
  { revenue: 33500, leads: 78, invoices_issued: 13, invoices_pending: 4 },
  { revenue: 38200, leads: 89, invoices_issued: 15, invoices_pending: 5 },
  { revenue: 41700, leads: 96, invoices_issued: 16, invoices_pending: 4 },
  { revenue: 45300, leads: 104, invoices_issued: 18, invoices_pending: 6 },
];

export default function AdminDashboard() {
  // "all" = année / 0..11 = mois
  const [period, setPeriod] = useState<"all" | number>("all");
  const [metric, setMetric] = useState<ChartMetric>("revenue");

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

  const monthly = useMemo(
    () => MOCK_MONTHLY.map((m, i) => ({ ...m, month: MONTH_SHORT[i], monthIndex: i })),
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
        .select("id, invoice_number, total, status, invoice_date, admin_clients(company_name)")
        .order("invoice_date", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_orders")
        .select("id, order_date, domain, quantity, total, admin_clients(company_name)")
        .order("order_date", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const cards = [
    { label: "Clients actifs", value: activeClientsCount ?? "—", icon: Users, color: "from-emerald-500/10 to-emerald-500/5" },
    { label: "CA", value: formatCHF(periodStats.revenue), icon: TrendingUp, color: "from-amber-500/10 to-amber-500/5" },
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

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className={`bg-gradient-to-br ${color} border-0 transition-all`}>
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

      {/* Graphique principal + sélecteur métrique */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-base font-semibold text-[hsl(var(--optimis-green))]">Statistiques</h2>
          <ToggleGroup
            type="single"
            value={metric}
            onValueChange={(v) => v && setMetric(v as ChartMetric)}
            className="bg-white rounded-xl p-1 shadow-sm border border-border"
          >
            {(Object.keys(METRIC_CONFIG) as ChartMetric[]).map((k) => (
              <ToggleGroupItem
                key={k}
                value={k}
                className="text-xs px-3 py-1.5 data-[state=on]:bg-[hsl(var(--optimis-green))] data-[state=on]:text-white rounded-lg"
              >
                {METRIC_CONFIG[k].label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <DashboardChart data={monthly} metric={metric} selectedMonth={period} />
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
              {recentInvoices?.map((i: any) => (
                <div key={i.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{i.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{i.admin_clients?.company_name} · {formatDate(i.invoice_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCHF(Number(i.total))}</p>
                    <Badge variant={statusVariant(i.status)} className="text-xs">{STATUS_LABELS[i.status]}</Badge>
                  </div>
                </div>
              ))}
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
              {recentOrders?.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{o.admin_clients?.company_name}</p>
                    <p className="text-xs text-muted-foreground">{DOMAIN_LABELS_FULL[o.domain] ?? o.domain} · {formatDate(o.order_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCHF(Number(o.total))}</p>
                    <p className="text-xs text-muted-foreground">{o.quantity} leads</p>
                  </div>
                </div>
              ))}
              {recentOrders?.length === 0 && <p className="text-sm text-muted-foreground">Aucune commande</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
