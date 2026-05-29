import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PartnerLayout } from "@/partner/components/PartnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";

const STATUT_DIST: Record<string, { label: string; color: string; barColor: string }> = {
  attente_paiement: { label: "En attente paiement", color: "text-slate-500", barColor: "bg-slate-300" },
  active: { label: "Distribution en cours", color: "text-blue-700", barColor: "bg-blue-500" },
  epuisee: { label: "Livrée ✓", color: "text-green-700", barColor: "bg-green-500" },
  expiree: { label: "Expirée", color: "text-orange-600", barColor: "bg-orange-400" },
  en_pause: { label: "En pause", color: "text-yellow-700", barColor: "bg-yellow-400" },
  annulee: { label: "Annulée", color: "text-red-600", barColor: "bg-red-400" },
};

export default function PartnerOrders() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: orders, isLoading } = useQuery({
    queryKey: ["partner-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_orders")
        .select(`
          *,
          admin_order_lines(*),
          admin_invoices(id, invoice_number, status, total, paid_at, currency)
        `)
        .order("order_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const orderTotal = (o: any) =>
    (o.admin_order_lines ?? []).reduce(
      (s: number, l: any) => s + Number(l.quantity ?? 0) * Number(l.unit_price ?? 0),
      0
    );

  const orderProgress = (o: any) => {
    const lines = o.admin_order_lines ?? [];
    const total = lines.reduce((s: number, l: any) => s + Number(l.quantity ?? 0), 0);
    const remaining = lines.reduce(
      (s: number, l: any) => s + Number(l.solde_restant ?? l.quantity ?? 0),
      0
    );
    const delivered = Math.max(0, total - remaining);
    const pct = total > 0 ? (delivered / total) * 100 : 0;
    return { total, delivered, remaining, pct };
  };

  return (
    <PartnerLayout title="Mes commandes" subtitle="Suivez l'avancement de vos commandes de leads">
      <div className="space-y-4">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : (orders?.length ?? 0) === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Aucune commande pour le moment</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-3 py-3 w-10"></th>
                      <th className="px-4 py-3 font-semibold">N° Commande</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold text-right">Total</th>
                      <th className="px-4 py-3 font-semibold w-48">Distribution</th>
                      <th className="px-4 py-3 font-semibold">Statut paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders!.map((o: any) => {
                      const expanded = expandedIds.has(o.id);
                      const total = orderTotal(o);
                      const prog = orderProgress(o);
                      const statutCfg = STATUT_DIST[o.statut_distribution ?? "attente_paiement"];
                      const invoice = o.admin_invoices;
                      return (
                        <>
                          <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                            <td className="px-3 py-4">
                              <button
                                onClick={() => toggleExpand(o.id)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </button>
                            </td>
                            <td className="px-4 py-4 font-mono text-xs">{o.order_number}</td>
                            <td className="px-4 py-4 text-muted-foreground">
                              {new Date(o.order_date).toLocaleDateString("fr-CH")}
                            </td>
                            <td className="px-4 py-4 text-right font-semibold">
                              {total.toLocaleString("fr-CH")} CHF
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-1 min-w-[140px]">
                                <div className="flex items-baseline justify-between text-xs">
                                  <span className={`font-semibold ${statutCfg.color}`}>
                                    {prog.delivered}/{prog.total}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {Math.round(prog.pct)}%
                                  </span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${statutCfg.barColor}`}
                                    style={{ width: `${prog.pct}%` }}
                                  />
                                </div>
                                <div className={`text-[10px] ${statutCfg.color}`}>{statutCfg.label}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {invoice ? (
                                invoice.status === "payee" ? (
                                  <Badge variant="secondary" className="gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Payée
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">{invoice.invoice_number}</Badge>
                                )
                              ) : (
                                <span className="text-xs text-muted-foreground italic">non facturée</span>
                              )}
                            </td>
                          </tr>
                          {expanded && (
                            <tr className="bg-muted/20">
                              <td colSpan={6} className="px-12 py-3">
                                <table className="w-full text-xs">
                                  <thead className="text-muted-foreground">
                                    <tr>
                                      <th className="text-left py-1">Produit</th>
                                      <th className="text-right py-1">Quantité</th>
                                      <th className="text-right py-1">Prix unit.</th>
                                      <th className="text-right py-1">Total</th>
                                      <th className="text-right py-1">Distribués</th>
                                      <th className="text-right py-1">Restants</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(o.admin_order_lines ?? []).map((l: any) => {
                                      const lineDist = Math.max(
                                        0,
                                        Number(l.quantity) - Number(l.solde_restant ?? l.quantity)
                                      );
                                      return (
                                        <tr key={l.id} className="border-t">
                                          <td className="py-2 font-medium">{l.product_name}</td>
                                          <td className="py-2 text-right">{l.quantity}</td>
                                          <td className="py-2 text-right">
                                            {Number(l.unit_price).toLocaleString("fr-CH")} {l.currency ?? "CHF"}
                                          </td>
                                          <td className="py-2 text-right font-semibold">
                                            {(Number(l.quantity) * Number(l.unit_price)).toLocaleString("fr-CH")}{" "}
                                            {l.currency ?? "CHF"}
                                          </td>
                                          <td className="py-2 text-right text-green-700">{lineDist}</td>
                                          <td className="py-2 text-right text-blue-700 font-semibold">
                                            {l.solde_restant ?? l.quantity}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PartnerLayout>
  );
}
