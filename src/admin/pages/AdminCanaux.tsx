import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Trash2, Send, FileSpreadsheet, Globe, Inbox, Mail, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CanalType = "google_sheets" | "lyta_api" | "crm_externe" | "optimis_dashboard" | "email";

const CANAL_TYPES: { value: CanalType; label: string; icon: any; description: string; color: string }[] = [
  { value: "google_sheets", label: "Google Sheets", icon: FileSpreadsheet, description: "Append une ligne dans la Sheet du courtier", color: "text-green-700" },
  { value: "lyta_api", label: "LYTA API", icon: Send, description: "Push direct dans l'instance LYTA du tenant", color: "text-blue-700" },
  { value: "crm_externe", label: "CRM externe (webhook)", icon: Globe, description: "POST JSON vers l'URL fournie par le courtier (Hubspot, Pipedrive, etc.)", color: "text-purple-700" },
  { value: "optimis_dashboard", label: "Espace courtier Optimis", icon: Inbox, description: "Le courtier se logue à son espace Optimis pour voir ses leads", color: "text-amber-700" },
  { value: "email", label: "Email", icon: Mail, description: "Envoi d'un email contenant les infos du lead", color: "text-slate-700" },
];

interface CanalForm {
  client_id: string;
  type: CanalType;
  config: Record<string, string>;
  actif: boolean;
}

const emptyForm: CanalForm = {
  client_id: "",
  type: "google_sheets",
  config: {},
  actif: true,
};

export default function AdminCanaux() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CanalForm>(emptyForm);

  // ----------------------------------------------------------------------------
  // Fetch
  // ----------------------------------------------------------------------------
  const { data: canaux, isLoading } = useQuery({
    queryKey: ["admin-canaux"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("canaux_livraison")
        .select("*, admin_clients(company_name, contact_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["admin-clients-for-canaux"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_clients").select("id, company_name").eq("status", "actif").order("company_name");
      return data ?? [];
    },
  });

  // ----------------------------------------------------------------------------
  // Mutations
  // ----------------------------------------------------------------------------
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        client_id: form.client_id,
        type: form.type,
        config: form.config,
        actif: form.actif,
      };
      if (editingId) {
        const { error } = await supabase.from("canaux_livraison").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("canaux_livraison").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-canaux"] });
      setOpenModal(false);
      setForm(emptyForm);
      setEditingId(null);
      toast({ title: editingId ? "Canal modifié" : "Canal créé" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("canaux_livraison").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-canaux"] });
      toast({ title: "Canal supprimé" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const toggleActifMutation = useMutation({
    mutationFn: async ({ id, actif }: { id: string; actif: boolean }) => {
      const { error } = await supabase.from("canaux_livraison").update({ actif }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-canaux"] }),
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  // ----------------------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------------------
  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpenModal(true);
  };

  const openEdit = (c: any) => {
    setForm({
      client_id: c.client_id,
      type: c.type,
      config: c.config ?? {},
      actif: c.actif,
    });
    setEditingId(c.id);
    setOpenModal(true);
  };

  const handleDelete = (c: any) => {
    if (confirm(`Supprimer le canal ${c.type} de "${c.admin_clients?.company_name}" ?`)) {
      deleteMutation.mutate(c.id);
    }
  };

  // ----------------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------------
  const selectedTypeCfg = CANAL_TYPES.find((t) => t.value === form.type);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Canaux de livraison</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure comment chaque courtier reçoit ses leads (Google Sheets, LYTA API, webhook CRM, etc.)
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Nouveau canal
          </Button>
        </div>

        {/* Tableau */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : (canaux?.length ?? 0) === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Send className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium mb-1">Aucun canal de livraison configuré</p>
                <p className="text-sm">
                  Sans canal actif, les leads distribués ne seront pas envoyés au courtier.
                  <br />
                  Crée un canal pour chacun de tes 10 clients partenaires.
                </p>
                <Button onClick={openCreate} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Créer le premier canal
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Courtier</th>
                      <th className="text-left px-4 py-3 font-semibold">Type de canal</th>
                      <th className="text-left px-4 py-3 font-semibold">Configuration</th>
                      <th className="text-center px-4 py-3 font-semibold w-24">Actif</th>
                      <th className="text-right px-4 py-3 font-semibold w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {canaux!.map((c: any) => {
                      const typeCfg = CANAL_TYPES.find((t) => t.value === c.type);
                      const Icon = typeCfg?.icon ?? Send;
                      return (
                        <tr key={c.id} className="border-b hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div className="font-medium">{c.admin_clients?.company_name ?? "—"}</div>
                            <div className="text-xs text-muted-foreground">{c.admin_clients?.contact_name ?? ""}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className={`inline-flex items-center gap-2 ${typeCfg?.color ?? ""}`}>
                              <Icon className="h-4 w-4" />
                              <span className="font-medium">{typeCfg?.label ?? c.type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-muted-foreground max-w-md truncate">
                            {Object.entries(c.config ?? {})
                              .map(([k, v]) => `${k}: ${String(v).slice(0, 40)}${String(v).length > 40 ? "…" : ""}`)
                              .join(" · ") || <span className="italic">aucune config</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch
                              checked={c.actif}
                              onCheckedChange={(checked) => toggleActifMutation.mutate({ id: c.id, actif: checked })}
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(c)}
                                disabled={deleteMutation.isPending}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal création / édition */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Modifier le canal" : "Nouveau canal de livraison"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Sélection client */}
              <div className="space-y-2">
                <Label>Courtier *</Label>
                <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisis un courtier…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(clients ?? []).map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sélection type */}
              <div className="space-y-2">
                <Label>Type de livraison *</Label>
                <div className="grid grid-cols-1 gap-2">
                  {CANAL_TYPES.map((t) => {
                    const Icon = t.icon;
                    const active = form.type === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm({ ...form, type: t.value, config: {} })}
                        className={`text-left flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                          active ? "border-[hsl(var(--optimis-green))] bg-[hsl(var(--optimis-green))]/5" : "border-border hover:border-slate-400"
                        }`}
                      >
                        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${t.color}`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{t.label}</div>
                          <div className="text-xs text-muted-foreground">{t.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Config dynamique selon le type */}
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Configuration {selectedTypeCfg?.label}
                </Label>
                {form.type === "google_sheets" && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">ID de la Google Sheet *</Label>
                      <Input
                        placeholder="ex: 1abc...xyz (extrait de l'URL de la Sheet)"
                        value={form.config.sheet_id ?? ""}
                        onChange={(e) => setForm({ ...form, config: { ...form.config, sheet_id: e.target.value } })}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Dans l'URL Sheets : /spreadsheets/d/<strong>ID</strong>/edit
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Nom de l'onglet *</Label>
                      <Input
                        placeholder="ex: Leads Santé"
                        value={form.config.tab ?? ""}
                        onChange={(e) => setForm({ ...form, config: { ...form.config, tab: e.target.value } })}
                      />
                    </div>
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                      ⚠️ La Sheet doit être <strong>partagée en édition</strong> avec l'email du compte de service Google
                      (à configurer dans les Edge Functions Optimis — secret <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code>).
                    </div>
                  </>
                )}

                {form.type === "lyta_api" && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">Endpoint LYTA *</Label>
                      <Input
                        placeholder="https://lyta.app/api/leads/external"
                        value={form.config.endpoint ?? ""}
                        onChange={(e) => setForm({ ...form, config: { ...form.config, endpoint: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tenant ID LYTA *</Label>
                      <Input
                        placeholder="uuid du cabinet locataire"
                        value={form.config.tenant_id ?? ""}
                        onChange={(e) => setForm({ ...form, config: { ...form.config, tenant_id: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Token API *</Label>
                      <Input
                        type="password"
                        placeholder="Bearer token fourni par LYTA"
                        value={form.config.token ?? ""}
                        onChange={(e) => setForm({ ...form, config: { ...form.config, token: e.target.value } })}
                      />
                    </div>
                  </>
                )}

                {form.type === "crm_externe" && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">URL du webhook *</Label>
                      <Input
                        placeholder="https://hooks.pipedrive.com/abc123 ou autre"
                        value={form.config.endpoint ?? ""}
                        onChange={(e) => setForm({ ...form, config: { ...form.config, endpoint: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">En-tête d'authentification (optionnel)</Label>
                      <Input
                        placeholder="ex: Bearer xxxxx"
                        value={form.config.auth_header ?? ""}
                        onChange={(e) => setForm({ ...form, config: { ...form.config, auth_header: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Mapping des champs (JSON, optionnel)</Label>
                      <Textarea
                        placeholder='{"lead.prenom": "person.first_name", "lead.email": "person.email"}'
                        value={form.config.mapping ?? ""}
                        onChange={(e) => setForm({ ...form, config: { ...form.config, mapping: e.target.value } })}
                        rows={4}
                        className="font-mono text-xs"
                      />
                    </div>
                  </>
                )}

                {form.type === "optimis_dashboard" && (
                  <div className="text-xs text-muted-foreground">
                    Aucune configuration requise. Le courtier verra ses leads dans son espace Optimis dédié
                    (création du compte partner à faire séparément).
                  </div>
                )}

                {form.type === "email" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Adresse email destinataire *</Label>
                    <Input
                      type="email"
                      placeholder="contact@cabinet.ch"
                      value={form.config.email_to ?? ""}
                      onChange={(e) => setForm({ ...form, config: { ...form.config, email_to: e.target.value } })}
                    />
                  </div>
                )}
              </div>

              {/* Switch actif */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Canal actif</Label>
                  <p className="text-xs text-muted-foreground">
                    Si désactivé, les leads ne seront pas envoyés via ce canal
                  </p>
                </div>
                <Switch checked={form.actif} onCheckedChange={(v) => setForm({ ...form, actif: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpenModal(false)}>Annuler</Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!form.client_id || saveMutation.isPending}
              >
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingId ? "Mettre à jour" : "Créer le canal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
