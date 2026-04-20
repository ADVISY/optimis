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
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCHF, formatDate, DOMAIN_LABELS } from "@/admin/lib/format";

const DOMAINS = ["assurance_maladie", "lpp", "hypotheque", "telecom", "energie", "autre"] as const;

export default function AdminOrders() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all"); // "YYYY-MM"

  const [form, setForm] = useState({
    client_id: "", order_date: new Date().toISOString().slice(0, 10),
    domain: "assurance_maladie", quantity: 1, unit_price: 0, comment: "",
  });

  const { data: clients } = useQuery({
    queryKey: ["admin-orders-clients"],
    queryFn: async () => (await supabase.from("admin_clients").select("id, company_name").order("company_name")).data ?? [],
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

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("admin_orders").insert({
        client_id: form.client_id,
        order_date: form.order_date,
        domain: form.domain as any,
        quantity: form.quantity,
        unit_price: form.unit_price,
        comment: form.comment || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setOpenModal(false);
      setForm({ ...form, quantity: 1, unit_price: 0, comment: "" });
      toast({ title: "Commande enregistrée" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  return (
    <AdminLayout
      title="Commandes"
      subtitle={`${filtered.length} commande${filtered.length > 1 ? "s" : ""} · ${formatCHF(totalFiltered)}`}
      actions={<Button onClick={() => setOpenModal(true)} size="sm"><Plus className="h-4 w-4" /> Nouvelle commande</Button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select value={filterClient} onValueChange={setFilterClient}>
          <SelectTrigger><SelectValue placeholder="Client" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les clients</SelectItem>
            {clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDomain} onValueChange={setFilterDomain}>
          <SelectTrigger><SelectValue placeholder="Domaine" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les domaines</SelectItem>
            {DOMAINS.map((d) => <SelectItem key={d} value={d}>{DOMAIN_LABELS[d]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger><SelectValue placeholder="Mois" /></SelectTrigger>
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
                    <th className="px-6 py-3 font-semibold">Domaine</th>
                    <th className="px-6 py-3 font-semibold text-right">Quantité</th>
                    <th className="px-6 py-3 font-semibold text-right">Prix unitaire</th>
                    <th className="px-6 py-3 font-semibold text-right">Total</th>
                    <th className="px-6 py-3 font-semibold">Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o: any) => (
                    <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(o.order_date)}</td>
                      <td className="px-6 py-4 font-medium">{o.admin_clients?.company_name}</td>
                      <td className="px-6 py-4">{DOMAIN_LABELS[o.domain]}</td>
                      <td className="px-6 py-4 text-right">{o.quantity}</td>
                      <td className="px-6 py-4 text-right text-muted-foreground">{formatCHF(Number(o.unit_price))}</td>
                      <td className="px-6 py-4 text-right font-semibold">{formatCHF(Number(o.total))}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{o.comment}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Aucune commande</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--optimis-green))]">Nouvelle commande</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2 space-y-2">
              <Label>Client *</Label>
              <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={form.order_date} onChange={(e) => setForm({ ...form, order_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Domaine *</Label>
              <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => <SelectItem key={d} value={d}>{DOMAIN_LABELS[d]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantité *</Label>
              <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>Prix unitaire (CHF) *</Label>
              <Input type="number" step="0.01" min={0} value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Commentaire</Label>
              <Textarea rows={2} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            </div>
            <div className="md:col-span-2 bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-xs uppercase text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-[hsl(var(--optimis-green))]">{formatCHF(form.quantity * form.unit_price)}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(false)}>Annuler</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !form.client_id || form.quantity < 1 || form.unit_price < 0}
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
