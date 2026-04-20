import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCHF } from "@/admin/lib/format";
import {
  PRODUCT_CATEGORIES,
  DOMAIN_LABELS_FULL,
  OrderDomain,
} from "@/admin/lib/productCategories";

interface InvoiceLine {
  id: string;
  category: string;
  domain: OrderDomain | "";
  description: string;
  quantity: number;
  unit_price: number;
}

const newLine = (): InvoiceLine => ({
  id: crypto.randomUUID(),
  category: "assurance_finances",
  domain: "",
  description: "",
  quantity: 1,
  unit_price: 0,
});

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  prefillFromOrder?: {
    client_id: string;
    lines: { domain: string; quantity: number; unit_price: number; comment?: string }[];
  };
}

export function InvoiceFormModal({ open, onOpenChange, prefillFromOrder }: Props) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [clientId, setClientId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [vatRate, setVatRate] = useState(8.1);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<InvoiceLine[]>([newLine()]);

  // Pré-remplissage depuis une commande
  useState(() => {
    if (prefillFromOrder) {
      setClientId(prefillFromOrder.client_id);
      setLines(
        prefillFromOrder.lines.map((l) => ({
          id: crypto.randomUUID(),
          category:
            PRODUCT_CATEGORIES.find((c) => c.subDomains.some((s) => s.value === l.domain))
              ?.key ?? "assurance_finances",
          domain: l.domain as OrderDomain,
          description:
            (DOMAIN_LABELS_FULL[l.domain] ?? l.domain) +
            (l.comment ? ` — ${l.comment}` : ""),
          quantity: l.quantity,
          unit_price: l.unit_price,
        }))
      );
    }
  });

  const { data: clients } = useQuery({
    queryKey: ["admin-clients-min"],
    queryFn: async () =>
      (await supabase.from("admin_clients").select("id, company_name").order("company_name"))
        .data ?? [],
  });

  const { data: settings } = useQuery({
    queryKey: ["admin-company-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_company_settings")
        .select("default_vat_rate, payment_terms_days")
        .limit(1)
        .single();
      return data;
    },
  });

  // Initialise vatRate avec la valeur par défaut
  useState(() => {
    if (settings?.default_vat_rate) setVatRate(Number(settings.default_vat_rate));
  });

  const updateLine = (id: string, patch: Partial<InvoiceLine>) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const removeLine = (id: string) =>
    setLines((ls) => (ls.length === 1 ? ls : ls.filter((l) => l.id !== id)));

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);
  const vatAmount = +(subtotal * (vatRate / 100)).toFixed(2);
  const total = +(subtotal + vatAmount).toFixed(2);

  const canSubmit =
    !!clientId &&
    lines.length > 0 &&
    lines.every((l) => l.description.trim() && l.quantity > 0 && l.unit_price >= 0);

  const reset = () => {
    setClientId("");
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setLines([newLine()]);
  };

  const create = useMutation({
    mutationFn: async () => {
      const dueDays = settings?.payment_terms_days ?? 30;
      const due = new Date(invoiceDate);
      due.setDate(due.getDate() + dueDays);

      const { data: inv, error: invErr } = await supabase
        .from("admin_invoices")
        .insert({
          client_id: clientId,
          invoice_date: invoiceDate,
          due_date: due.toISOString().slice(0, 10),
          subtotal,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          total,
          notes: notes || null,
          status: "brouillon",
        })
        .select()
        .single();
      if (invErr) throw invErr;

      const lineRows = lines.map((l, i) => ({
        invoice_id: inv.id,
        position: i,
        description: l.description,
        quantity: l.quantity,
        unit_price: l.unit_price,
      }));
      const { error: lnErr } = await supabase
        .from("admin_invoice_lines")
        .insert(lineRows);
      if (lnErr) throw lnErr;

      return inv;
    },
    onSuccess: (inv) => {
      qc.invalidateQueries({ queryKey: ["admin-invoices"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      onOpenChange(false);
      reset();
      toast({
        title: "Facture créée",
        description: `${inv.invoice_number} · ${formatCHF(Number(inv.total))}`,
      });
    },
    onError: (e: any) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--optimis-green))]">
            Nouvelle facture
          </DialogTitle>
        </DialogHeader>

        {/* Entête */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-border">
          <div className="md:col-span-2 space-y-2">
            <Label>Client *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date *</Label>
            <Input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
        </div>

        {/* Lignes */}
        <div className="space-y-3 py-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-[hsl(var(--optimis-green))]">
              Lignes de facture
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLines((ls) => [...ls, newLine()])}
            >
              <Plus className="h-4 w-4" /> Ajouter une ligne
            </Button>
          </div>

          {lines.map((line, idx) => {
            const cat = PRODUCT_CATEGORIES.find((c) => c.key === line.category);
            const lineTotal = line.quantity * line.unit_price;
            return (
              <div
                key={line.id}
                className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Ligne {idx + 1}
                  </span>
                  {lines.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(line.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Catégorie</Label>
                    <Select
                      value={line.category}
                      onValueChange={(v) =>
                        updateLine(line.id, { category: v, domain: "" })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map((c) => (
                          <SelectItem key={c.key} value={c.key}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Sous-domaine</Label>
                    <Select
                      value={line.domain}
                      onValueChange={(v) => {
                        const lbl = DOMAIN_LABELS_FULL[v] ?? "";
                        updateLine(line.id, {
                          domain: v as OrderDomain,
                          description: line.description || lbl,
                        });
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cat?.subDomains.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Description *</Label>
                  <Input
                    value={line.description}
                    onChange={(e) =>
                      updateLine(line.id, { description: e.target.value })
                    }
                    className="bg-white"
                    placeholder="Ex: Leads assurance maladie - Novembre 2025"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Quantité</Label>
                    <Input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.id, {
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Prix unit. (CHF)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={line.unit_price}
                      onChange={(e) =>
                        updateLine(line.id, {
                          unit_price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Total ligne</Label>
                    <div className="h-10 px-3 flex items-center justify-end rounded-md border border-border bg-white font-semibold text-[hsl(var(--optimis-green))]">
                      {formatCHF(lineTotal)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TVA + notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label>Taux TVA (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={vatRate}
              onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        {/* Totaux */}
        <div className="bg-[hsl(var(--optimis-green))]/5 border border-[hsl(var(--optimis-green))]/20 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total</span>
            <span className="font-medium">{formatCHF(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TVA ({vatRate}%)</span>
            <span className="font-medium">{formatCHF(vatAmount)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[hsl(var(--optimis-green))]/20">
            <span className="text-sm font-semibold uppercase text-muted-foreground">
              Total
            </span>
            <span className="text-2xl font-bold text-[hsl(var(--optimis-green))]">
              {formatCHF(total)}
            </span>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => create.mutate()}
            disabled={create.isPending || !canSubmit}
          >
            {create.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Créer la facture"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
