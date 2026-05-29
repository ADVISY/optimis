import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PartnerLayout } from "@/partner/components/PartnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Download, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUT_FACTURE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  brouillon: { label: "Brouillon", variant: "outline" },
  envoyee: { label: "Envoyée", variant: "default" },
  en_attente: { label: "En attente", variant: "outline" },
  payee: { label: "Payée ✓", variant: "secondary" },
};

export default function PartnerInvoices() {
  const { toast } = useToast();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["partner-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_invoices")
        .select(`
          *,
          admin_invoice_lines(*),
          admin_clients(company_name)
        `)
        .order("invoice_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const downloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    setDownloadingId(invoiceId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
        body: { invoice_id: invoiceId },
      });
      if (error) throw error;
      if (data instanceof Blob) {
        const url = URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (data?.url) {
        window.open(data.url, "_blank");
      } else if (data?.pdf_base64) {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${data.pdf_base64}`;
        link.download = `${invoiceNumber}.pdf`;
        link.click();
      } else {
        toast({ title: "PDF généré", description: "Vérifiez votre boîte de réception ou recharger la page." });
      }
    } catch (e: any) {
      toast({ title: "Erreur PDF", description: e.message, variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

  // KPIs en haut
  const totalPaid = (invoices ?? [])
    .filter((i: any) => i.status === "payee")
    .reduce((s: number, i: any) => s + Number(i.total ?? 0), 0);
  const totalDue = (invoices ?? [])
    .filter((i: any) => i.status !== "payee" && i.status !== "brouillon")
    .reduce((s: number, i: any) => s + Number(i.total ?? 0), 0);

  return (
    <PartnerLayout title="Mes factures" subtitle="Historique et état de vos factures Optimis">
      <div className="space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase text-muted-foreground tracking-wider">Total payé</div>
              <div className="text-3xl font-bold mt-1 text-green-700">
                {totalPaid.toLocaleString("fr-CH")} CHF
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase text-muted-foreground tracking-wider">Solde dû</div>
              <div className={`text-3xl font-bold mt-1 ${totalDue > 0 ? "text-orange-600" : "text-slate-400"}`}>
                {totalDue.toLocaleString("fr-CH")} CHF
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : (invoices?.length ?? 0) === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Aucune facture pour le moment</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-3 py-3 w-10"></th>
                      <th className="px-4 py-3 font-semibold">N° Facture</th>
                      <th className="px-4 py-3 font-semibold">Date émission</th>
                      <th className="px-4 py-3 font-semibold">Échéance</th>
                      <th className="px-4 py-3 font-semibold text-right">Montant</th>
                      <th className="px-4 py-3 font-semibold">Statut</th>
                      <th className="px-4 py-3 font-semibold text-right">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices!.map((inv: any) => {
                      const expanded = expandedIds.has(inv.id);
                      const statutCfg = STATUT_FACTURE[inv.status] ?? STATUT_FACTURE.brouillon;
                      const isOverdue =
                        inv.status !== "payee" && inv.due_date && new Date(inv.due_date) < new Date();
                      return (
                        <>
                          <tr key={inv.id} className="border-t border-border hover:bg-muted/30">
                            <td className="px-3 py-4">
                              <button
                                onClick={() => toggleExpand(inv.id)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </button>
                            </td>
                            <td className="px-4 py-4 font-mono text-xs font-semibold">{inv.invoice_number}</td>
                            <td className="px-4 py-4 text-muted-foreground">
                              {new Date(inv.invoice_date).toLocaleDateString("fr-CH")}
                            </td>
                            <td className={`px-4 py-4 ${isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                              {inv.due_date ? new Date(inv.due_date).toLocaleDateString("fr-CH") : "—"}
                              {isOverdue && <span className="ml-2 text-[10px] uppercase">en retard</span>}
                            </td>
                            <td className="px-4 py-4 text-right font-semibold">
                              {Number(inv.total).toLocaleString("fr-CH")} {inv.currency ?? "CHF"}
                            </td>
                            <td className="px-4 py-4">
                              <Badge variant={statutCfg.variant} className="gap-1">
                                {inv.status === "payee" && <CheckCircle2 className="h-3 w-3" />}
                                {statutCfg.label}
                              </Badge>
                              {inv.paid_at && (
                                <div className="text-[10px] text-muted-foreground mt-1">
                                  Payée le {new Date(inv.paid_at).toLocaleDateString("fr-CH")}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadPdf(inv.id, inv.invoice_number)}
                                disabled={downloadingId === inv.id}
                              >
                                {downloadingId === inv.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Download className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </td>
                          </tr>
                          {expanded && (
                            <tr className="bg-muted/20">
                              <td colSpan={7} className="px-12 py-3">
                                <table className="w-full text-xs">
                                  <thead className="text-muted-foreground">
                                    <tr>
                                      <th className="text-left py-1">Description</th>
                                      <th className="text-right py-1">Quantité</th>
                                      <th className="text-right py-1">Prix unit.</th>
                                      <th className="text-right py-1">Total ligne</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(inv.admin_invoice_lines ?? []).map((l: any) => (
                                      <tr key={l.id} className="border-t">
                                        <td className="py-2">{l.description ?? l.product_name}</td>
                                        <td className="py-2 text-right">{l.quantity}</td>
                                        <td className="py-2 text-right">
                                          {Number(l.unit_price).toLocaleString("fr-CH")}
                                        </td>
                                        <td className="py-2 text-right font-semibold">
                                          {(Number(l.quantity) * Number(l.unit_price)).toLocaleString("fr-CH")}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr className="border-t-2">
                                      <td colSpan={3} className="py-2 text-right text-muted-foreground">Sous-total</td>
                                      <td className="py-2 text-right">{Number(inv.subtotal).toLocaleString("fr-CH")}</td>
                                    </tr>
                                    <tr>
                                      <td colSpan={3} className="py-1 text-right text-muted-foreground text-[11px]">
                                        TVA ({inv.vat_rate}%)
                                      </td>
                                      <td className="py-1 text-right">{Number(inv.vat_amount).toLocaleString("fr-CH")}</td>
                                    </tr>
                                    <tr className="border-t">
                                      <td colSpan={3} className="py-2 text-right font-bold">Total</td>
                                      <td className="py-2 text-right font-bold">
                                        {Number(inv.total).toLocaleString("fr-CH")} {inv.currency ?? "CHF"}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                                {inv.notes && (
                                  <div className="mt-3 text-xs text-muted-foreground italic">
                                    Note : {inv.notes}
                                  </div>
                                )}
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
