import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DOMAIN_LABELS_FULL, OrderDomain } from "@/admin/lib/productCategories";
import { getProductIcon } from "@/admin/lib/productIcons";

export interface ProductRow {
  id: string;
  name: string;
  domain: OrderDomain;
  unit_price: number;
  avg_cpl: number;
  image_url: string | null;
  is_active: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  product: ProductRow | null;
}

const DOMAIN_OPTIONS: OrderDomain[] = [
  "assurance_maladie",
  "lpp",
  "hypotheque",
  "assurance_non_vie",
  "assurance_vie",
  "telecom",
  "immobilier",
  "energie",
  "autre",
];

export default function ProductFormModal({ open, onOpenChange, product }: Props) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [domain, setDomain] = useState<OrderDomain>("assurance_maladie");
  const [unitPrice, setUnitPrice] = useState<string>("0");
  const [avgCpl, setAvgCpl] = useState<string>("0");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(product?.name ?? "");
      setDomain((product?.domain as OrderDomain) ?? "assurance_maladie");
      setUnitPrice(String(product?.unit_price ?? 0));
      setAvgCpl(String(product?.avg_cpl ?? 0));
      setImageUrl(product?.image_url ?? null);
      setIsActive(product?.is_active ?? true);
    }
  }, [open, product]);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Format invalide", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Fichier trop lourd (max 2 Mo)", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      setImageUrl(pub.publicUrl);
    } catch (e: any) {
      toast({ title: "Erreur upload", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Le nom est obligatoire");
      const payload = {
        name: name.trim(),
        domain,
        unit_price: parseFloat(unitPrice) || 0,
        avg_cpl: parseFloat(avgCpl) || 0,
        image_url: imageUrl,
        is_active: isActive,
      };
      if (product?.id) {
        const { error } = await supabase
          .from("admin_products")
          .update(payload)
          .eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("admin_products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: product ? "Produit modifié" : "Produit créé" });
      onOpenChange(false);
    },
    onError: (e: any) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="space-y-2">
            <Label>Image / icône</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {imageUrl ? "Remplacer" : "Téléverser"}
                </Button>
                {imageUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setImageUrl(null)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Retirer
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nom du produit *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Lead Assurance Maladie"
            />
          </div>

          <div className="space-y-2">
            <Label>Domaine *</Label>
            <Select value={domain} onValueChange={(v) => setDomain(v as OrderDomain)}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOMAIN_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {DOMAIN_LABELS_FULL[d] ?? d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Prix de vente (CHF) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>CPL moyen (CHF)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={avgCpl}
                onChange={(e) => setAvgCpl(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <Label className="cursor-pointer">Produit actif</Label>
              <p className="text-xs text-muted-foreground">
                Visible et utilisable dans les commandes et factures
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
