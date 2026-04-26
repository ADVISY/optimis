import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2, Package, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCHF, formatMoney, toCHF, type Currency } from "@/admin/lib/format";
import { DOMAIN_LABELS_FULL } from "@/admin/lib/productCategories";
import { getProductIcon } from "@/admin/lib/productIcons";
import ProductFormModal, { ProductRow } from "@/admin/components/ProductFormModal";

export default function AdminProducts() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [toDelete, setToDelete] = useState<ProductRow | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProductRow[];
    },
  });

  const stats = useMemo(() => {
    const list = products ?? [];
    const active = list.filter((p) => p.is_active);
    // Tous les calculs globaux convertis en CHF
    const avgPrice =
      active.length > 0
        ? active.reduce(
            (s, p) =>
              s + toCHF(Number(p.unit_price), (p.currency as Currency) ?? "CHF", Number(p.fx_rate_to_chf) || 1),
            0
          ) / active.length
        : 0;
    const avgCpl =
      active.length > 0
        ? active.reduce(
            (s, p) =>
              s + toCHF(Number(p.avg_cpl), (p.currency as Currency) ?? "CHF", Number(p.fx_rate_to_chf) || 1),
            0
          ) / active.length
        : 0;
    const avgMargin = avgPrice - avgCpl;
    return { count: active.length, avgPrice, avgCpl, avgMargin };
  }, [products]);

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Produit supprimé" });
      setToDelete(null);
    },
    onError: (e: any) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async (p: ProductRow) => {
      const { error } = await supabase
        .from("admin_products")
        .update({ is_active: !p.is_active })
        .eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  return (
    <AdminLayout
      title="Produits"
      subtitle="Catalogue des types de leads que vous vendez"
      actions={
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nouveau produit
        </Button>
      }
    >
      {/* Stats globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-0">
          <CardContent className="p-5">
            <Package className="h-5 w-5 text-[hsl(var(--optimis-green))] mb-3" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Produits actifs
            </p>
            <p className="text-2xl font-bold text-[hsl(var(--optimis-green))] mt-1">
              {stats.count}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-0">
          <CardContent className="p-5">
            <TrendingUp className="h-5 w-5 text-[hsl(var(--optimis-green))] mb-3" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Prix moyen
            </p>
            <p className="text-2xl font-bold text-[hsl(var(--optimis-green))] mt-1">
              {formatCHF(stats.avgPrice)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-0">
          <CardContent className="p-5">
            <TrendingUp className="h-5 w-5 text-[hsl(var(--optimis-green))] mb-3" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              CPL moyen
            </p>
            <p className="text-2xl font-bold text-[hsl(var(--optimis-green))] mt-1">
              {formatCHF(stats.avgCpl)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-0">
          <CardContent className="p-5">
            <TrendingUp className="h-5 w-5 text-[hsl(var(--optimis-green))] mb-3" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Marge moyenne
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${
                stats.avgMargin >= 0 ? "text-[hsl(var(--optimis-green))]" : "text-destructive"
              }`}
            >
              {formatCHF(stats.avgMargin)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cartes produits */}
      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      ) : (products?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold mb-1">Aucun produit pour le moment</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre premier type de lead pour commencer à suivre vos ventes.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Créer un produit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products!.map((p) => {
            const cur: Currency = (p.currency as Currency) ?? "CHF";
            const fx = Number(p.fx_rate_to_chf) || 1;
            const margin = Number(p.unit_price) - Number(p.avg_cpl);
            const marginPct =
              Number(p.unit_price) > 0 ? (margin / Number(p.unit_price)) * 100 : 0;
            const priceCHF = toCHF(Number(p.unit_price), cur, fx);
            const cplCHF = toCHF(Number(p.avg_cpl), cur, fx);
            const marginCHF = priceCHF - cplCHF;
            return (
              <Card
                key={p.id}
                className={`overflow-hidden transition-all hover:shadow-lg ${
                  !p.is_active ? "opacity-60" : ""
                }`}
              >
                {/* Image bandeau — icône glass 3D par défaut, image custom si uploadée */}
                <div className="h-36 bg-gradient-to-br from-[hsl(var(--optimis-green))]/10 to-[hsl(var(--optimis-green))]/5 flex items-center justify-center overflow-hidden p-3 relative">
                  <img
                    src={getProductIcon(p.domain, p.image_url)}
                    alt={p.name}
                    loading="lazy"
                    className={
                      p.image_url
                        ? "h-full w-full object-cover"
                        : "h-full w-auto object-contain drop-shadow-lg"
                    }
                  />
                  {cur === "CAD" && (
                    <Badge className="absolute top-2 right-2 bg-white/90 text-[hsl(var(--optimis-green))] hover:bg-white">
                      🇨🇦 CAD
                    </Badge>
                  )}
                </div>

                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base text-[hsl(var(--optimis-green))] truncate">
                        {p.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {DOMAIN_LABELS_FULL[p.domain] ?? p.domain}
                      </p>
                    </div>
                    <Badge
                      variant={p.is_active ? "default" : "outline"}
                      className="cursor-pointer flex-shrink-0"
                      onClick={() => toggleActive.mutate(p)}
                    >
                      {p.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-border">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                        Prix
                      </p>
                      <p className="text-sm font-bold text-[hsl(var(--optimis-green))]">
                        {formatMoney(Number(p.unit_price), cur)}
                      </p>
                      {cur === "CAD" && (
                        <p className="text-[10px] text-muted-foreground">≈ {formatCHF(priceCHF)}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                        CPL
                      </p>
                      <p className="text-sm font-bold text-orange-600">
                        {formatMoney(Number(p.avg_cpl), cur)}
                      </p>
                      {cur === "CAD" && (
                        <p className="text-[10px] text-muted-foreground">≈ {formatCHF(cplCHF)}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                        Marge
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          margin >= 0 ? "text-[hsl(var(--optimis-green))]" : "text-destructive"
                        }`}
                      >
                        {formatMoney(margin, cur)}
                        <span className="text-[10px] font-normal ml-1">
                          ({marginPct.toFixed(0)}%)
                        </span>
                      </p>
                      {cur === "CAD" && (
                        <p className="text-[10px] text-muted-foreground">≈ {formatCHF(marginCHF)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditing(p);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setToDelete(p)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProductFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={editing}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le produit "{toDelete?.name}" sera définitivement supprimé. Les commandes et
              factures existantes ne sont pas affectées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && remove.mutate(toDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
