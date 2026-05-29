import { useState, useEffect, useMemo } from "react";
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
  Building2, FileX, Baby, Handshake, LayoutGrid, ArrowUpDown,
} from "lucide-react";
import { getColumnsFor, type LeadColumn } from "@/admin/lib/leadColumns";
import { getFiltersFor, applyFilters, type LeadFilter } from "@/admin/lib/leadFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, CheckSquare, Square } from "lucide-react";
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

  // Multi-sélection (batch distribution)
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [batchPickerOpen, setBatchPickerOpen] = useState(false);
  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };
  const clearSelection = () => setSelectedLeadIds(new Set());

  // Tri Sheet-like
  const [sortKey, setSortKey] = useState<string>("cree_le");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const columns = getColumnsFor(filterFormType);

  // Largeurs personnalisées des colonnes (resize par drag) + persist localStorage
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  // Charge les largeurs sauvegardées au changement de formType
  useEffect(() => {
    const stored = localStorage.getItem(`optimis.leadColumnWidths.${filterFormType}`);
    setColumnWidths(stored ? JSON.parse(stored) : {});
  }, [filterFormType]);

  // Sauve les largeurs à chaque modification
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      localStorage.setItem(`optimis.leadColumnWidths.${filterFormType}`, JSON.stringify(columnWidths));
    }
  }, [columnWidths, filterFormType]);

  // Handler du resize drag (au mousedown sur le handle de droite d'un header)
  const startColumnResize = (key: string, startX: number, startWidth: number) => {
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(50, Math.min(800, startWidth + (e.clientX - startX)));
      setColumnWidths((prev) => ({ ...prev, [key]: newWidth }));
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Reset des widths personnalisés
  const resetColumnWidths = () => {
    setColumnWidths({});
    localStorage.removeItem(`optimis.leadColumnWidths.${filterFormType}`);
  };

  // Filtres avancés par type
  const advancedFilters = getFiltersFor(filterFormType);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  // Reset des filtres avancés quand on change de type
  useEffect(() => {
    setFilterValues({});
  }, [filterFormType]);

  const activeFiltersCount = Object.values(filterValues).filter((v) => v && v !== "all").length;
  const clearAllFilters = () => setFilterValues({});

  // ----------------------------------------------------------------------------
  // Fetch leads
  // ----------------------------------------------------------------------------
  const { data: leads, isLoading, error: leadsError } = useQuery({
    queryKey: ["admin-leads", filterStatut, filterFormType, search],
    queryFn: async () => {
      let q = supabase
        .from("leads")
        .select(`
          *,
          distributions:distributions(
            id, client_id, order_id, canal_id, statut, cree_le, envoye_le,
            admin_clients:admin_clients(company_name, contact_name, email, phone),
            admin_orders:admin_orders(order_number),
            canaux_livraison:canaux_livraison(type)
          )
        `)
        .order("cree_le", { ascending: false })
        .limit(200);
      if (filterStatut !== "all") q = q.eq("statut", filterStatut);
      if (filterFormType !== "all") q = q.eq("source_formulaire", filterFormType);
      if (search) {
        q = q.or(
          `prenom.ilike.%${search}%,nom.ilike.%${search}%,email.ilike.%${search}%,telephone.ilike.%${search}%`
        );
      }
      const { data, error } = await q;
      if (error) {
        console.error("[AdminLeads] Erreur requête leads:", error);
        throw error;
      }
      return data ?? [];
    },
    retry: false,
  });

  // Application des filtres avancés côté client (sur les leads déjà fetchés)
  const leadsFiltered = useMemo(() => {
    if (!leads || activeFiltersCount === 0) return leads ?? [];
    return applyFilters(leads, advancedFilters, filterValues);
  }, [leads, advancedFilters, filterValues, activeFiltersCount]);

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
      const { data: distId, error } = await supabase.rpc("route_lead", { p_lead_id: leadId });
      if (error) throw error;
      // Si une distribution a été créée → déclenche la livraison
      if (distId) {
        await supabase.functions.invoke("deliver-distribution", { body: { distribution_id: distId } });
      }
      return distId;
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

  // Auto-distribution batch : route_lead pour chaque lead sélectionné
  const batchAutoMutation = useMutation({
    mutationFn: async (leadIds: string[]) => {
      const results = { distribues: 0, non_distribuables: 0, erreurs: 0, livraisons_ok: 0, livraisons_ko: 0 };
      for (const leadId of leadIds) {
        try {
          const { data: distId, error } = await supabase.rpc("route_lead", { p_lead_id: leadId });
          if (error) { results.erreurs++; continue; }
          if (distId) {
            results.distribues++;
            // Déclenche la livraison via le canal du courtier (async)
            try {
              const { error: deliverErr } = await supabase.functions.invoke("deliver-distribution", {
                body: { distribution_id: distId },
              });
              if (deliverErr) results.livraisons_ko++;
              else results.livraisons_ok++;
            } catch {
              results.livraisons_ko++;
            }
          } else {
            results.non_distribuables++;
          }
        } catch {
          results.erreurs++;
        }
      }
      return results;
    },
    onSuccess: (results) => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      qc.invalidateQueries({ queryKey: ["admin-leads-counts"] });
      qc.invalidateQueries({ queryKey: ["admin-leads-form-counts"] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      clearSelection();
      toast({
        title: `Distribution batch terminée`,
        description: `${results.distribues} distribués (livraison: ${results.livraisons_ok} ok · ${results.livraisons_ko} KO) · ${results.non_distribuables} non distribuables · ${results.erreurs} erreurs`,
      });
    },
    onError: (e: any) => toast({ title: "Erreur batch", description: e.message, variant: "destructive" }),
  });

  // Distribution manuelle batch : distribute_lead_manual à un même courtier pour tous
  const batchManualMutation = useMutation({
    mutationFn: async ({ leadIds, orderLineId, canalId }: { leadIds: string[]; orderLineId: string; canalId: string }) => {
      const results = { ok: 0, erreurs: 0, livraisons_ok: 0, livraisons_ko: 0, messages: [] as string[] };
      for (const leadId of leadIds) {
        try {
          const { data: distId, error } = await supabase.rpc("distribute_lead_manual", {
            p_lead_id: leadId,
            p_order_line_id: orderLineId,
            p_canal_id: canalId,
          });
          if (error) {
            results.erreurs++;
            results.messages.push(error.message);
            continue;
          }
          if (distId) {
            results.ok++;
            // Déclenche la livraison
            try {
              const { error: dErr } = await supabase.functions.invoke("deliver-distribution", {
                body: { distribution_id: distId },
              });
              if (dErr) { results.livraisons_ko++; results.messages.push(dErr.message); }
              else results.livraisons_ok++;
            } catch (e: any) {
              results.livraisons_ko++;
              results.messages.push(e.message);
            }
          } else {
            results.erreurs++;
          }
        } catch (e: any) {
          results.erreurs++;
          results.messages.push(e.message);
        }
      }
      return results;
    },
    onSuccess: (results) => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      qc.invalidateQueries({ queryKey: ["admin-leads-counts"] });
      qc.invalidateQueries({ queryKey: ["admin-leads-form-counts"] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      clearSelection();
      setBatchPickerOpen(false);
      toast({
        title: `${results.ok} leads distribués`,
        description: results.erreurs > 0 ? `${results.erreurs} échecs : ${results.messages[0] ?? ""}` : "Tous OK",
        variant: results.erreurs > 0 ? "destructive" : "default",
      });
    },
    onError: (e: any) => toast({ title: "Erreur batch", description: e.message, variant: "destructive" }),
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

        {/* Filtre statut — chips compacts inline */}
        <div className="flex items-center gap-1 -mt-2">
          <StatutChip label="À traiter" count={counts?.nouveau ?? 0} active={filterStatut === "nouveau"} onClick={() => setFilterStatut("nouveau")} dot="bg-blue-500" />
          <StatutChip label="Distribués" count={counts?.distribue ?? 0} active={filterStatut === "distribue"} onClick={() => setFilterStatut("distribue")} dot="bg-green-500" />
          <StatutChip label="Non distribuables" count={counts?.non_distribuable ?? 0} active={filterStatut === "non_distribuable"} onClick={() => setFilterStatut("non_distribuable")} dot="bg-red-500" />
          <StatutChip label="Tous" count={counts?.all ?? 0} active={filterStatut === "all"} onClick={() => setFilterStatut("all")} dot="bg-slate-500" />
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

        {/* Recherche + Filtres avancés */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Recherche par nom, email ou téléphone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres avancés (adaptés au type) */}
            {advancedFilters.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-1">
                  Filtres
                </span>
                {advancedFilters.map((f) => (
                  <FilterControl
                    key={f.key}
                    filter={f}
                    value={filterValues[f.key] ?? ""}
                    onChange={(v) => setFilterValues({ ...filterValues, [f.key]: v })}
                  />
                ))}
                {activeFiltersCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground ml-auto"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Effacer {activeFiltersCount} filtre{activeFiltersCount > 1 ? "s" : ""}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Barre d'outils tableau */}
        {Object.keys(columnWidths).length > 0 && (
          <div className="flex items-center justify-end -mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetColumnWidths}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" /> Réinitialiser largeurs colonnes
            </Button>
          </div>
        )}

        {/* Tableau Sheet-like */}
        <Card>
          <CardContent className="p-0">
            {leadsError ? (
              <div className="p-12 text-center text-destructive">
                <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                <p className="font-semibold mb-2">Erreur de chargement des leads</p>
                <p className="text-sm font-mono bg-destructive/10 px-3 py-2 rounded inline-block max-w-2xl">
                  {(leadsError as any).message ?? String(leadsError)}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  Code : {(leadsError as any).code ?? "—"} · Détail : {(leadsError as any).details ?? "—"}
                </p>
              </div>
            ) : isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : (
              <div className="relative overflow-auto max-h-[calc(100vh-340px)]">
                <table className="w-full text-xs font-mono" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                  {/* Header toujours visible — même quand 0 lead, on voit la structure */}
                  <thead className="sticky top-0 z-20 bg-slate-50 border-b shadow-sm">
                    <tr>
                      {/* Colonne checkbox (multi-select) */}
                      <th className="sticky left-0 z-30 bg-slate-50 px-2 py-1.5 border-r w-10">
                        <Checkbox
                          checked={
                            leadsFiltered.length > 0 &&
                            leadsFiltered.every((l: any) => selectedLeadIds.has(l.id))
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLeadIds(new Set(leadsFiltered.map((l: any) => l.id)));
                            } else {
                              clearSelection();
                            }
                          }}
                          title="Tout sélectionner / désélectionner"
                        />
                      </th>
                      {columns.map((col) => (
                        <SheetHeader
                          key={col.key}
                          col={col}
                          customWidth={columnWidths[col.key]}
                          onResizeStart={startColumnResize}
                          sortKey={sortKey}
                          sortDir={sortDir}
                          onSort={(k) => {
                            if (sortKey === k) {
                              setSortDir(sortDir === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey(k);
                              setSortDir("desc");
                            }
                          }}
                        />
                      ))}
                      <th className="sticky right-0 z-30 bg-slate-50 border-l text-right px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(leadsFiltered?.length ?? 0) === 0 ? (
                      <tr>
                        <td colSpan={columns.length + 2} className="p-12 text-center text-muted-foreground bg-white">
                          <Inbox className="h-10 w-10 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">Aucun lead pour ce filtre.</p>
                          <p className="text-xs mt-1 opacity-70">
                            Quand un lead {filterFormType === "all" ? "" : `de type "${FORM_TYPES.find(f => f.value === filterFormType)?.label ?? filterFormType}"`} arrivera, il apparaîtra ici avec les {columns.length} colonnes visibles ci-dessus.
                          </p>
                          {activeFiltersCount > 0 && (
                            <Button variant="link" size="sm" onClick={clearAllFilters} className="mt-2">
                              Effacer les filtres
                            </Button>
                          )}
                        </td>
                      </tr>
                    ) : sortLeads(leadsFiltered, sortKey, sortDir, columns).map((lead: any, idx: number) => (
                      <tr
                        key={lead.id}
                        className={`border-b hover:bg-blue-50/40 ${
                          selectedLeadIds.has(lead.id)
                            ? "bg-blue-50"
                            : idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                        }`}
                      >
                        {/* Checkbox de sélection */}
                        <td className={`sticky left-0 z-10 px-2 py-0.5 border-r w-10 ${
                          selectedLeadIds.has(lead.id)
                            ? "bg-blue-50"
                            : idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                        }`}>
                          <Checkbox
                            checked={selectedLeadIds.has(lead.id)}
                            onCheckedChange={() => toggleLeadSelection(lead.id)}
                          />
                        </td>
                        {columns.map((col) => (
                          <SheetCell key={col.key} lead={lead} col={col} customWidth={columnWidths[col.key]} />
                        ))}
                        <td className={`sticky right-0 border-l px-2 py-1 text-right w-32 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                          <div className="inline-flex items-center gap-0.5">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openDetail(lead)} title="Voir détails">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {lead.statut === "nouveau" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-blue-600"
                                  onClick={() => openPicker(lead)}
                                  title="Choisir un courtier"
                                >
                                  <UserCog className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-green-600"
                                  onClick={() => handleDistribute(lead)}
                                  disabled={routeMutation.isPending}
                                  title="Auto-distribuer"
                                >
                                  <Send className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-red-600"
                                  onClick={() => handleReject(lead)}
                                  disabled={rejectMutation.isPending}
                                  title="Rejeter"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
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

                {/* Section Distribution (si le lead a été distribué) */}
                {selected.distributions && selected.distributions.length > 0 && (
                  <div className="border rounded-lg p-3 bg-green-50/50 border-green-200">
                    <div className="text-xs font-medium text-green-800 mb-2 uppercase tracking-wider">
                      🚀 Distribution
                    </div>
                    {selected.distributions.map((d: any) => (
                      <div key={d.id} className="text-sm space-y-1">
                        <div>
                          <span className="text-muted-foreground">Courtier :</span>{" "}
                          <strong>{d.admin_clients?.company_name ?? "—"}</strong>
                          {d.admin_clients?.contact_name && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({d.admin_clients.contact_name})
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Commande :</span>{" "}
                            <strong>{d.admin_orders?.order_number ?? "—"}</strong>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Canal :</span>{" "}
                            <Badge variant="outline" className="text-[10px] ml-1">{d.canaux_livraison?.type ?? "—"}</Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Statut envoi :</span>{" "}
                            <Badge variant={d.statut === "envoye" ? "secondary" : d.statut === "echec" ? "destructive" : "outline"} className="text-[10px] ml-1">
                              {d.statut}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Distribué le :</span>{" "}
                            <strong>{new Date(d.cree_le).toLocaleString("fr-CH")}</strong>
                          </div>
                          {d.admin_clients?.email && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Contact :</span>{" "}
                              {d.admin_clients.email} {d.admin_clients?.phone && `· ${d.admin_clients.phone}`}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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

        {/* Barre d'action flottante (multi-sélection) */}
        {selectedLeadIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-full shadow-2xl flex items-center gap-2 pl-5 pr-2 py-2 border border-slate-700">
            <CheckSquare className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium whitespace-nowrap">
              {selectedLeadIds.size} lead{selectedLeadIds.size > 1 ? "s" : ""} sélectionné{selectedLeadIds.size > 1 ? "s" : ""}
            </span>
            <div className="h-5 w-px bg-slate-700 mx-1" />
            <Button
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full h-8"
              onClick={() => {
                if (confirm(`Auto-distribuer ${selectedLeadIds.size} leads ?\nChaque lead sera routé vers le meilleur courtier éligible (équilibrage pondéré).`)) {
                  batchAutoMutation.mutate(Array.from(selectedLeadIds));
                }
              }}
              disabled={batchAutoMutation.isPending}
            >
              {batchAutoMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Auto-distribuer
            </Button>
            <Button
              size="sm"
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-8"
              onClick={() => setBatchPickerOpen(true)}
              disabled={batchManualMutation.isPending}
            >
              <UserCog className="h-3.5 w-3.5" />
              Tous au même courtier
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full h-8"
              title="Désélectionner tout"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Modal picker batch (choisir 1 courtier pour les N leads sélectionnés) */}
        <BatchPickerModal
          open={batchPickerOpen}
          onClose={() => setBatchPickerOpen(false)}
          leadIds={Array.from(selectedLeadIds)}
          onConfirm={(orderLineId, canalId) => batchManualMutation.mutate({ leadIds: Array.from(selectedLeadIds), orderLineId, canalId })}
          isPending={batchManualMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------
function StatutChip({
  label,
  count,
  active,
  onClick,
  dot,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  dot: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
        active
          ? "bg-[hsl(var(--optimis-green))] text-white border-[hsl(var(--optimis-green))] shadow-sm"
          : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${dot} ${active ? "opacity-100" : "opacity-70"}`} />
      <span>{label}</span>
      <span className={`text-[10px] font-bold ${active ? "text-white/90" : "text-foreground"}`}>{count}</span>
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

// ============================================================================
// Composants Sheet-like (header, cellule, tri)
// ============================================================================

function SheetHeader({
  col,
  sortKey,
  sortDir,
  onSort,
  customWidth,
  onResizeStart,
}: {
  col: LeadColumn;
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
  customWidth?: number;
  onResizeStart: (key: string, startX: number, startWidth: number) => void;
}) {
  const active = sortKey === col.key;
  const stickyClass = col.sticky ? "sticky left-0 z-30 bg-slate-50" : "";
  const alignClass = col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left";
  const widthStyle = customWidth ? { width: `${customWidth}px`, minWidth: `${customWidth}px`, maxWidth: `${customWidth}px` } : undefined;
  return (
    <th
      style={widthStyle}
      className={`relative px-1.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 border-r ${customWidth ? "" : (col.width ?? "")} ${stickyClass} ${alignClass}`}
    >
      <button
        onClick={() => onSort(col.key)}
        className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors w-full"
      >
        <span className="truncate">{col.label}</span>
        <ArrowUpDown className={`h-2.5 w-2.5 transition-opacity flex-shrink-0 ${active ? "opacity-100 text-blue-600" : "opacity-30"}`} />
        {active && <span className="text-blue-600 text-[9px]">{sortDir === "asc" ? "↑" : "↓"}</span>}
      </button>
      {/* Handle de resize — drag horizontal */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const startWidth = (e.currentTarget.parentElement as HTMLElement).offsetWidth;
          onResizeStart(col.key, e.clientX, startWidth);
        }}
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-400/60 active:bg-blue-500 transition-colors z-30"
        title="Glisser pour redimensionner"
      />
    </th>
  );
}

function SheetCell({ lead, col, customWidth }: { lead: any; col: LeadColumn; customWidth?: number }) {
  const raw = col.source === "bd" ? lead[col.key] : lead.donnees_produit?.[col.key];
  const stickyClass = col.sticky ? "sticky left-0 z-10 bg-inherit" : "";
  const alignClass = col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left";
  const widthStyle = customWidth ? { width: `${customWidth}px`, minWidth: `${customWidth}px`, maxWidth: `${customWidth}px` } : undefined;
  const widthClass = customWidth ? "" : (col.width ?? "");

  // Rendu spécial pour certains champs
  if (col.key === "statut" && col.source === "bd") {
    return (
      <td style={widthStyle} className={`px-1.5 py-0.5 border-r ${widthClass} ${stickyClass}`}>
        <Badge variant={STATUT_BADGE[raw]?.variant ?? "outline"} className="text-[10px] px-1.5 py-0">
          {STATUT_BADGE[raw]?.label ?? raw}
        </Badge>
      </td>
    );
  }

  if (col.key === "source_formulaire" && col.source === "bd") {
    return (
      <td style={widthStyle} className={`px-1.5 py-0.5 border-r ${widthClass} ${stickyClass}`}>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{raw ?? "—"}</Badge>
      </td>
    );
  }

  // Cas spécial : courtier destinataire (lit dans distributions[0].admin_clients.company_name)
  if (col.key === "courtier_destinataire") {
    const dist = lead.distributions?.[0];
    const courtier = dist?.admin_clients?.company_name;
    const canalType = dist?.canaux_livraison?.type;
    const orderNumber = dist?.admin_orders?.order_number;
    return (
      <td style={widthStyle} className={`px-1.5 py-0.5 border-r truncate ${widthClass} ${stickyClass}`}>
        {courtier ? (
          <div className="leading-tight" title={`Distribué via ${canalType ?? "?"} · ${orderNumber ?? ""}`}>
            <div className="font-medium text-slate-800 truncate">{courtier}</div>
            <div className="text-[9px] text-slate-500 truncate">{orderNumber ?? ""} · {canalType ?? ""}</div>
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
    );
  }

  // Formatage par défaut
  let display: string;
  if (raw === null || raw === undefined || raw === "") {
    display = "—";
  } else if (col.format === "datetime") {
    display = new Date(raw).toLocaleString("fr-CH", {
      day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  } else if (col.format === "date") {
    display = new Date(raw).toLocaleDateString("fr-CH");
  } else if (typeof raw === "boolean") {
    display = raw ? "Oui" : "Non";
  } else if (typeof raw === "object") {
    display = JSON.stringify(raw);
  } else {
    display = String(raw);
  }

  const isMuted = display === "—";

  return (
    <td
      style={widthStyle}
      className={`px-1.5 py-0.5 border-r truncate ${widthClass} ${stickyClass} ${alignClass} ${isMuted ? "text-slate-300" : "text-slate-700"}`}
    >
      <span className="truncate block" title={display}>{display}</span>
    </td>
  );
}

// ============================================================================
// Modal de distribution batch — choisir 1 courtier pour N leads
// ============================================================================
function BatchPickerModal({
  open,
  onClose,
  leadIds,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  leadIds: string[];
  onConfirm: (orderLineId: string, canalId: string) => void;
  isPending: boolean;
}) {
  // Récupère tous les clients qui ont une commande active + un canal
  const { data: clientsOptions } = useQuery({
    queryKey: ["batch-clients-eligible", open],
    enabled: open,
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("admin_orders")
        .select(`
          id, order_number, statut_distribution, client_id,
          admin_clients(id, company_name),
          admin_order_lines(id, product_name, quantity, solde_restant, domain, subcategory)
        `)
        .eq("statut_distribution", "active");
      if (error) throw error;

      // Liste les courtiers (clients) avec leurs lignes de commande dispo
      const map = new Map<string, { client_id: string; company_name: string; lines: any[] }>();
      (orders ?? []).forEach((o: any) => {
        if (!o.admin_clients) return;
        const entry = map.get(o.client_id) ?? {
          client_id: o.client_id,
          company_name: o.admin_clients.company_name,
          lines: [],
        };
        (o.admin_order_lines ?? [])
          .filter((l: any) => (l.solde_restant ?? 0) > 0)
          .forEach((l: any) => {
            entry.lines.push({ ...l, order_number: o.order_number });
          });
        if (entry.lines.length > 0) map.set(o.client_id, entry);
      });
      return Array.from(map.values());
    },
  });

  // Pour chaque client, récupère son canal actif
  const { data: canauxMap } = useQuery({
    queryKey: ["batch-canaux", open],
    enabled: open,
    queryFn: async () => {
      const { data } = await supabase.from("canaux_livraison").select("*").eq("actif", true);
      const m = new Map<string, string>();
      (data ?? []).forEach((c: any) => {
        if (!m.has(c.client_id)) m.set(c.client_id, c.id);
      });
      return m;
    },
  });

  const [selectedOrderLineId, setSelectedOrderLineId] = useState<string>("");

  // Trouve la ligne sélectionnée + son client + son canal
  const selectedLineInfo = (() => {
    if (!selectedOrderLineId || !clientsOptions) return null;
    for (const c of clientsOptions) {
      const line = c.lines.find((l: any) => l.id === selectedOrderLineId);
      if (line) {
        const canalId = canauxMap?.get(c.client_id);
        return { client: c, line, canalId };
      }
    }
    return null;
  })();

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Distribuer {leadIds.length} leads à un même courtier</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Choisis une ligne de commande active. Les {leadIds.length} leads sélectionnés seront tous envoyés à ce courtier
            (décrément du solde restant à chaque envoi).
          </p>
          {!clientsOptions ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : clientsOptions.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
              Aucun courtier avec une commande active disponible.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              {clientsOptions.map((c) => (
                <div key={c.client_id} className="border-b last:border-0">
                  <div className="px-3 py-2 bg-muted/50 text-xs font-semibold uppercase tracking-wider">
                    {c.company_name}
                    {!canauxMap?.get(c.client_id) && (
                      <span className="ml-2 text-destructive text-[10px] normal-case">⚠ Aucun canal configuré</span>
                    )}
                  </div>
                  {c.lines.map((l: any) => (
                    <label
                      key={l.id}
                      className={`flex items-center gap-3 px-3 py-2 hover:bg-blue-50 cursor-pointer ${
                        selectedOrderLineId === l.id ? "bg-blue-100" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="orderline"
                        checked={selectedOrderLineId === l.id}
                        onChange={() => setSelectedOrderLineId(l.id)}
                        disabled={!canauxMap?.get(c.client_id)}
                      />
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{l.product_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {l.order_number} · {l.subcategory ?? l.domain ?? "—"} · {l.solde_restant}/{l.quantity} restants
                        </div>
                      </div>
                      {l.solde_restant < leadIds.length && (
                        <Badge variant="destructive" className="text-[10px]">
                          Solde insuffisant ({l.solde_restant} dispo)
                        </Badge>
                      )}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button
            disabled={!selectedLineInfo || !selectedLineInfo.canalId || isPending}
            onClick={() => {
              if (selectedLineInfo && selectedLineInfo.canalId) {
                onConfirm(selectedLineInfo.line.id, selectedLineInfo.canalId);
              }
            }}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Distribuer les {leadIds.length} leads
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FilterControl({
  filter,
  value,
  onChange,
}: {
  filter: LeadFilter;
  value: string;
  onChange: (v: string) => void;
}) {
  if (filter.type === "select" && filter.options) {
    return (
      <div className="inline-flex items-center gap-1">
        <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? "" : v)}>
          <SelectTrigger className={`h-8 text-xs ${filter.width ?? "w-32"}`}>
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="text-muted-foreground">{filter.label} : tous</span>
            </SelectItem>
            {filter.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {value && value !== "all" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onChange("")}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            title="Effacer"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  // type text
  return (
    <Input
      placeholder={filter.placeholder ?? filter.label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-8 text-xs ${filter.width ?? "w-32"}`}
    />
  );
}

// Tri local côté front (les listes sont limitées à 200 → pas besoin de tri server-side)
function sortLeads(leads: any[], key: string, dir: "asc" | "desc", columns: LeadColumn[]) {
  const col = columns.find((c) => c.key === key);
  const sorted = [...leads].sort((a, b) => {
    const valA = col?.source === "json" ? a.donnees_produit?.[key] : a[key];
    const valB = col?.source === "json" ? b.donnees_produit?.[key] : b[key];

    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (typeof valA === "number" && typeof valB === "number") {
      return valA - valB;
    }
    return String(valA).localeCompare(String(valB), "fr");
  });
  return dir === "desc" ? sorted.reverse() : sorted;
}
