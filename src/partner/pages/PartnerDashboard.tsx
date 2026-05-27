import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PartnerLayout } from "@/partner/components/PartnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { usePartnerAuth } from "@/partner/hooks/usePartnerAuth";
import { Inbox, ShoppingBag, FileText, TrendingUp } from "lucide-react";

export default function PartnerDashboard() {
  const { clientIds } = usePartnerAuth();

  const { data: stats } = useQuery({
    queryKey: ["partner-dashboard-stats", clientIds],
    enabled: clientIds.length > 0,
    queryFn: async () => {
      const [leads, orders, invoices] = await Promise.all([
        supabase.from("distributions").select("id, statut_commercial", { count: "exact" }),
        supabase.from("admin_orders").select("id, statut_distribution"),
        supabase.from("admin_invoices").select("id, status, total"),
      ]);

      const leadsRows = leads.data ?? [];
      const ordersRows = orders.data ?? [];
      const invoicesRows = invoices.data ?? [];

      return {
        total_leads: leadsRows.length,
        leads_a_traiter: leadsRows.filter((l: any) => l.statut_commercial === "a_traiter").length,
        leads_signes: leadsRows.filter((l: any) => l.statut_commercial === "signe").length,
        commandes_actives: ordersRows.filter((o: any) => o.statut_distribution === "active").length,
        factures_total: invoicesRows.reduce((s: number, i: any) => s + Number(i.total ?? 0), 0),
      };
    },
  });

  return (
    <PartnerLayout title="Tableau de bord" subtitle="Vue d'ensemble de votre activité">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Leads à traiter"
          value={stats?.leads_a_traiter ?? "—"}
          icon={Inbox}
          color="bg-blue-500"
        />
        <StatCard
          label="Total leads reçus"
          value={stats?.total_leads ?? "—"}
          icon={Inbox}
          color="bg-slate-500"
        />
        <StatCard
          label="Leads signés"
          value={stats?.leads_signes ?? "—"}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          label="Commandes actives"
          value={stats?.commandes_actives ?? "—"}
          icon={ShoppingBag}
          color="bg-amber-500"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-3">Bienvenue dans votre espace courtier</h3>
          <p className="text-sm text-muted-foreground">
            Retrouvez ici tous vos leads achetés via Optimis, vos commandes en cours et vos factures.
            Marquez vos leads (contacté, RDV, devis, signé…) pour suivre votre conversion.
          </p>
        </CardContent>
      </Card>
    </PartnerLayout>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6 flex items-start justify-between">
        <div>
          <div className="text-xs uppercase text-muted-foreground tracking-wider">{label}</div>
          <div className="text-3xl font-bold mt-1">{value}</div>
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color} text-white`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
