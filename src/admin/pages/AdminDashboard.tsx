import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingBag, FileText, Clock, TrendingUp } from "lucide-react";
import { formatCHF, formatDate, DOMAIN_LABELS, STATUS_LABELS } from "@/admin/lib/format";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const startIso = startOfMonth.toISOString().slice(0, 10);

      const [clients, orders, invoices, pending] = await Promise.all([
        supabase.from("admin_clients").select("id", { count: "exact", head: true }).eq("status", "actif"),
        supabase.from("admin_orders").select("total, quantity").gte("order_date", startIso),
        supabase.from("admin_invoices").select("total, status").gte("invoice_date", startIso),
        supabase.from("admin_invoices").select("id", { count: "exact", head: true }).in("status", ["envoyee", "en_attente"]),
      ]);

      const monthlyRevenue = (invoices.data ?? [])
        .filter((i: any) => i.status === "payee")
        .reduce((s: number, i: any) => s + Number(i.total), 0);

      const leadsDelivered = (orders.data ?? []).reduce((s: number, o: any) => s + Number(o.quantity), 0);

      return {
        activeClients: clients.count ?? 0,
        monthlyRevenue,
        leadsDelivered,
        invoicesIssued: invoices.data?.length ?? 0,
        invoicesPending: pending.count ?? 0,
      };
    },
  });

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
    { label: "Clients actifs", value: stats?.activeClients ?? "—", icon: Users, color: "from-emerald-500/10 to-emerald-500/5" },
    { label: "CA du mois", value: stats ? formatCHF(stats.monthlyRevenue) : "—", icon: TrendingUp, color: "from-amber-500/10 to-amber-500/5" },
    { label: "Leads livrés ce mois", value: stats?.leadsDelivered ?? "—", icon: ShoppingBag, color: "from-blue-500/10 to-blue-500/5" },
    { label: "Factures émises", value: stats?.invoicesIssued ?? "—", icon: FileText, color: "from-violet-500/10 to-violet-500/5" },
    { label: "Factures en attente", value: stats?.invoicesPending ?? "—", icon: Clock, color: "from-orange-500/10 to-orange-500/5" },
  ];

  const statusVariant = (status: string) => {
    if (status === "payee" || status === "actif") return "default";
    if (status === "en_attente" || status === "envoyee") return "secondary";
    return "outline";
  };

  return (
    <AdminLayout title="Dashboard" subtitle="Vue d'ensemble de votre activité">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
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
                    <p className="text-xs text-muted-foreground">{DOMAIN_LABELS[o.domain]} · {formatDate(o.order_date)}</p>
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
