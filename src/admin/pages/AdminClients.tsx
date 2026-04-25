import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCHF, formatDate, STATUS_LABELS } from "@/admin/lib/format";

interface ClientForm {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  status: "actif" | "inactif";
}

const emptyForm: ClientForm = {
  company_name: "", contact_name: "", email: "", phone: "", address: "", notes: "", status: "actif",
};

export default function AdminClients() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState<ClientForm>(emptyForm);

  const { data: clients, isLoading } = useQuery({
    queryKey: ["admin-clients", search],
    queryFn: async () => {
      let q = supabase.from("admin_clients").select("*").order("created_at", { ascending: false });
      if (search) q = q.or(`company_name.ilike.%${search}%,contact_name.ilike.%${search}%,email.ilike.%${search}%`);
      const { data } = await q;
      return data ?? [];
    },
  });

  const { data: detail } = useQuery({
    queryKey: ["admin-client-detail", selected?.id],
    enabled: !!selected,
    queryFn: async () => {
      const [orders, invoices] = await Promise.all([
        supabase.from("admin_orders").select("*").eq("client_id", selected.id).order("order_date", { ascending: false }),
        supabase.from("admin_invoices").select("*").eq("client_id", selected.id).order("invoice_date", { ascending: false }),
      ]);
      const totalBilled = (invoices.data ?? []).reduce((s, i: any) => s + Number(i.total), 0);
      return { orders: orders.data ?? [], invoices: invoices.data ?? [], totalBilled };
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ClientForm & { id?: string }) => {
      if (data.id) {
        const { id, ...rest } = data;
        const { error } = await supabase.from("admin_clients").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("admin_clients").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-clients"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setOpenModal(false);
      setForm(emptyForm);
      toast({ title: "Client enregistré" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-clients"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setOpenModal(false);
      setSelected(null);
      toast({ title: "Client supprimé" });
    },
    onError: (e: any) =>
      toast({
        title: "Erreur de suppression",
        description: e.message?.includes("foreign")
          ? "Ce client a des commandes ou factures liées. Supprimez-les d'abord."
          : e.message,
        variant: "destructive",
      }),
  });

  const handleDelete = (c: any) => {
    if (confirm(`Supprimer définitivement le client "${c.company_name}" ?`)) {
      deleteMutation.mutate(c.id);
    }
  };

  const openCreate = () => { setForm(emptyForm); setSelected(null); setOpenModal(true); };
  const openEdit = (c: any) => {
    setForm({
      company_name: c.company_name, contact_name: c.contact_name ?? "", email: c.email ?? "",
      phone: c.phone ?? "", address: c.address ?? "", notes: c.notes ?? "", status: c.status,
    });
    setSelected(c); setOpenModal(true);
  };

  return (
    <AdminLayout
      title="Clients"
      subtitle={`${clients?.length ?? 0} client${(clients?.length ?? 0) > 1 ? "s" : ""}`}
      actions={<Button onClick={openCreate} size="sm"><Plus className="h-4 w-4" /> Nouveau client</Button>}
    >
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                    <th className="px-6 py-3 font-semibold">Société</th>
                    <th className="px-6 py-3 font-semibold">Contact</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">Téléphone</th>
                    <th className="px-6 py-3 font-semibold">Statut</th>
                    <th className="px-6 py-3 font-semibold">Créé le</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients?.map((c: any) => (
                    <tr key={c.id} onClick={() => openEdit(c)} className="border-t border-border hover:bg-muted/30 cursor-pointer">
                      <td className="px-6 py-4 font-medium">{c.company_name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.contact_name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.email}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.phone}</td>
                      <td className="px-6 py-4"><Badge variant={c.status === "actif" ? "default" : "outline"}>{STATUS_LABELS[c.status]}</Badge></td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(c.created_at)}</td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(c)}
                          disabled={deleteMutation.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {clients?.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Aucun client</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--optimis-green))]">
              {selected ? selected.company_name : "Nouveau client"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2 space-y-2">
              <Label>Nom de la société *</Label>
              <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Contact</Label>
              <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Adresse</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Notes internes</Label>
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>

          {selected && detail && (
            <div className="border-t border-border pt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-xs uppercase text-muted-foreground">Commandes</p>
                  <p className="text-xl font-bold text-[hsl(var(--optimis-green))]">{detail.orders.length}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-xs uppercase text-muted-foreground">Factures</p>
                  <p className="text-xl font-bold text-[hsl(var(--optimis-green))]">{detail.invoices.length}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-xs uppercase text-muted-foreground">Total facturé</p>
                  <p className="text-xl font-bold text-[hsl(var(--optimis-green))]">{formatCHF(detail.totalBilled)}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(false)}>Annuler</Button>
            <Button onClick={() => saveMutation.mutate({ ...form, id: selected?.id })} disabled={saveMutation.isPending || !form.company_name}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
