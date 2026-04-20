import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCHF, formatDate, STATUS_LABELS } from "@/admin/lib/format";

export default function AdminInvoices() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_invoices")
        .select("*, admin_clients(company_name)")
        .order("invoice_date", { ascending: false });
      return data ?? [];
    },
  });

  const markPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_invoices")
        .update({ status: "payee", paid_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-invoices"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Facture marquée comme payée" });
    },
  });

  const statusVariant = (s: string) => {
    if (s === "payee") return "default";
    if (s === "envoyee" || s === "en_attente") return "secondary";
    return "outline";
  };

  return (
    <AdminLayout
      title="Factures"
      subtitle={`${invoices?.length ?? 0} facture${(invoices?.length ?? 0) > 1 ? "s" : ""}`}
      actions={
        <Button size="sm" disabled>
          <FileText className="h-4 w-4" /> Créer une facture (Phase 2)
        </Button>
      }
    >
      <Card className="mb-6 bg-gradient-to-r from-[hsl(var(--optimis-green-light))] to-[hsl(var(--optimis-green-pastel))] border-0">
        <CardContent className="p-5">
          <p className="text-sm text-[hsl(var(--optimis-green))]">
            <strong>Phase 2 à venir :</strong> création de factures, génération PDF avec QR-bill suisse, envoi par email.
            Pour l'instant, vous pouvez consulter les factures et les marquer comme payées.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-6 py-3 font-semibold">N° Facture</th>
                    <th className="px-6 py-3 font-semibold">Client</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Échéance</th>
                    <th className="px-6 py-3 font-semibold text-right">Total</th>
                    <th className="px-6 py-3 font-semibold">Statut</th>
                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices?.map((inv: any) => (
                    <tr key={inv.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium">{inv.invoice_number}</td>
                      <td className="px-6 py-4">{inv.admin_clients?.company_name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(inv.invoice_date)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(inv.due_date)}</td>
                      <td className="px-6 py-4 text-right font-semibold">{formatCHF(Number(inv.total))}</td>
                      <td className="px-6 py-4"><Badge variant={statusVariant(inv.status)}>{STATUS_LABELS[inv.status]}</Badge></td>
                      <td className="px-6 py-4 text-right">
                        {inv.status !== "payee" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markPaid.mutate(inv.id)}
                            disabled={markPaid.isPending}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Marquer payée
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {invoices?.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Aucune facture</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
