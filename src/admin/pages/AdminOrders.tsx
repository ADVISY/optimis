import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCHF, formatDate } from "@/admin/lib/format";
import { InvoiceFormModal } from "@/admin/components/InvoiceFormModal";
import {
  PRODUCT_CATEGORIES,
  DOMAIN_LABELS_FULL,
  getCategoryForDomain,
  getCategoryLabel,
  OrderDomain,
} from "@/admin/lib/productCategories";

interface OrderLine {
  id: string;
  category: string;
  domain: OrderDomain | "";
  quantity: number;
  unit_price: number;
  comment: string;
}

const newLine = (): OrderLine => ({
  id: crypto.randomUUID(),
  category: "assurance_finances",
  domain: "",
  quantity: 1,
  unit_price: 0,
  comment: "",
});

export default function AdminOrders() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");

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

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_orders")
        .select("*, admin_clients(id, company_name)")
        .order("order_date", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    return (orders ?? []).filter((o: any) => {
      if (filterClient !== "all" && o.client_id !== filterClient) return false;
      if (filterDomain !== "all" && o.domain !== filterDomain) return false;
      if (filterMonth !== "all" && !o.order_date.startsWith(filterMonth)) return false;
      return true;
    });
  }, [orders, filterClient, filterDomain, filterMonth]);

  const totalFiltered = filtered.reduce((s: number, o: any) => s + Number(o.total), 0);

  const months = useMemo(() => {
    const set = new Set<string>();
    (orders ?? []).forEach((o: any) => set.add(o.order_date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [orders]);

  const updateLine = (id: string, patch: Partial<OrderLine>) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const removeLine = (id: string) =>
    setLines((ls) => (ls.length === 1 ? ls : ls.filter((l) => l.id !== id)));

  const grandTotal = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);

  const canSubmit =
    !!clientId &&
    lines.length > 0 &&
    lines.every((l) => l.domain && l.quantity > 0 && l.unit_price >= 0);

  const createMutation = useMutation({
    mutationFn: async () => {
      // Insère une ligne par sous-domaine pour conserver la structure existante
      const rows = lines.map((l) => ({
        client_id: clientId,
        order_date: orderDate,
        domain: l.domain as any,
        quantity: l.quantity,
        unit_price: l.unit_price,
        comment: l.comment || null,
      }));
      const { error } = await supabase.from("admin_orders").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setOpenModal(false);
      resetForm();
      toast({ title: "Commande enregistrée", description: `${lines.length} ligne(s) ajoutée(s)` });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  // Liste des sous-domaines pour le filtre (toutes catégories)
  const allSubDomains = useMemo(
    () => PRODUCT_CATEGORIES.flatMap((c) => c.subDomains),
    []
  );

  return (
    <AdminLayout
      title="Commandes"
      subtitle={`${filtered.length} commande${filtered.length > 1 ? "s" : ""} · ${formatCHF(totalFiltered)}`}
      actions={
        <Button onClick={() => setOpenModal(true)} size="sm">
          <Plus className="h-4 w-4" /> Nouvelle commande
        </Button>
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
        <Select value={filterDomain} onValueChange={setFilterDomain}>
          <SelectTrigger className="bg-white"><SelectValue placeholder="Sous-domaine" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les sous-domaines</SelectItem>
            {allSubDomains.map((d) => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
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
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Client</th>
                    <th className="px-6 py-3 font-semibold">Catégorie</th>
                    <th className="px-6 py-3 font-semibold">Sous-domaine</th>
                    <th className="px-6 py-3 font-semibold text-right">Qté</th>
                    <th className="px-6 py-3 font-semibold text-right">Prix unit.</th>
                    <th className="px-6 py-3 font-semibold text-right">Total</th>
                    <th className="px-6 py-3 font-semibold">Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o: any) => (
                    <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(o.order_date)}</td>
                      <td className="px-6 py-4 font-medium">{o.admin_clients?.company_name}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{getCategoryLabel(getCategoryForDomain(o.domain))}</td>
                      <td className="px-6 py-4">{DOMAIN_LABELS_FULL[o.domain] ?? o.domain}</td>
                      <td className="px-6 py-4 text-right">{o.quantity}</td>
                      <td className="px-6 py-4 text-right text-muted-foreground">{formatCHF(Number(o.unit_price))}</td>
                      <td className="px-6 py-4 text-right font-semibold">{formatCHF(Number(o.total))}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{o.comment}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">Aucune commande</td></tr>
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

          {/* Entête */}
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

          {/* Lignes (panier) */}
          <div className="space-y-3 py-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-[hsl(var(--optimis-green))]">
                Lignes de commande
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
                        onValueChange={(v) => updateLine(line.id, { category: v, domain: "" })}
                      >
                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CATEGORIES.map((c) => (
                            <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sous-domaine *</Label>
                      <Select
                        value={line.domain}
                        onValueChange={(v) => updateLine(line.id, { domain: v as OrderDomain })}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {cat?.subDomains.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantité</Label>
                      <Input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, { quantity: parseInt(e.target.value) || 0 })}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Prix unitaire (CHF)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={line.unit_price}
                        onChange={(e) => updateLine(line.id, { unit_price: parseFloat(e.target.value) || 0 })}
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

                  <div className="space-y-1.5">
                    <Label className="text-xs">Commentaire</Label>
                    <Textarea
                      rows={1}
                      value={line.comment}
                      onChange={(e) => updateLine(line.id, { comment: e.target.value })}
                      className="bg-white resize-none"
                      placeholder="Optionnel"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total global */}
          <div className="bg-[hsl(var(--optimis-green))]/5 border border-[hsl(var(--optimis-green))]/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">Total commande</p>
              <p className="text-xs text-muted-foreground">
                {lines.length} ligne{lines.length > 1 ? "s" : ""}
              </p>
            </div>
            <p className="text-3xl font-bold text-[hsl(var(--optimis-green))]">{formatCHF(grandTotal)}</p>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setOpenModal(false); resetForm(); }}>
              Annuler
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !canSubmit}
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer la commande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
