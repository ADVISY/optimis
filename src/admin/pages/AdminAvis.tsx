import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Star, Check, X, Trash2, Loader2, MessageSquare, Undo2 } from "lucide-react";

type AvisStatut = "en_attente" | "approuve" | "refuse" | "all";

type AvisRow = {
  id: string;
  auteur: string;
  ville: string | null;
  note: number;
  commentaire: string;
  email: string | null;
  langue: string;
  source: string;
  statut: "en_attente" | "approuve" | "refuse";
  cree_le: string;
  modere_le: string | null;
};

const STATUT_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  en_attente: { label: "En attente", variant: "default" },
  approuve: { label: "Approuvé", variant: "secondary" },
  refuse: { label: "Refusé", variant: "destructive" },
};

export default function AdminAvis() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<AvisStatut>("en_attente");

  const { data: avis, isLoading } = useQuery({
    queryKey: ["admin-avis", filter],
    queryFn: async () => {
      let q = (supabase as any)
        .from("avis")
        .select("*")
        .order("cree_le", { ascending: false })
        .limit(300);
      if (filter !== "all") q = q.eq("statut", filter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as AvisRow[];
    },
    retry: false,
  });

  const { data: counts } = useQuery({
    queryKey: ["admin-avis-counts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("avis").select("statut");
      if (error) throw error;
      const result = { en_attente: 0, approuve: 0, refuse: 0, all: 0 };
      (data ?? []).forEach((row: any) => {
        result.all++;
        if (row.statut in result) (result as any)[row.statut]++;
      });
      return result;
    },
    refetchInterval: 30000,
  });

  const moderate = useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: "approuve" | "refuse" | "en_attente" }) => {
      const { error } = await (supabase as any)
        .from("avis")
        .update({ statut, modere_le: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-avis"] });
      qc.invalidateQueries({ queryKey: ["admin-avis-counts"] });
      qc.invalidateQueries({ queryKey: ["sidebar-avis-count"] });
      const label = vars.statut === "approuve" ? "approuvé" : vars.statut === "refuse" ? "refusé" : "remis en attente";
      toast({ title: `Avis ${label}`, description: vars.statut === "approuve" ? "Il s'affiche désormais sur le site." : undefined });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("avis").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-avis"] });
      qc.invalidateQueries({ queryKey: ["admin-avis-counts"] });
      qc.invalidateQueries({ queryKey: ["sidebar-avis-count"] });
      toast({ title: "Avis supprimé" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Chips de filtre par statut */}
        <div className="flex items-center gap-2 flex-wrap">
          <Chip label="En attente" count={counts?.en_attente ?? 0} active={filter === "en_attente"} onClick={() => setFilter("en_attente")} dot="bg-blue-500" />
          <Chip label="Approuvés" count={counts?.approuve ?? 0} active={filter === "approuve"} onClick={() => setFilter("approuve")} dot="bg-green-500" />
          <Chip label="Refusés" count={counts?.refuse ?? 0} active={filter === "refuse"} onClick={() => setFilter("refuse")} dot="bg-red-500" />
          <Chip label="Tous" count={counts?.all ?? 0} active={filter === "all"} onClick={() => setFilter("all")} dot="bg-slate-500" />
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : (avis?.length ?? 0) === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucun avis pour ce filtre.</p>
              <p className="text-xs mt-1 opacity-70">
                Les avis soumis depuis la page publique <span className="font-mono">/avis</span> apparaîtront ici pour validation.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {avis!.map((a) => (
              <Card key={a.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground truncate">{a.auteur}</span>
                        {a.ville && <span className="text-xs text-muted-foreground">· {a.ville}</span>}
                        <Badge variant="outline" className="text-[10px] uppercase">{a.langue}</Badge>
                      </div>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <Star
                            key={v}
                            className={`h-4 w-4 ${v <= a.note ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <Badge variant={STATUT_BADGE[a.statut]?.variant ?? "outline"} className="flex-shrink-0">
                      {STATUT_BADGE[a.statut]?.label ?? a.statut}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                    {a.commentaire}
                  </p>

                  <div className="text-xs text-muted-foreground">
                    {new Date(a.cree_le).toLocaleString("fr-CH")}
                    {a.email && <> · <span className="font-mono">{a.email}</span></>}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t">
                    {a.statut !== "approuve" && (
                      <Button
                        size="sm"
                        className="h-8 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => moderate.mutate({ id: a.id, statut: "approuve" })}
                        disabled={moderate.isPending}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Approuver
                      </Button>
                    )}
                    {a.statut !== "refuse" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => moderate.mutate({ id: a.id, statut: "refuse" })}
                        disabled={moderate.isPending}
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Refuser
                      </Button>
                    )}
                    {a.statut !== "en_attente" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-muted-foreground"
                        onClick={() => moderate.mutate({ id: a.id, statut: "en_attente" })}
                        disabled={moderate.isPending}
                        title="Remettre en attente"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <div className="flex-1" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                      onClick={() => {
                        if (confirm("Supprimer définitivement cet avis ?")) remove.mutate(a.id);
                      }}
                      disabled={remove.isPending}
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Chip({
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
