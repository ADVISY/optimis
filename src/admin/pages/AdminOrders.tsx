import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Trash2, FileText, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatMoney, toCHF, formatCHF, formatDate, type Currency } from "@/admin/lib/format";
import { InvoiceFormModal } from "@/admin/components/InvoiceFormModal";
import {
  PRODUCT_CATEGORIES,
  DOMAIN_LABELS_FULL,
  OrderDomain,
  buildHierarchyLabel,
  getCategoryLabel,
  getCategoryForDomain,
} from "@/admin/lib/productCategories";
import { Badge } from "@/components/ui/badge";

interface OrderLine {
  id: string;
  product_id: string | null;
  product_name: string;
  category: string;
  subcategory: OrderDomain | "";
  quantity: number;
  unit_price: number;
  currency: Currency;
  fx_rate_to_chf: number;
  comment: string;
}

const newLine = (): OrderLine => ({
  id: crypto.randomUUID(),
  product_id: null,
  product_name: "",
  category: "assurance_finances",
  subcategory: "",
  quantity: 1,
  unit_price: 0,
  currency: "CHF",
  fx_rate_to_chf: 1,
  comment: "",
});

export default function AdminOrders() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoicePrefill, setInvoicePrefill] = useState<
    | {
        client_id: string;
        order_ids: string[];
        lines: { domain: string; quantity: number; unit_price: number; currency: Currency; fx_rate_to_chf: number; comment?: string }[];
      }
    | undefined
  >(undefined);

  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "billed" | "unbilled">("all");

  // Sélection multi-commandes pour facturation groupée
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [clientId, setClientId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<OrderLine[]>([newLine()]);

  const resetForm = () => {
    setClientId("");
    setOrderDate(new Date().toISOString().slice(0, 10));
    setLines([newLine()]);
  };

  const { data: clients } = useQuery({
    queryKey: ["admin-orders-clients"],
    queryFn: async () =>
      (await supabase.from("admin_clients").select("id, company_name").order("company_name")).data ?? [],
  });

  const { data: products } = useQuery({
    queryKey: ["admin-orders-products"],
    queryFn: async () =>
      (
        await supabase
          .from("admin_products")
          .select("id, name, domain, unit_price, currency, fx_rate_to_chf, is_active")
          .eq("is_active", true)
          .order("name")
      ).data ?? [],
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_orders")
        .select("*, admin_clients(id, company_name), admin_order_lines(*)")
        .order("order_date", { ascending: false });
      return data ?? [];
    },
  });

  // Calcule le total CHF d'une commande à partir de ses lignes
  const orderTotalCHF = (o: any) =>
    (o.admin_order_lines ?? []).reduce(
      (s: number, l: any) =>
        s + toCHF(Number(l.line_total ?? l.quantity * l.unit_price), (l.currency as Currency) ?? "CHF", Number(l.fx_rate_to_chf) || 1),
      0
    );

  const filtered = useMemo(() => {
    return (orders ?? []).filter((o: any) => {
      if (filterClient !== "all" && o.client_id !== filterClient) return false;
      if (filterMonth !== "all" && !o.order_date.startsWith(filterMonth)) return false;
      if (filterStatus === "billed" && !o.invoice_id) return false;
      if (filterStatus === "unbilled" && o.invoice_id) return false;
      return true;
    });
  }, [orders, filterClient, filterMonth, filterStatus]);

  const totalFiltered = filtered.reduce((s: number, o: any) => s + orderTotalCHF(o), 0);

  const months = useMemo(() => {
    const set = new Set<string>();
    (orders ?? []).forEach((o: any) => set.add(o.order_date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [orders]);

  // ─── Sélection ───
  const selectedOrders = useMemo(
    () => (orders ?? []).filter((o: any) => selectedOrderIds.has(o.id)),
    [orders, selectedOrderIds]
  );
  const selectedClientId = selectedOrders[0]?.client_id ?? null;
  const allSameClient = selectedOrders.every((o: any) => o.client_id === selectedClientId);
  const anyAlreadyBilled = selectedOrders.some((o: any) => o.invoice_id);
  const canBillSelection = selectedOrderIds.size > 0 && allSameClient && !anyAlreadyBilled;

  const toggleSelect = (id: string) => {
    setSelectedOrderIds((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleExpand = (id: string) => {
    setExpandedIds((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleInvoiceSelection = () => {
    if (!canBillSelection) return;
    const allLines = selectedOrders.flatMap((o: any) =>
      (o.admin_order_lines ?? []).map((l: any) => ({
        domain: l.domain,
        quantity: Number(l.quantity),
        unit_price: Number(l.unit_price),
        currency: (l.currency as Currency) ?? "CHF",
        fx_rate_to_chf: Number(l.fx_rate_to_chf) || 1,
        comment: l.comment || undefined,
      }))
    );
    setInvoicePrefill({
      client_id: selectedClientId!,
      order_ids: Array.from(selectedOrderIds),
      lines: allLines,
    });
    setInvoiceModalOpen(true);
  };

  const handleInvoiceSingle = (o: any) => {
    if (o.invoice_id) {
      toast({ title: "Déjà facturée", description: "Cette commande est liée à une facture.", variant: "destructive" });
      return;
    }
    const ls = (o.admin_order_lines ?? []).map((l: any) => ({
      domain: l.domain,
      quantity: Number(l.quantity),
      unit_price: Number(l.unit_price),
      currency: (l.currency as Currency) ?? "CHF",
      fx_rate_to_chf: Number(l.fx_rate_to_chf) || 1,
      comment: l.comment || undefined,
    }));
    setInvoicePrefill({ client_id: o.client_id, order_ids: [o.id], lines: ls });
    setInvoiceModalOpen(true);
  };

  const updateLine = (id: string, patch: Partial<OrderLine>) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const removeLine = (id: string) =>
    setLines((ls) => (ls.length === 1 ? ls : ls.filter((l) => l.id !== id)));

  const grandTotalCHF = lines.reduce(
    (s, l) => s + toCHF(l.quantity * l.unit_price, l.currency, l.fx_rate_to_chf),
    0
  );

  const canSubmit =
    !!clientId &&
    lines.length > 0 &&
    lines.every((l) => l.subcategory && l.product_name.trim() && l.quantity > 0 && l.unit_price >= 0);

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: order, error: oErr } = await supabase
        .from("admin_orders")
        .insert({ client_id: clientId, order_date: orderDate })
        .select()
        .single();
      if (oErr) throw oErr;
      const lineRows = lines.map((l, i) => ({
        order_id: order.id,
        position: i,
        product_id: l.product_id,
        product_name: l.product_name,
        category: l.category,
        subcategory: l.subcategory,
        domain: l.subcategory as any, // compat
        quantity: l.quantity,
        unit_price: l.unit_price,
        currency: l.currency,
        fx_rate_to_chf: l.fx_rate_to_chf,
        comment: l.comment || null,
      }));
      const { error: lErr } = await (supabase.from("admin_order_lines" as any) as any).insert(lineRows);
      if (lErr) throw lErr;
      return order;
    },
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-revenue-by-currency"] });
      setOpenModal(false);
      resetForm();
      toast({ title: "Commande enregistrée", description: `${(order as any).order_number} · ${lines.length} ligne(s)` });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-revenue-by-currency"] });
      toast({ title: "Commande supprimée" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  return (
    <AdminLayout
      title="Commandes"
      subtitle={`${filtered.length} commande${filtered.length > 1 ? "s" : ""} · ${formatCHF(totalFiltered)}`}
      actions={
        <div className="flex gap-2">
          {selectedOrderIds.size > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleInvoiceSelection}
              disabled={!canBillSelection}
              title={
                !allSameClient
                  ? "Sélectionnez des commandes du même client"
                  : anyAlreadyBilled
                  ? "Une commande sélectionnée est déjà facturée"
                  : "Créer une facture groupée"
              }
            >
              <FileText className="h-4 w-4" />
              Facturer la sélection ({selectedOrderIds.size})
            </Button>
          )}
          <Button onClick={() => setOpenModal(true)} size="sm">
            <Plus className="h-4 w-4" /> Nouvelle commande
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select value={filterClient} onValueChange={setFilterClient}>
          <SelectTrigger className="bg-white"><SelectValue placeholder="Client" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les clients</SelectItem>
            {clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="bg-white"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="unbilled">Non facturées</SelectItem>
            <SelectItem value="billed">Facturées</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="bg-white"><SelectValue placeholder="Mois" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les mois</SelectItem>
            {months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-3 py-3 w-10"></th>
                    <th className="px-3 py-3 w-10"></th>
                    <th className="px-4 py-3 font-semibold">N° Cmd</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Client</th>
                    <th className="px-4 py-3 font-semibold text-right">Lignes</th>
                    <th className="px-4 py-3 font-semibold text-right">Total (CHF)</th>
                    <th className="px-4 py-3 font-semibold">Statut</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o: any) => {
                    const isExpanded = expandedIds.has(o.id);
                    const isSelected = selectedOrderIds.has(o.id);
                    const totalChf = orderTotalCHF(o);
                    const lns = o.admin_order_lines ?? [];
                    return (
                      <>
                        <tr
                          key={o.id}
                          className={`border-t border-border hover:bg-muted/30 ${isSelected ? "bg-[hsl(var(--optimis-green))]/5" : ""}`}
                        >
                          <td className="px-3 py-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelect(o.id)}
                              disabled={!!o.invoice_id}
                            />
                          </td>
                          <td className="px-3 py-4">
                            <button onClick={() => toggleExpand(o.id)} className="text-muted-foreground hover:text-foreground">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          </td>
                          <td className="px-4 py-4 font-mono text-xs">{o.order_number}</td>
                          <td className="px-4 py-4 text-muted-foreground">{formatDate(o.order_date)}</td>
                          <td className="px-4 py-4 font-medium">{o.admin_clients?.company_name}</td>
                          <td className="px-4 py-4 text-right">{lns.length}</td>
                          <td className="px-4 py-4 text-right font-semibold">{formatCHF(totalChf)}</td>
                          <td className="px-4 py-4">
                            {o.invoice_id ? (
                              <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Facturée</Badge>
                            ) : (
                              <Badge variant="outline">À facturer</Badge>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInvoiceSingle(o)}
                                disabled={!!o.invoice_id}
                                title="Créer une facture pour cette commande"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Facturer
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`Supprimer la commande ${o.order_number} ?`)) deleteMutation.mutate(o.id);
                                }}
                                disabled={deleteMutation.isPending}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-muted/20">
                            <td colSpan={9} className="px-12 py-3">
                              <table className="w-full text-xs">
                                <thead className="text-muted-foreground">
                                  <tr>
                                    <th className="text-left py-1">Sous-domaine</th>
                                    <th className="text-right py-1">Qté</th>
                                    <th className="text-right py-1">Prix unit.</th>
                                    <th className="text-right py-1">Total ligne</th>
                                    <th className="text-left py-1 pl-4">Commentaire</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {lns.sort((a: any, b: any) => a.position - b.position).map((l: any) => {
                                    const cur: Currency = (l.currency as Currency) ?? "CHF";
                                    const fx = Number(l.fx_rate_to_chf) || 1;
                                    const lt = Number(l.line_total ?? l.quantity * l.unit_price);
                                    return (
                                      <tr key={l.id}>
                                        <td className="py-1">{DOMAIN_LABELS_FULL[l.domain] ?? l.domain}</td>
                                        <td className="py-1 text-right">{l.quantity}</td>
                                        <td className="py-1 text-right">{formatMoney(Number(l.unit_price), cur)}</td>
                                        <td className="py-1 text-right font-medium">
                                          {formatMoney(lt, cur)}
                                          {cur === "CAD" && (
                                            <span className="text-muted-foreground ml-1">
                                              (≈ {formatCHF(toCHF(lt, cur, fx))})
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-1 pl-4 text-muted-foreground">{l.comment}</td>
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
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">Aucune commande</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal nouvelle commande */}
      <Dialog open={openModal} onOpenChange={(o) => { setOpenModal(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--optimis-green))]">Nouvelle commande</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-border">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3 py-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-[hsl(var(--optimis-green))]">
                Lignes de commande
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setLines((ls) => [...ls, newLine()])}>
                <Plus className="h-4 w-4" /> Ajouter une ligne
              </Button>
            </div>

            {lines.map((line, idx) => {
              const cat = PRODUCT_CATEGORIES.find((c) => c.key === line.category);
              const lineTotal = line.quantity * line.unit_price;
              const lineCHF = toCHF(lineTotal, line.currency, line.fx_rate_to_chf);
              return (
                <div key={line.id} className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Ligne {idx + 1}</span>
                    {lines.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(line.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Catégorie</Label>
                      <Select value={line.category} onValueChange={(v) => updateLine(line.id, { category: v, domain: "" })}>
                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sous-domaine *</Label>
                      <Select value={line.domain} onValueChange={(v) => updateLine(line.id, { domain: v as OrderDomain })}>
                        <SelectTrigger className="bg-white"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                        <SelectContent>
                          {cat?.subDomains.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Devise</Label>
                      <Select
                        value={line.currency}
                        onValueChange={(v) => updateLine(line.id, { currency: v as Currency, fx_rate_to_chf: v === "CHF" ? 1 : line.fx_rate_to_chf })}
                      >
                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CHF">🇨🇭 CHF</SelectItem>
                          <SelectItem value="CAD">🇨🇦 CAD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantité</Label>
                      <Input type="number" min={1} value={line.quantity}
                        onChange={(e) => updateLine(line.id, { quantity: parseInt(e.target.value) || 0 })} className="bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Prix unit.</Label>
                      <Input type="number" step="0.01" min={0} value={line.unit_price}
                        onChange={(e) => updateLine(line.id, { unit_price: parseFloat(e.target.value) || 0 })} className="bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Total {line.currency}</Label>
                      <div className="h-10 px-3 flex items-center justify-end rounded-md border border-border bg-white font-semibold text-[hsl(var(--optimis-green))]">
                        {formatMoney(lineTotal, line.currency)}
                      </div>
                    </div>
                  </div>

                  {line.currency === "CAD" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Taux CAD → CHF (figé)</Label>
                        <Input type="number" step="0.0001" min={0} value={line.fx_rate_to_chf}
                          onChange={(e) => updateLine(line.id, { fx_rate_to_chf: parseFloat(e.target.value) || 0 })} className="bg-white" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">≈ Total CHF</Label>
                        <div className="h-10 px-3 flex items-center justify-end rounded-md border border-border bg-muted/40 text-muted-foreground">
                          {formatCHF(lineCHF)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs">Commentaire</Label>
                    <Textarea rows={1} value={line.comment}
                      onChange={(e) => updateLine(line.id, { comment: e.target.value })}
                      className="bg-white resize-none" placeholder="Optionnel" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[hsl(var(--optimis-green))]/5 border border-[hsl(var(--optimis-green))]/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">Total commande (équiv. CHF)</p>
              <p className="text-xs text-muted-foreground">{lines.length} ligne{lines.length > 1 ? "s" : ""}</p>
            </div>
            <p className="text-3xl font-bold text-[hsl(var(--optimis-green))]">{formatCHF(grandTotalCHF)}</p>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setOpenModal(false); resetForm(); }}>Annuler</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !canSubmit}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer la commande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InvoiceFormModal
        open={invoiceModalOpen}
        onOpenChange={(o) => {
          setInvoiceModalOpen(o);
          if (!o) {
            setInvoicePrefill(undefined);
            setSelectedOrderIds(new Set());
          }
        }}
        prefillFromOrder={invoicePrefill}
      />
    </AdminLayout>
  );
}
