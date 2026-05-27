import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Inbox, RotateCcw, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUT_CONFIG: Record<string, { label: string; icon: any; color: string; badge: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:  { label: "En attente",  icon: Clock,         color: "text-amber-600", badge: "outline" },
  envoye:   { label: "Envoyé",      icon: CheckCircle2,  color: "text-green-600", badge: "secondary" },
  echec:    { label: "Échec",       icon: XCircle,       color: "text-red-600",   badge: "destructive" },
  retry:    { label: "Retry",       icon: RotateCcw,     color: "text-blue-600",  badge: "outline" },
};

const CANAL_LABELS: Record<string, string> = {
  google_sheets: "📊 Google Sheets",
  lyta_api: "📤 LYTA API",
  crm_externe: "🌐 CRM externe",
  optimis_dashboard: "📥 Espace courtier",
  email: "📧 Email",
};

export default function AdminDistributions() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterCanal, setFilterCanal] = useState<string>("all");
  const [detailDist, setDetailDist] = useState<any | null>(null);

  // ----------------------------------------------------------------------------
  // Fetch
  // ----------------------------------------------------------------------------
  const { data: distributions, isLoading } = useQuery({
    queryKey: ["admin-distributions", filterStatut, filterClient, filterCanal],
    queryFn: async () => {
      let q = supabase
        .from("distributions")
        .select(`
          *,
          leads(id, prenom, nom, email, telephone, produit, source_formulaire, canton),
          admin_clients(id, company_name, contact_name),
          admin_orders(id, order_number),
          canaux_livraison(type)
        `)
        .order("cree_le", { ascending: false })
        .limit(300);

      if (filterStatut !== "all") q = q.eq("statut", filterStatut);
      if (filterClient !== "all") q = q.eq("client_id", filterClient);
      if (filterCanal !== "all") q = q.eq("canal_id", filterCanal);

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["distributions-clients"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_clients").select("id, company_name").order("company_name");
      return data ?? [];
    },
  });

  const { data: canaux } = useQuery({
    queryKey: ["distributions-canaux"],
    queryFn: async () => {
      const { data } = await supabase.from("canaux_livraison").select("id, type, admin_clients(company_name)");
      return data ?? [];
    },
  });

  // Compteurs par statut
  const { data: counts } = useQuery({
    queryKey: ["distributions-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("distributions").select("statut");
      const result = { pending: 0, envoye: 0, echec: 0, retry: 0, all: 0 };
      (data ?? []).forEach((row: any) => {
        result.all++;
        if (row.statut in result) (result as any)[row.statut]++;
      });
      return result;
    },
    refetchInterval: 30000,
  });

  // ----------------------------------------------------------------------------
  // Mutation : réessayer une distribution en échec
  // ----------------------------------------------------------------------------
  const retryMutation = useMutation({
    mutationFn: async (distributionId: string) => {
      const { error } = await supabase.functions.invoke("deliver-distribution", {
        body: { distribution_id: distributionId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-distributions"] });
      qc.invalidateQueries({ queryKey: ["distributions-counts"] });
      toast({ title: "Livraison relancée" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  return (
    <AdminLayout title="Distributions" subtitle="Historique des envois de leads aux courtiers">
      <div className="space-y-6">
        {/* Compteurs */}
        <div className="grid grid-cols-5 gap-3">
          <CountCard label="Total" count={counts?.all ?? 0} active={filterStatut === "all"} onClick={() => setFilterStatut("all")} color="bg-slate-500" />
          <CountCard label="En attente" count={counts?.pending ?? 0} active={filterStatut === "pending"} onClick={() => setFilterStatut("pending")} color="bg-amber-500" />
          <CountCard label="Envoyés" count={counts?.envoye ?? 0} active={filterStatut === "envoye"} onClick={() => setFilterStatut("envoye")} color="bg-green-500" />
          <CountCard label="Échecs" count={counts?.echec ?? 0} active={filterStatut === "echec"} onClick={() => setFilterStatut("echec")} color="bg-red-500" />
          <CountCard label="Retry" count={counts?.retry ?? 0} active={filterStatut === "retry"} onClick={() => setFilterStatut("retry")} color="bg-blue-500" />
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-6 flex flex-wrap gap-3">
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Filtrer par courtier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les courtiers</SelectItem>
                {(clients ?? []).map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCanal} onValueChange={setFilterCanal}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Filtrer par canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les canaux</SelectItem>
                {(canaux ?? []).map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {CANAL_LABELS[c.type] ?? c.type} — {c.admin_clients?.company_name ?? "?"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : (distributions?.length ?? 0) === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Inbox className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Aucune distribution pour ce filtre</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Date</th>
                      <th className="text-left px-4 py-3 font-semibold">Lead</th>
                      <th className="text-left px-4 py-3 font-semibold">Type</th>
                      <th className="text-left px-4 py-3 font-semibold">Courtier</th>
                      <th className="text-left px-4 py-3 font-semibold">Commande</th>
                      <th className="text-left px-4 py-3 font-semibold">Canal</th>
                      <th className="text-left px-4 py-3 font-semibold">Statut</th>
                      <th className="text-right px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributions!.map((d: any) => {
                      const statutCfg = STATUT_CONFIG[d.statut] ?? STATUT_CONFIG.pending;
                      const StatutIcon = statutCfg.icon;
                      return (
                        <tr key={d.id} className="border-b hover:bg-muted/30">
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(d.cree_le).toLocaleString("fr-CH", {
                              day: "2-digit", month: "2-digit", year: "2-digit",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">
                              {d.leads?.prenom ?? ""} {d.leads?.nom ?? ""}
                            </div>
                            <div className="text-xs text-muted-foreground">{d.leads?.email ?? "—"}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px]">{d.leads?.source_formulaire ?? "—"}</Badge>
                          </td>
                          <td className="px-4 py-3 font-medium">{d.admin_clients?.company_name ?? "—"}</td>
                          <td className="px-4 py-3 font-mono text-xs">{d.admin_orders?.order_number ?? "—"}</td>
                          <td className="px-4 py-3 text-xs">{CANAL_LABELS[d.canaux_livraison?.type] ?? d.canaux_livraison?.type ?? "—"}</td>
                          <td className="px-4 py-3">
                            <div className={`inline-flex items-center gap-1.5 ${statutCfg.color}`}>
                              <StatutIcon className="h-3.5 w-3.5" />
                              <Badge variant={statutCfg.badge} className="text-[10px]">{statutCfg.label}</Badge>
                            </div>
                            {d.statut === "echec" && d.error_message && (
                              <div className="text-[10px] text-red-600 mt-1 max-w-xs truncate" title={d.error_message}>
                                {d.error_message}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setDetailDist(d)} title="Voir détails">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              {(d.statut === "echec" || d.statut === "pending" || d.statut === "retry") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => retryMutation.mutate(d.id)}
                                  disabled={retryMutation.isPending}
                                  title="Réessayer la livraison"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                              )}
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

        {/* Modal détail */}
        <Dialog open={!!detailDist} onOpenChange={(o) => { if (!o) setDetailDist(null); }}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détail de la distribution</DialogTitle>
            </DialogHeader>
            {detailDist && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Distribution ID" value={detailDist.id} mono />
                  <Field label="Statut" value={STATUT_CONFIG[detailDist.statut]?.label ?? detailDist.statut} />
                  <Field label="Lead" value={`${detailDist.leads?.prenom ?? ""} ${detailDist.leads?.nom ?? ""}`} />
                  <Field label="Email lead" value={detailDist.leads?.email} />
                  <Field label="Téléphone lead" value={detailDist.leads?.telephone} />
                  <Field label="Canton" value={detailDist.leads?.canton} />
                  <Field label="Courtier" value={detailDist.admin_clients?.company_name} />
                  <Field label="Commande" value={detailDist.admin_orders?.order_number} mono />
                  <Field label="Canal" value={CANAL_LABELS[detailDist.canaux_livraison?.type] ?? "—"} />
                  <Field label="Tentatives" value={String(detailDist.retry_count ?? 0)} />
                  <Field label="Créée" value={new Date(detailDist.cree_le).toLocaleString("fr-CH")} />
                  <Field label="Envoyée" value={detailDist.envoye_le ? new Date(detailDist.envoye_le).toLocaleString("fr-CH") : "—"} />
                </div>
                {detailDist.error_message && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-xs font-medium text-red-700 mb-1">Message d'erreur</div>
                    <pre className="text-xs font-mono whitespace-pre-wrap text-red-900">{detailDist.error_message}</pre>
                  </div>
                )}
                {detailDist.payload_envoye && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Payload envoyé</div>
                    <pre className="text-[10px] bg-muted p-3 rounded-lg overflow-x-auto font-mono">
                      {JSON.stringify(detailDist.payload_envoye, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function CountCard({ label, count, active, onClick, color }: { label: string; count: number; active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl border bg-card p-4 transition-all ${active ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm"}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase text-muted-foreground tracking-wider">{label}</div>
          <div className="text-2xl font-bold mt-1">{count}</div>
        </div>
        <span className={`h-2 w-2 rounded-full ${color} mt-2`} />
      </div>
    </button>
  );
}

function Field({ label, value, mono = false }: { label: string; value?: any; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-medium break-all ${mono ? "font-mono text-xs" : ""}`}>{value ?? "—"}</div>
    </div>
  );
}
