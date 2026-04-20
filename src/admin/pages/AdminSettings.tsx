import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompanySettings {
  id: string;
  company_name: string;
  address_line1: string;
  address_line2: string | null;
  postal_code: string;
  city: string;
  country: string;
  iban_qr: string;
  vat_number: string | null;
  default_vat_rate: number;
  contact_email: string | null;
  contact_phone: string | null;
  invoice_footer: string | null;
  payment_terms_days: number;
  logo_url: string | null;
}

export default function AdminSettings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<CompanySettings>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-company-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_company_settings")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as CompanySettings;
    },
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data?.id) throw new Error("Paramètres introuvables");
      const { error } = await supabase
        .from("admin_company_settings")
        .update({
          company_name: form.company_name,
          address_line1: form.address_line1,
          address_line2: form.address_line2 || null,
          postal_code: form.postal_code,
          city: form.city,
          country: form.country,
          iban_qr: (form.iban_qr || "").replace(/\s/g, ""),
          vat_number: form.vat_number || null,
          default_vat_rate: Number(form.default_vat_rate ?? 8.1),
          contact_email: form.contact_email || null,
          contact_phone: form.contact_phone || null,
          invoice_footer: form.invoice_footer || null,
          payment_terms_days: Number(form.payment_terms_days ?? 30),
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-company-settings"] });
      toast({ title: "Paramètres enregistrés" });
    },
    onError: (e: any) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const set = <K extends keyof CompanySettings>(key: K, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Validation IBAN QR (CH/LI + 19 chars + BC 30000-31999)
  const ibanClean = (form.iban_qr || "").replace(/\s/g, "").toUpperCase();
  const isQrIban = /^(CH|LI)\d{2}3[01]\d{3}[A-Z0-9]{12}$/.test(ibanClean);

  if (isLoading) {
    return (
      <AdminLayout title="Paramètres entreprise">
        <div className="p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Paramètres entreprise"
      subtitle="Coordonnées utilisées sur toutes les factures et la QR-bill suisse"
      actions={
        <Button onClick={() => save.mutate()} disabled={save.isPending} size="sm">
          {save.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Identité */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-bold text-[hsl(var(--optimis-green))]">
              Identité
            </h3>
            <div className="space-y-2">
              <Label>Raison sociale *</Label>
              <Input
                value={form.company_name ?? ""}
                onChange={(e) => set("company_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse *</Label>
              <Input
                value={form.address_line1 ?? ""}
                onChange={(e) => set("address_line1", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Complément d'adresse</Label>
              <Input
                value={form.address_line2 ?? ""}
                onChange={(e) => set("address_line2", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>NPA *</Label>
                <Input
                  value={form.postal_code ?? ""}
                  onChange={(e) => set("postal_code", e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Ville *</Label>
                <Input
                  value={form.city ?? ""}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pays</Label>
              <Input
                value={form.country ?? ""}
                onChange={(e) => set("country", e.target.value)}
                maxLength={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bancaire & TVA */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-bold text-[hsl(var(--optimis-green))]">
              Banque & TVA
            </h3>
            <div className="space-y-2">
              <Label>IBAN QR (CH... ou LI...) *</Label>
              <Input
                value={form.iban_qr ?? ""}
                onChange={(e) => set("iban_qr", e.target.value)}
                placeholder="CH4431999123000889012"
                className="font-mono"
              />
              {form.iban_qr && (
                <p
                  className={`text-xs ${
                    isQrIban ? "text-[hsl(var(--optimis-green))]" : "text-destructive"
                  }`}
                >
                  {isQrIban
                    ? "✓ IBAN QR valide"
                    : "⚠ Doit être un IBAN QR suisse (BC 30000-31999)"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>N° TVA (CHE-...)</Label>
              <Input
                value={form.vat_number ?? ""}
                onChange={(e) => set("vat_number", e.target.value)}
                placeholder="CHE-123.456.789"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Taux TVA par défaut (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.default_vat_rate ?? 8.1}
                  onChange={(e) =>
                    set("default_vat_rate", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Délai paiement (jours)</Label>
                <Input
                  type="number"
                  value={form.payment_terms_days ?? 30}
                  onChange={(e) =>
                    set("payment_terms_days", parseInt(e.target.value) || 30)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & footer */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-bold text-[hsl(var(--optimis-green))]">
              Contact & mentions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email contact</Label>
                <Input
                  type="email"
                  value={form.contact_email ?? ""}
                  onChange={(e) => set("contact_email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone contact</Label>
                <Input
                  value={form.contact_phone ?? ""}
                  onChange={(e) => set("contact_phone", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pied de facture</Label>
              <Textarea
                rows={2}
                value={form.invoice_footer ?? ""}
                onChange={(e) => set("invoice_footer", e.target.value)}
                placeholder="Merci pour votre confiance."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
