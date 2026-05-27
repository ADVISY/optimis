import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PartnerLayout } from "@/partner/components/PartnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Inbox, Eye, Phone, Mail, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUT_COMMERCIAL: Record<string, { label: string; color: string }> = {
  a_traiter: { label: "À traiter", color: "bg-blue-100 text-blue-800 border-blue-300" },
  contacte: { label: "Contacté", color: "bg-purple-100 text-purple-800 border-purple-300" },
  rdv_pris: { label: "RDV pris", color: "bg-cyan-100 text-cyan-800 border-cyan-300" },
  devis_envoye: { label: "Devis envoyé", color: "bg-amber-100 text-amber-800 border-amber-300" },
  signe: { label: "Signé ✓", color: "bg-green-100 text-green-800 border-green-300" },
  perdu: { label: "Perdu", color: "bg-red-100 text-red-800 border-red-300" },
  injoignable: { label: "Injoignable", color: "bg-slate-100 text-slate-800 border-slate-300" },
};

export default function PartnerLeads() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [detail, setDetail] = useState<any | null>(null);

  // Distributions vues par le partner courant (filtré par RLS)
  const { data: distributions, isLoading } = useQuery({
    queryKey: ["partner-distributions", filterStatut],
    queryFn: async () => {
      let q = supabase
        .from("distributions")
        .select(`
          id, statut, statut_commercial, notes_courtier, cree_le, envoye_le,
          statut_commercial_mis_a_jour_le,
          leads(id, prenom, nom, email, telephone, canton, produit, source_formulaire, donnees_produit, cree_le)
        `)
        .order("cree_le", { ascending: false })
        .limit(300);
      if (filterStatut !== "all") q = q.eq("statut_commercial", filterStatut);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatutMutation = useMutation({
    mutationFn: async ({ id, statut, notes }: { id: string; statut?: string; notes?: string }) => {
      const update: any = { statut_commercial_mis_a_jour_le: new Date().toISOString() };
      if (statut !== undefined) update.statut_commercial = statut;
      if (notes !== undefined) update.notes_courtier = notes;
      const { error } = await supabase.from("distributions").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partner-distributions"] });
      toast({ title: "Mis à jour" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  // Filtre client-side par recherche
  const filteredDistribs = (distributions ?? []).filter((d: any) => {
    if (!search) return true;
    const lead = d.leads;
    if (!lead) return false;
    const blob = `${lead.prenom} ${lead.nom} ${lead.email} ${lead.telephone}`.toLowerCase();
    return blob.includes(search.toLowerCase());
  });

  return (
    <PartnerLayout title="Mes leads" subtitle="Tous les leads reçus via Optimis">
      <div className="space-y-4">
        {/* Filtres */}
        <Card>
          <CardContent className="pt-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Recherche par nom, email, téléphone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(STATUT_COMMERCIAL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Liste */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : filteredDistribs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Inbox className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Aucun lead pour ce filtre</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredDistribs.map((d: any) => {
                  const lead = d.leads;
                  const statutCfg = STATUT_COMMERCIAL[d.statut_commercial] ?? STATUT_COMMERCIAL.a_traiter;
                  return (
                    <div key={d.id} className="p-4 hover:bg-slate-50 flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{lead?.prenom} {lead?.nom}</span>
                          <Badge variant="outline" className="text-[10px]">{lead?.source_formulaire ?? lead?.produit}</Badge>
                          <Badge className={`text-[10px] border ${statutCfg.color}`}>{statutCfg.label}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
                          {lead?.email && (
                            <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                              <Mail className="h-3 w-3" /> {lead.email}
                            </a>
                          )}
                          {lead?.telephone && (
                            <a href={`tel:${lead.telephone}`} className="inline-flex items-center gap-1 hover:text-foreground">
                              <Phone className="h-3 w-3" /> {lead.telephone}
                            </a>
                          )}
                          {lead?.canton && <span>· {lead.canton}</span>}
                          <span className="text-xs">· Reçu {new Date(d.cree_le).toLocaleDateString("fr-CH")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={d.statut_commercial ?? "a_traiter"}
                          onValueChange={(v) => updateStatutMutation.mutate({ id: d.id, statut: v })}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUT_COMMERCIAL).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="ghost" onClick={() => setDetail(d)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal détail + notes */}
        <Dialog open={!!detail} onOpenChange={(o) => { if (!o) setDetail(null); }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {detail?.leads?.prenom} {detail?.leads?.nom}
              </DialogTitle>
            </DialogHeader>
            {detail && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email" value={detail.leads?.email} />
                  <Field label="Téléphone" value={detail.leads?.telephone} />
                  <Field label="Canton" value={detail.leads?.canton} />
                  <Field label="Produit" value={detail.leads?.source_formulaire ?? detail.leads?.produit} />
                  <Field label="Lead reçu" value={new Date(detail.leads?.cree_le).toLocaleString("fr-CH")} />
                  <Field label="Distribué le" value={new Date(detail.cree_le).toLocaleString("fr-CH")} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Notes (privées à votre cabinet)</label>
                  <Textarea
                    placeholder="Notes sur ce lead, retours d'appel, suivi…"
                    defaultValue={detail.notes_courtier ?? ""}
                    onBlur={(e) => {
                      if (e.target.value !== (detail.notes_courtier ?? "")) {
                        updateStatutMutation.mutate({ id: detail.id, notes: e.target.value });
                      }
                    }}
                    rows={4}
                  />
                </div>

                {detail.leads?.donnees_produit && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Détails du formulaire</div>
                    <div className="border rounded-lg overflow-hidden text-xs">
                      <table className="w-full">
                        <tbody>
                          {Object.entries(detail.leads.donnees_produit)
                            .filter(([k]) => !["formType", "leadId", "timestamp", "language", "source"].includes(k))
                            .map(([k, v]: any, i) => (
                              <tr key={k} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                                <td className="px-3 py-1.5 font-medium text-muted-foreground w-1/3">{k}</td>
                                <td className="px-3 py-1.5">
                                  {typeof v === "boolean" ? (v ? "Oui" : "Non") : String(v ?? "—")}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDetail(null)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PartnerLayout>
  );
}

function Field({ label, value }: { label: string; value?: any }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}
