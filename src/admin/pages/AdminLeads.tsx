import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Search, Loader2, Eye, Send, XCircle, Inbox, UserCog, AlertCircle, CheckCircle2,
  Heart, PiggyBank, HelpingHand, Home, Briefcase, Car, House, Scale, Building,
  Building2, FileX, Baby, Handshake, LayoutGrid,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type LeadStatut = "all" | "nouveau" | "distribue" | "non_distribuable";

const STATUT_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  nouveau: { label: "À traiter", variant: "default" },
  distribue: { label: "Distribué", variant: "secondary" },
  non_distribuable: { label: "Non distribuable", variant: "destructive" },
};

const MOTIF_LABEL: Record<string, string> = {
  age_superieur_63: "Âge > 63 ans",
  aucune_commande_eligible: "Aucune commande active",
  aucun_canal_actif: "Aucun canal configuré",
  autre: "Autre",
};

// Sous-onglets par type de formulaire (granularité fine, plus précise que le domain)
const FORM_TYPES: { value: string; label: string; short: string; icon: any }[] = [
  { value: "all",                     label: "Tous les types",          short: "Tous",        icon: LayoutGrid },
  { value: "health-insurance",        label: "Santé (LAMal)",            short: "Santé",       icon: Heart },
  { value: "subsidy",                 label: "Subside",                  short: "Subside",     icon: HelpingHand },
  { value: "pillar-3a",               label: "3e Pilier",                short: "3e Pilier",   icon: PiggyBank },
  { value: "lpp-libre-passage",       label: "LPP / Libre passage",      short: "LPP",         icon: Briefcase },
  { value: "mortgage",                label: "Hypothèque",               short: "Hypothèque",  icon: Home },
  { value: "car-insurance",           label: "Voiture",                  short: "Voiture",     icon: Car },
  { value: "household-insurance",     label: "Ménage",                   short: "Ménage",      icon: House },
  { value: "legal-protection",        label: "Protection juridique",     short: "Juridique",   icon: Scale },
  { value: "professional-insurance",  label: "Pro / Entreprise",         short: "Pro",         icon: Building },
  { value: "estimation-immobiliere",  label: "Estimation immobilière",   short: "Estimation",  icon: Building2 },
  { value: "termination",             label: "Résiliation",              short: "Résiliation", icon: FileX },
  { value: "prenatal-insurance",      label: "Prénatale",                short: "Prénatale",   icon: Baby },
  { value: "partner",                 label: "Partenaire",               short: "Partenaire",  icon: Handshake },
];

export default function AdminLeads() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState<LeadStatut>("nouveau");
  const [filterFormType, setFilterFormType] = useState<string>("all");

  const [selected, setSelected] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerLead, setPickerLead] = useState<any | null>(null);

  // ----------------------------------------------------------------------------
  // Fetch leads
  // ----------------------------------------------------------------------------
  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin-leads", filterStatut, filterFormType, search],
    queryFn: async () => {
      let q = supabase.from("leads").select("*").order("cree_le", { ascending: false }).limit(200);
      if (filterStatut !== "all") q = q.eq("statut", filterStatut);
      if (filterFormType !== "all") q = q.eq("source_formulaire", filterFormType);
      if (search) {
        q = q.or(
          `prenom.ilike.%${search}%,nom.ilike.%${search}%,email.ilike.%${search}%,telephone.ilike.%${search}%`
        );
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  // Compteurs par type de formulaire (combinés avec le filterStatut courant)
  const { data: formCounts } = useQuery({
    queryKey: ["admin-leads-form-counts", filterStatut],
    queryFn: async () => {
      let q = supabase.from("leads").select("source_formulaire");
      if (filterStatut !== "all") q = q.eq("statut", filterStatut);
      const { data, error } = await q;
      if (error) throw error;
      const counts: Record<string, number> = { all: 0 };
      (data ?? []).forEach((row: any) => {
        counts.all++;
        const ft = row.source_formulaire ?? "unknown";
        counts[ft] = (counts[ft] ?? 0) + 1;
      });
      return counts;
    },
    refetchInterval: 30000,
  });

  // ----------------------------------------------------------------------------
  // Compteurs par statut (pour les onglets)
  // ----------------------------------------------------------------------------
  const { data: counts } = useQuery({
    queryKey: ["admin-leads-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("statut", { count: "exact" });
      if (error) throw error;
      const result = { nouveau: 0, distribue: 0, non_distribuable: 0, all: 0 };
      (data ?? []).forEach((row: any) => {
        result.all++;
        if (row.statut in result) (result as any)[row.statut]++;
      });
      return result;
    },
    refetchInterval: 30000,
  });

  // ----------------------------------------------------------------------------
  // Mutations
  // ----------------------------------------------------------------------------
  const routeMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const { data, error } = await supabase.rpc("route_lead", { p_lead_id: leadId });
      if (error) throw error;
      return data;
    },
    onSuccess: (distributionId, leadId) => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      qc.invalidateQueries({ queryKey: ["admin-leads-counts"] });
      if (distributionId) {
        toast({ title: "Lead distribué", description: "Une commande éligible a été trouvée et le lead routé." });
      } else {
        toast({
          title: "Lead marqué non distribuable",
          description: "Aucune commande active éligible n'a été trouvée. Vérifie le détail pour le motif.",
          variant: "destructive",
        });
      }
    },
    onError: (e: any) => toast({ title: "Erreur de distribution", description: e.message, variant: "destructive" }),
  });

  // Liste des commandes éligibles pour le lead sélectionné dans le picker
  const { data: eligibles, isLoading: loadingEligibles } = useQuery({
    queryKey: ["lead-eligible-orders", pickerLead?.id],
    enabled: !!pickerLead?.id && pickerOpen,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_eligible_orders_for_lead", {
        p_lead_id: pickerLead!.id,
      });
      if (error) throw error;
      return data ?? [];
    },
  });

  const distributeManualMutation = useMutation({
    mutationFn: async ({ leadId, orderLineId }: { leadId: string; orderLineId: string }) => {
      const { data, error } = await supabase.rpc("distribute_lead_manual", {
        p_lead_id: leadId,
        p_order_line_id: orderLineId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      qc.invalidateQueries({ queryKey: ["admin-leads-counts"] });
      qc.invalidateQueries({ queryKey: ["lead-eligible-orders"] });
      toast({ title: "Lead distribué", description: "Le courtier sélectionné a reçu le lead." });
      setPickerOpen(false);
      setPickerLead(null);
    },
    onError: (e: any) => toast({ title: "Erreur de distribution", description: e.message, variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from("leads")
        .update({ statut: "non_distribuable", motif_non_distribution: "autre" })
        .eq("id", leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      qc.invalidateQueries({ queryKey: ["admin-leads-counts"] });
      toast({ title: "Lead rejeté", description: "Marqué non distribuable." });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  // ----------------------------------------------------------------------------
  // Rendu
  // ----------------------------------------------------------------------------
  const handleDistribute = (lead: any) => {
    if (confirm(`Distribuer le lead ${lead.prenom ?? ""} ${lead.nom ?? ""} (${lead.produit}) au meilleur courtier éligible ?`)) {
      routeMutation.mutate(lead.id);
    }
  };

  const handleReject = (lead: any) => {
    if (confirm(`Rejeter ce lead (marquer non distribuable) ?`)) {
      rejectMutation.mutate(lead.id);
    }
  };

  const openDetail = (lead: any) => {
    setSelected(lead);
    setDetailOpen(true);
  };

  const openPicker = (lead: any) => {
    setPickerLead(lead);
    setPickerOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Boîte de réception des leads capturés par le comparateur
            </p>
          </div>
        </div>

        {/* Tabs / Compteurs */}
        <div className="grid grid-cols-4 gap-4">
          <CounterCard
            label="À traiter"
            count={counts?.nouveau ?? 0}
            active={filterStatut === "nouveau"}
            onClick={() => setFilterStatut("nouveau")}
            color="bg-blue-500"
          />
          <CounterCard
            label="Distribués"
            count={counts?.distribue ?? 0}
            active={filterStatut === "distribue"}
            onClick={() => setFilterStatut("distribue")}
            color="bg-green-500"
          />
          <CounterCard
            label="Non distribuables"
            count={counts?.non_distribuable ?? 0}
            active={filterStatut === "non_distribuable"}
            onClick={() => setFilterStatut("non_distribuable")}
            color="bg-red-500"
          />
          <CounterCard
            label="Tous"
            count={counts?.all ?? 0}
            active={filterStatut === "all"}
            onClick={() => setFilterStatut("all")}
            color="bg-slate-500"
          />
        </div>

        {/* Sous-onglets par type d'assurance */}
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="flex items-center gap-1 min-w-max pb-2">
            {FORM_TYPES.map((ft) => {
              const Icon = ft.icon;
              const count = formCounts?.[ft.value] ?? 0;
              const active = filterFormType === ft.value;
              return (
                <button
                  key={ft.value}
                  onClick={() => setFilterFormType(ft.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
                    active
                      ? "bg-[hsl(var(--optimis-green))] text-white border-[hsl(var(--optimis-green))] shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{ft.short}</span>
                  {count > 0 && (
                    <Badge
                      variant={active ? "secondary" : "outline"}
                      className={active ? "bg-white/20 text-white border-transparent" : ""}
                    >
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recherche */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Recherche par nom, email ou téléphone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Liste */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : (leads?.length ?? 0) === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun lead pour ce filtre.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Reçu</th>
                      <th className="text-left p-3 font-medium">Identité</th>
                      <th className="text-left p-3 font-medium">Contact</th>
                      <th className="text-left p-3 font-medium">Canton</th>
                      <th className="text-left p-3 font-medium">Produit</th>
                      <th className="text-left p-3 font-medium">Âge</th>
                      <th className="text-left p-3 font-medium">Statut</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads!.map((lead: any) => (
                      <tr key={lead.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 text-xs text-muted-foreground">
                          {new Date(lead.cree_le).toLocaleString("fr-CH", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-3">
                          <div className="font-medium">
                            {lead.prenom ?? "—"} {lead.nom ?? ""}
                          </div>
                        </td>
                        <td className="p-3 text-xs">
                          <div>{lead.email ?? "—"}</div>
                          <div className="text-muted-foreground">{lead.telephone ?? ""}</div>
                        </td>
                        <td className="p-3">{lead.canton ?? "—"}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">
                            {lead.produit}
                          </Badge>
                        </td>
                        <td className="p-3">{lead.age ?? "—"}</td>
                        <td className="p-3">
                          <Badge variant={STATUT_BADGE[lead.statut]?.variant ?? "outline"}>
                            {STATUT_BADGE[lead.statut]?.label ?? lead.statut}
                          </Badge>
                          {lead.motif_non_distribution && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {MOTIF_LABEL[lead.motif_non_distribution] ?? lead.motif_non_distribution}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openDetail(lead)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {lead.statut === "nouveau" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openPicker(lead)}
                                  title="Choisir un courtier"
                                >
                                  <UserCog className="h-4 w-4 mr-1" /> Choisir
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleDistribute(lead)}
                                  disabled={routeMutation.isPending}
                                  title="Distribution automatique (meilleur match)"
                                >
                                  <Send className="h-4 w-4 mr-1" /> Auto
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleReject(lead)}
                                  disabled={rejectMutation.isPending}
                                  className="text-destructive hover:text-destructive"
                                  title="Rejeter (non distribuable)"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Sélection courtier (distribution manuelle) */}
        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Choisir le courtier pour ce lead
              </DialogTitle>
            </DialogHeader>
            {pickerLead && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <div className="font-medium">
                    {pickerLead.prenom ?? ""} {pickerLead.nom ?? ""}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {pickerLead.produit} · {pickerLead.canton ?? "—"} · {pickerLead.email ?? "—"}
                  </div>
                </div>

                {loadingEligibles ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : (eligibles?.length ?? 0) === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground border rounded-lg">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                    Aucune commande active ne correspond à ce lead.
                    <div className="text-xs mt-2">
                      Vérifie : produit du lead = "{pickerLead.produit}", solde restant &gt; 0,
                      statut actif, fenêtre de dates ouverte, canton/langue compatible.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {eligibles!.length} commande{eligibles!.length > 1 ? "s" : ""} éligible
                      {eligibles!.length > 1 ? "s" : ""} — triées par score (plus haut = meilleur match selon l'équilibrage pondéré)
                    </div>
                    {eligibles!.map((eo: any) => (
                      <Card
                        key={eo.order_line_id}
                        className={`transition-all ${
                          eo.has_active_canal
                            ? "hover:shadow-md cursor-pointer"
                            : "opacity-60"
                        }`}
                      >
                        <CardContent className="p-4 flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">
                              {eo.company_name}
                              <span className="text-xs font-normal text-muted-foreground ml-2">
                                · {eo.contact_name ?? ""}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {eo.order_number} · {eo.product_name}
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <Badge variant="outline">
                                Solde : <strong className="ml-1">{eo.solde_restant}</strong>/{eo.quantity}
                              </Badge>
                              <Badge variant="outline">
                                Reçus : {eo.leads_recus}
                              </Badge>
                              <Badge variant="secondary">
                                Score : <strong className="ml-1">{Number(eo.score).toFixed(2)}</strong>
                              </Badge>
                              {eo.has_active_canal ? (
                                <span className="inline-flex items-center text-green-600 gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Canal actif
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-amber-600 gap-1">
                                  <AlertCircle className="h-3 w-3" /> Pas de canal
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            disabled={!eo.has_active_canal || distributeManualMutation.isPending}
                            onClick={() =>
                              distributeManualMutation.mutate({
                                leadId: pickerLead.id,
                                orderLineId: eo.order_line_id,
                              })
                            }
                          >
                            <Send className="h-4 w-4 mr-1" /> Distribuer ici
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setPickerOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Détail */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détail du lead</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Reçu le" value={new Date(selected.cree_le).toLocaleString("fr-CH")} />
                  <Field label="Statut" value={STATUT_BADGE[selected.statut]?.label ?? selected.statut} />
                  <Field label="Prénom" value={selected.prenom} />
                  <Field label="Nom" value={selected.nom} />
                  <Field label="Email" value={selected.email} />
                  <Field label="Téléphone" value={selected.telephone} />
                  <Field label="Canton" value={selected.canton} />
                  <Field label="Langue" value={selected.langue} />
                  <Field label="Date naissance" value={selected.date_naissance} />
                  <Field label="Âge" value={selected.age} />
                  <Field label="Produit" value={selected.produit} />
                  <Field label="Source trafic" value={selected.source_trafic} />
                  <Field label="URL page" value={selected.url_page} className="col-span-2 break-all" />
                  <Field label="ID externe (Zapier)" value={selected.source_externe_id} className="col-span-2" />
                  {selected.motif_non_distribution && (
                    <Field
                      label="Motif non distribution"
                      value={MOTIF_LABEL[selected.motif_non_distribution] ?? selected.motif_non_distribution}
                      className="col-span-2"
                    />
                  )}
                </div>

                {selected.donnees_produit && Object.keys(selected.donnees_produit).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        Toutes les données reçues (identique au payload Zapier)
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const text = Object.entries(selected.donnees_produit)
                            .map(([k, v]) => `${k}\t${formatValue(v)}`)
                            .join("\n");
                          navigator.clipboard.writeText(text);
                          toast({ title: "Copié", description: "Données copiées (TSV, collable dans Excel/Sheets)" });
                        }}
                      >
                        Copier
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <tbody>
                          {Object.entries(selected.donnees_produit).map(([key, value], i) => (
                            <tr key={key} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                              <td className="px-3 py-2 font-medium text-muted-foreground border-r w-1/3 align-top">
                                {key}
                              </td>
                              <td className="px-3 py-2 break-all align-top">{formatValue(value)}</td>
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
              {selected?.statut === "nouveau" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDetailOpen(false);
                      openPicker(selected);
                    }}
                  >
                    <UserCog className="h-4 w-4 mr-2" /> Choisir courtier
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      setDetailOpen(false);
                      handleDistribute(selected);
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" /> Auto-distribuer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDetailOpen(false);
                      handleReject(selected);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Rejeter
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={() => setDetailOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------
function CounterCard({
  label,
  count,
  active,
  onClick,
  color,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl border bg-card p-4 transition-all ${
        active ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase text-muted-foreground tracking-wider">{label}</div>
          <div className="text-3xl font-bold mt-2">{count}</div>
        </div>
        <span className={`h-2 w-2 rounded-full ${color} mt-2`} />
      </div>
    </button>
  );
}

function Field({ label, value, className = "" }: { label: string; value?: any; className?: string }) {
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
