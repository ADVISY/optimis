import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  CheckCircle2,
  FileText,
  Plus,
  Download,
  Send,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCHF, formatDate, STATUS_LABELS } from "@/admin/lib/format";
import { InvoiceFormModal } from "@/admin/components/InvoiceFormModal";

const STATUSES = ["brouillon", "envoyee", "en_attente", "payee"] as const;

export default function AdminInvoices() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

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

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const patch: any = { status };
      if (status === "payee") patch.paid_at = new Date().toISOString();
      else patch.paid_at = null;
      const { error } = await supabase
        .from("admin_invoices")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-invoices"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: (e: any) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      // Lignes supprimées en cascade ? Sinon on les supprime d'abord
      await supabase.from("admin_invoice_lines").delete().eq("invoice_id", id);
      const { error } = await supabase.from("admin_invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-invoices"] });
      toast({ title: "Facture supprimée" });
    },
  });

  const generatePdf = async (
    id: string,
    invoiceNumber: string,
    clientName: string,
    invoiceDate: string,
  ) => {
    setGenerating(id);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-invoice-pdf",
        { body: { invoice_id: id } }
      );
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Erreur génération");

      // Construit le nom de fichier : Client_MM-YYYY_NumeroFacture.pdf
      const slug = (s: string) =>
        (s || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60);
      const d = new Date(invoiceDate);
      const monthYear = `${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
      const fileName = `${slug(clientName) || "Client"}_${monthYear}_${invoiceNumber}.pdf`;

      // Télécharge le PDF côté client (force download au lieu d'ouvrir une page Supabase)
      const res = await fetch(data.url);
      if (!res.ok) throw new Error("Impossible de récupérer le PDF");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      toast({ title: "PDF téléchargé", description: fileName });
    } catch (e: any) {
      toast({
        title: "Erreur PDF",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const regenerateAll = async () => {
    if (!invoices || invoices.length === 0) return;
    if (
      !confirm(
        `Régénérer le PDF de ${invoices.length} facture${
          invoices.length > 1 ? "s" : ""
        } ? Les anciens fichiers seront remplacés.`,
      )
    )
      return;

    setBulkProgress({ done: 0, total: invoices.length });
    let ok = 0;
    let ko = 0;
    for (let i = 0; i < invoices.length; i++) {
      const inv: any = invoices[i];
      try {
        const { data, error } = await supabase.functions.invoke(
          "generate-invoice-pdf",
          { body: { invoice_id: inv.id } },
        );
        if (error || !data?.success) throw new Error(data?.error || error?.message || "Erreur");
        ok++;
      } catch (e) {
        console.error("[regen]", inv.invoice_number, e);
        ko++;
      }
      setBulkProgress({ done: i + 1, total: invoices.length });
    }
    setBulkProgress(null);
    toast({
      title: "Régénération terminée",
      description: `${ok} OK, ${ko} en erreur`,
      variant: ko > 0 ? "destructive" : "default",
    });
  };

  const statusVariant = (s: string) => {
    if (s === "payee") return "default";
    if (s === "envoyee" || s === "en_attente") return "secondary";
    return "outline";
  };

  return (
    <AdminLayout
      title="Factures"
      subtitle={`${invoices?.length ?? 0} facture${
        (invoices?.length ?? 0) > 1 ? "s" : ""
      }`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={regenerateAll}
            disabled={!!bulkProgress || !invoices?.length}
          >
            {bulkProgress ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {bulkProgress.done}/{bulkProgress.total}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> Régénérer tous les PDF
              </>
            )}
          </Button>
          <Button size="sm" onClick={() => setOpenModal(true)}>
            <Plus className="h-4 w-4" /> Nouvelle facture
          </Button>
        </div>
      }
    >
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
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
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices?.map((inv: any) => (
                    <tr
                      key={inv.id}
                      className="border-t border-border hover:bg-muted/30"
                    >
                      <td className="px-6 py-4 font-medium">
                        {inv.invoice_number}
                      </td>
                      <td className="px-6 py-4">
                        {inv.admin_clients?.company_name}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(inv.invoice_date)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(inv.due_date)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {formatCHF(Number(inv.total))}
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          value={inv.status}
                          onValueChange={(v) =>
                            updateStatus.mutate({ id: inv.id, status: v })
                          }
                        >
                          <SelectTrigger className="h-8 w-36 bg-transparent border-0 p-0 hover:bg-muted">
                            <Badge
                              variant={statusVariant(inv.status)}
                              className="cursor-pointer"
                            >
                              {STATUS_LABELS[inv.status]}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {STATUS_LABELS[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generatePdf(inv.id, inv.invoice_number, inv.admin_clients?.company_name ?? "Client", inv.invoice_date)}
                            disabled={generating === inv.id}
                            title="Générer PDF + QR-bill"
                          >
                            {generating === inv.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            PDF
                          </Button>
                          {inv.status !== "payee" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateStatus.mutate({
                                  id: inv.id,
                                  status: "payee",
                                })
                              }
                              disabled={updateStatus.isPending}
                              className="text-[hsl(var(--optimis-green))]"
                              title="Marquer comme payée"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Supprimer la facture ${inv.invoice_number} ? Cette action est irréversible.`))
                                deleteInvoice.mutate(inv.id);
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {invoices?.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-muted-foreground"
                      >
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        Aucune facture. Cliquez sur "Nouvelle facture" pour
                        commencer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <InvoiceFormModal open={openModal} onOpenChange={setOpenModal} />
    </AdminLayout>
  );
}
