import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2, ShoppingBag, Send, Mail, Plus, Trash2, Loader2, Check, ChevronLeft, ChevronRight,
  FileSpreadsheet, Globe, Inbox, CheckCircle2, ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatMoney, toCHF, formatCHF, type Currency } from "@/admin/lib/format";
import {
  PRODUCT_CATEGORIES,
  DOMAIN_LABELS_FULL,
  OrderDomain,
  buildHierarchyLabel,
  getCategoryForDomain,
} from "@/admin/lib/productCategories";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────
type CanalType = "optimis_dashboard" | "google_sheets" | "lyta_api" | "crm_externe" | "email";

interface OrderLine {
  id: string;
  product_id: string | null;
  product_name: string;
  category: string;
  subcategory: OrderDomain | "";
  quantity: number;
  unit_price: number;
  currency: Currency;
  fx_rate_to_chf: number;
  comment: string;
}

const newLine = (): OrderLine => ({
  id: crypto.randomUUID(),
  product_id: null,
  product_name: "",
  category: "assurance_finances",
  subcategory: "",
  quantity: 50,
  unit_price: 0,
  currency: "CHF",
  fx_rate_to_chf: 1,
  comment: "",
});

const CANAL_TYPES: { value: CanalType; label: string; icon: any; description: string; color: string }[] = [
  { value: "optimis_dashboard", label: "Espace courtier Optimis", icon: Inbox, description: "Le courtier voit ses leads dans son espace Optimis dédié (recommandé)", color: "text-amber-700" },
  { value: "google_sheets", label: "Google Sheets", icon: FileSpreadsheet, description: "Append une ligne dans la Sheet du courtier via Zapier/Make", color: "text-green-700" },
  { value: "lyta_api", label: "LYTA API", icon: Send, description: "Push direct dans l'instance LYTA du tenant", color: "text-blue-700" },
  { value: "crm_externe", label: "CRM externe (webhook)", icon: Globe, description: "POST JSON vers l'URL du courtier (Hubspot, Pipedrive…)", color: "text-purple-700" },
  { value: "email", label: "Email", icon: Mail, description: "Envoi d'un email contenant les infos du lead", color: "text-slate-700" },
];

const STEPS = [
  { key: 1, label: "Cabinet", icon: Building2 },
  { key: 2, label: "Commande", icon: ShoppingBag },
  { key: 3, label: "Livraison", icon: Send },
  { key: 4, label: "Invitation", icon: Mail },
];

const emailLooksValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// ────────────────────────────────────────────────────────────────────────────
export default function AdminNewCabinet() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Étape 1 — Cabinet
  const [company_name, setCompanyName] = useState("");
  const [contact_name, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"actif" | "inactif">("actif");

  // Étape 2 — Commande
  const [includeOrder, setIncludeOrder] = useState(true);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<OrderLine[]>([newLine()]);

  // Étape 3 — Canal
  const [includeCanal, setIncludeCanal] = useState(true);
  const [canalType, setCanalType] = useState<CanalType>("optimis_dashboard");
  const [canalConfig, setCanalConfig] = useState<Record<string, string>>({});
  const [canalActif, setCanalActif] = useState(true);

  // Étape 4 — Invitation
  const [includeInvite, setIncludeInvite] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");

  // Résultat
  const [result, setResult] = useState<{ clientId: string; company: string; orderNumber: string | null; invited: boolean } | null>(null);

  // Catalogue produits (pour les lignes de commande)
  const { data: products } = useQuery({
    queryKey: ["wizard-products"],
    queryFn: async () =>
      (
        await supabase
          .from("admin_products")
          .select("id, name, domain, unit_price, currency, fx_rate_to_chf, is_active")
          .eq("is_active", true)
          .order("name")
      ).data ?? [],
  });

  // L'email d'invitation suit l'email cabinet tant que l'utilisateur n'y a pas touché
  const syncInviteEmail = (v: string) => {
    if (inviteEmail === "" || inviteEmail === email) setInviteEmail(v);
    setEmail(v);
  };

  const updateLine = (id: string, patch: Partial<OrderLine>) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const removeLine = (id: string) =>
    setLines((ls) => (ls.length === 1 ? ls : ls.filter((l) => l.id !== id)));

  const grandTotalCHF = lines.reduce((s, l) => s + toCHF(l.quantity * l.unit_price, l.currency, l.fx_rate_to_chf), 0);
  const totalLeads = lines.reduce((s, l) => s + (Number(l.quantity) || 0), 0);

  // ─── Validation par étape ───
  const canalConfigValid = useMemo(() => {
    if (!includeCanal) return true;
    switch (canalType) {
      case "optimis_dashboard": return true;
      case "google_sheets": return !!canalConfig.webhook_url?.trim();
      case "lyta_api": return !!canalConfig.endpoint?.trim() && !!canalConfig.tenant_id?.trim() && !!canalConfig.token?.trim();
      case "crm_externe": return !!canalConfig.endpoint?.trim();
      case "email": return emailLooksValid(canalConfig.email_to ?? "");
      default: return false;
    }
  }, [includeCanal, canalType, canalConfig]);

  const orderValid =
    !includeOrder ||
    (lines.length > 0 && lines.every((l) => l.subcategory && l.product_name.trim() && l.quantity > 0 && l.unit_price >= 0));

  const stepValid = (s: number) => {
    if (s === 1) return company_name.trim().length > 0;
    if (s === 2) return orderValid;
    if (s === 3) return canalConfigValid;
    if (s === 4) return !includeInvite || emailLooksValid(inviteEmail);
    return true;
  };

  const allValid = [1, 2, 3, 4].every(stepValid);

  // ─── Mutation : création en série ───
  const createMutation = useMutation({
    mutationFn: async () => {
      // 1. Cabinet (client)
      const { data: client, error: cErr } = await supabase
        .from("admin_clients")
        .insert({ company_name, contact_name, email, phone, address, status })
        .select()
        .single();
      if (cErr) throw new Error(`Création du cabinet : ${cErr.message}`);

      let orderNumber: string | null = null;

      // 2. Commande + lignes
      if (includeOrder && lines.length > 0) {
        const { data: order, error: oErr } = await supabase
          .from("admin_orders")
          .insert({ client_id: client.id, order_date: orderDate })
          .select()
          .single();
        if (oErr) throw new Error(`Cabinet créé, mais commande échouée : ${oErr.message}`);
        orderNumber = (order as any).order_number ?? null;

        const lineRows = lines.map((l, i) => ({
          order_id: order.id,
          position: i,
          product_id: l.product_id,
          product_name: l.product_name,
          category: l.category,
          subcategory: l.subcategory,
          domain: l.subcategory as any,
          quantity: l.quantity,
          unit_price: l.unit_price,
          currency: l.currency,
          fx_rate_to_chf: l.fx_rate_to_chf,
          comment: l.comment || null,
        }));
        const { error: lErr } = await (supabase.from("admin_order_lines" as any) as any).insert(lineRows);
        if (lErr) throw new Error(`Commande créée, mais lignes échouées : ${lErr.message}`);
      }

      // 3. Canal de livraison
      if (includeCanal) {
        const { error: caErr } = await supabase.from("canaux_livraison").insert({
          client_id: client.id,
          type: canalType,
          config: canalConfig,
          actif: canalActif,
        });
        if (caErr) throw new Error(`Cabinet créé, mais canal échoué : ${caErr.message}`);
      }

      // 4. Invitation partenaire
      let invited = false;
      if (includeInvite && emailLooksValid(inviteEmail)) {
        const { data, error: iErr } = await supabase.functions.invoke("invite-partner", {
          body: { client_id: client.id, email: inviteEmail.trim(), full_name: contact_name || company_name },
        });
        if (iErr) throw new Error(`Cabinet créé, mais invitation échouée : ${iErr.message}`);
        if ((data as any)?.error) throw new Error(`Invitation : ${(data as any).error}`);
        invited = true;
      }

      return { clientId: client.id, company: client.company_name, orderNumber, invited };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin-clients"] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-canaux"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setResult(res);
      toast({ title: "Cabinet créé", description: res.company });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  // ────────────────────────────────────────────────────────────────────────
  // Écran de succès
  // ────────────────────────────────────────────────────────────────────────
  if (result) {
    return (
      <AdminLayout title="Nouveau cabinet" subtitle="Onboarding terminé">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-[hsl(var(--optimis-green))]" />
            </div>
            <h2 className="text-2xl font-bold text-[hsl(var(--optimis-green))]">{result.company} est prêt</h2>
            <p className="text-sm text-muted-foreground mt-1">Tout a été créé en une fois.</p>

            <div className="mt-6 space-y-2 text-left">
              <RecapRow ok label="Cabinet créé" value={result.company} />
              <RecapRow ok={!!result.orderNumber} label="Première commande" value={result.orderNumber ?? "Non créée"} />
              <RecapRow ok={includeCanal} label="Canal de livraison" value={includeCanal ? (CANAL_TYPES.find((t) => t.value === canalType)?.label ?? canalType) : "Non configuré"} />
              <RecapRow ok={result.invited} label="Invitation courtier" value={result.invited ? inviteEmail : "Non envoyée"} />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/admin/clients")} variant="outline">
                Voir les clients
              </Button>
              {result.orderNumber && (
                <Button onClick={() => navigate("/admin/leads")} variant="outline">
                  <Inbox className="h-4 w-4" /> Distribuer des leads
                </Button>
              )}
              <Button onClick={() => window.location.reload()}>
                <Plus className="h-4 w-4" /> Créer un autre cabinet
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Wizard
  // ────────────────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="Nouveau cabinet" subtitle="Crée un courtier complet (cabinet, commande, livraison, invitation) en une fois">
      {/* Stepper */}
      <div className="mb-8 flex items-center justify-center">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.key;
          const active = step === s.key;
          return (
            <div key={s.key} className="flex items-center">
              <button
                type="button"
                onClick={() => { if (s.key < step || stepValid(step)) setStep(s.key); }}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    done
                      ? "bg-[hsl(var(--optimis-green))] border-[hsl(var(--optimis-green))] text-white"
                      : active
                      ? "border-[hsl(var(--optimis-green))] text-[hsl(var(--optimis-green))] bg-white"
                      : "border-border text-muted-foreground bg-white"
                  }`}
                >
                  {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs font-medium ${active ? "text-[hsl(var(--optimis-green))]" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-12 md:w-20 h-0.5 mx-2 mb-5 ${step > s.key ? "bg-[hsl(var(--optimis-green))]" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-6 md:p-8">
          {/* ─── Étape 1 : Cabinet ─── */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[hsl(var(--optimis-green))]">Informations du cabinet</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Nom de la société *</Label>
                  <Input value={company_name} onChange={(e) => setCompanyName(e.target.value)} placeholder="Cabinet Dupont Assurances" autoFocus />
                </div>
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <Input value={contact_name} onChange={(e) => setContactName(e.target.value)} placeholder="Jean Dupont" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => syncInviteEmail(e.target.value)} placeholder="contact@cabinet.ch" />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+41 ..." />
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="inactif">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Adresse</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rue ..., ville" />
                </div>
              </div>
            </div>
          )}

          {/* ─── Étape 2 : Commande ─── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[hsl(var(--optimis-green))]">Première commande</h2>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={includeOrder} onCheckedChange={setIncludeOrder} />
                  <span className="text-muted-foreground">{includeOrder ? "Activée" : "Ignorer"}</span>
                </label>
              </div>

              {!includeOrder ? (
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
                  Aucune commande ne sera créée. Tu pourras en ajouter plus tard depuis l'onglet Commandes.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date de commande *</Label>
                      <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Label className="text-sm font-semibold text-[hsl(var(--optimis-green))]">Lignes de commande</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => setLines((ls) => [...ls, newLine()])}>
                      <Plus className="h-4 w-4" /> Ajouter une ligne
                    </Button>
                  </div>

                  {lines.map((line, idx) => {
                    const lineTotal = line.quantity * line.unit_price;
                    const breadcrumb = buildHierarchyLabel({
                      category: line.category,
                      subcategory: line.subcategory || null,
                      productName: line.product_name || null,
                    });
                    return (
                      <div key={line.id} className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Ligne {idx + 1}</span>
                            {breadcrumb && <span className="text-xs text-[hsl(var(--optimis-green))] font-medium mt-0.5">{breadcrumb}</span>}
                          </div>
                          {lines.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(line.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Produit *</Label>
                          <Select
                            value={line.product_id ?? ""}
                            onValueChange={(productId) => {
                              const p = (products ?? []).find((x: any) => x.id === productId);
                              if (!p) return;
                              updateLine(line.id, {
                                product_id: p.id,
                                product_name: p.name,
                                subcategory: p.domain as OrderDomain,
                                category: getCategoryForDomain(p.domain),
                                unit_price: Number(p.unit_price) || 0,
                                currency: ((p.currency as Currency) ?? "CHF"),
                                fx_rate_to_chf: Number(p.fx_rate_to_chf) || 1,
                              });
                            }}
                          >
                            <SelectTrigger className="bg-white"><SelectValue placeholder="Choisir un produit du catalogue..." /></SelectTrigger>
                            <SelectContent>
                              {PRODUCT_CATEGORIES.map((cat) => {
                                const items = (products ?? []).filter((p: any) => cat.subDomains.some((s) => s.value === p.domain));
                                if (items.length === 0) return null;
                                return (
                                  <div key={cat.key}>
                                    <div className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground bg-muted/50">{cat.label}</div>
                                    {items.map((p: any) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        <span className="text-muted-foreground text-xs">{DOMAIN_LABELS_FULL[p.domain]} › </span>
                                        <span className="font-medium">{p.name}</span>
                                      </SelectItem>
                                    ))}
                                  </div>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Devise</Label>
                            <Select
                              value={line.currency}
                              onValueChange={(v) => updateLine(line.id, { currency: v as Currency, fx_rate_to_chf: v === "CHF" ? 1 : line.fx_rate_to_chf })}
                            >
                              <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CHF">🇨🇭 CHF</SelectItem>
                                <SelectItem value="CAD">🇨🇦 CAD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Quantité</Label>
                            <Input type="number" min={1} value={line.quantity}
                              onChange={(e) => updateLine(line.id, { quantity: parseInt(e.target.value) || 0 })} className="bg-white" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Prix unit.</Label>
                            <Input type="number" step="0.01" min={0} value={line.unit_price}
                              onChange={(e) => updateLine(line.id, { unit_price: parseFloat(e.target.value) || 0 })} className="bg-white" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Total {line.currency}</Label>
                            <div className="h-10 px-3 flex items-center justify-end rounded-md border border-border bg-white font-semibold text-[hsl(var(--optimis-green))]">
                              {formatMoney(lineTotal, line.currency)}
                            </div>
                          </div>
                        </div>

                        {line.currency === "CAD" && (
                          <div className="space-y-1.5 max-w-[12rem]">
                            <Label className="text-xs">Taux CAD → CHF (figé)</Label>
                            <Input type="number" step="0.0001" min={0} value={line.fx_rate_to_chf}
                              onChange={(e) => updateLine(line.id, { fx_rate_to_chf: parseFloat(e.target.value) || 0 })} className="bg-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="bg-[hsl(var(--optimis-green))]/5 border border-[hsl(var(--optimis-green))]/20 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-semibold">Total commande (équiv. CHF)</p>
                      <p className="text-xs text-muted-foreground">{totalLeads} leads · {lines.length} ligne{lines.length > 1 ? "s" : ""}</p>
                    </div>
                    <p className="text-2xl font-bold text-[hsl(var(--optimis-green))]">{formatCHF(grandTotalCHF)}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─── Étape 3 : Canal ─── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[hsl(var(--optimis-green))]">Canal de livraison</h2>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={includeCanal} onCheckedChange={setIncludeCanal} />
                  <span className="text-muted-foreground">{includeCanal ? "Activé" : "Ignorer"}</span>
                </label>
              </div>

              {!includeCanal ? (
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
                  Aucun canal configuré. Attention : sans canal actif, les leads distribués ne seront pas envoyés au courtier.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2">
                    {CANAL_TYPES.map((t) => {
                      const Icon = t.icon;
                      const active = canalType === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => { setCanalType(t.value); setCanalConfig({}); }}
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

                  {/* Config dynamique */}
                  <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                    {canalType === "optimis_dashboard" && (
                      <p className="text-xs text-muted-foreground">
                        Aucune configuration requise. Le courtier verra ses leads dans son espace Optimis — pense à l'inviter à l'étape suivante.
                      </p>
                    )}
                    {canalType === "google_sheets" && (
                      <div className="space-y-1">
                        <Label className="text-xs">URL du webhook Zapier (ou Make/N8n) *</Label>
                        <Input placeholder="https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/"
                          value={canalConfig.webhook_url ?? ""}
                          onChange={(e) => setCanalConfig({ ...canalConfig, webhook_url: e.target.value })} />
                      </div>
                    )}
                    {canalType === "lyta_api" && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Endpoint LYTA *</Label>
                          <Input placeholder="https://lyta.app/api/leads/external"
                            value={canalConfig.endpoint ?? ""}
                            onChange={(e) => setCanalConfig({ ...canalConfig, endpoint: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tenant ID LYTA *</Label>
                          <Input placeholder="uuid du cabinet locataire"
                            value={canalConfig.tenant_id ?? ""}
                            onChange={(e) => setCanalConfig({ ...canalConfig, tenant_id: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Token API *</Label>
                          <Input type="password" placeholder="Bearer token fourni par LYTA"
                            value={canalConfig.token ?? ""}
                            onChange={(e) => setCanalConfig({ ...canalConfig, token: e.target.value })} />
                        </div>
                      </>
                    )}
                    {canalType === "crm_externe" && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">URL du webhook *</Label>
                          <Input placeholder="https://hooks.pipedrive.com/abc123"
                            value={canalConfig.endpoint ?? ""}
                            onChange={(e) => setCanalConfig({ ...canalConfig, endpoint: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">En-tête d'authentification (optionnel)</Label>
                          <Input placeholder="ex: Bearer xxxxx"
                            value={canalConfig.auth_header ?? ""}
                            onChange={(e) => setCanalConfig({ ...canalConfig, auth_header: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Mapping des champs (JSON, optionnel)</Label>
                          <Textarea placeholder='{"lead.prenom": "person.first_name"}'
                            value={canalConfig.mapping ?? ""}
                            onChange={(e) => setCanalConfig({ ...canalConfig, mapping: e.target.value })}
                            rows={3} className="font-mono text-xs" />
                        </div>
                      </>
                    )}
                    {canalType === "email" && (
                      <div className="space-y-1">
                        <Label className="text-xs">Adresse email destinataire *</Label>
                        <Input type="email" placeholder="contact@cabinet.ch"
                          value={canalConfig.email_to ?? ""}
                          onChange={(e) => setCanalConfig({ ...canalConfig, email_to: e.target.value })} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Canal actif</Label>
                      <p className="text-xs text-muted-foreground">Si désactivé, les leads ne seront pas envoyés via ce canal</p>
                    </div>
                    <Switch checked={canalActif} onCheckedChange={setCanalActif} />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─── Étape 4 : Invitation + récap ─── */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[hsl(var(--optimis-green))]">Invitation du courtier</h2>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={includeInvite} onCheckedChange={setIncludeInvite} />
                  <span className="text-muted-foreground">{includeInvite ? "Envoyer" : "Plus tard"}</span>
                </label>
              </div>

              {includeInvite ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Email du courtier *</Label>
                    <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="contact@cabinet.ch" />
                    {!emailLooksValid(inviteEmail) && inviteEmail.length > 0 && (
                      <p className="text-xs text-destructive">Email invalide</p>
                    )}
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
                    <p>📧 Un email d'invitation brandé Optimis sera envoyé avec :</p>
                    <ul className="list-disc list-inside ml-2">
                      <li>Lien sécurisé pour définir le mot de passe</li>
                      <li>Accès à l'espace courtier <code>/partner/login</code></li>
                      <li>Visibilité uniquement sur les leads de ce cabinet</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
                  Aucune invitation envoyée. Tu pourras inviter le courtier plus tard depuis l'onglet Clients.
                </p>
              )}

              {/* Récapitulatif */}
              <div className="border-t border-border pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Récapitulatif</h3>
                <div className="space-y-2">
                  <RecapRow ok label="Cabinet" value={company_name || "—"} />
                  <RecapRow
                    ok={includeOrder}
                    label="Commande"
                    value={includeOrder ? `${totalLeads} leads · ${formatCHF(grandTotalCHF)}` : "Ignorée"}
                  />
                  <RecapRow
                    ok={includeCanal}
                    label="Livraison"
                    value={includeCanal ? (CANAL_TYPES.find((t) => t.value === canalType)?.label ?? canalType) : "Ignorée"}
                  />
                  <RecapRow
                    ok={includeInvite && emailLooksValid(inviteEmail)}
                    label="Invitation"
                    value={includeInvite ? (emailLooksValid(inviteEmail) ? inviteEmail : "Email manquant") : "Plus tard"}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── Navigation ─── */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => (step === 1 ? navigate("/admin/clients") : setStep((s) => s - 1))}
              disabled={createMutation.isPending}
            >
              <ChevronLeft className="h-4 w-4" /> {step === 1 ? "Annuler" : "Précédent"}
            </Button>

            {step < 4 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!stepValid(step)}>
                Suivant <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => createMutation.mutate()} disabled={!allValid || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Créer le cabinet
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

// Ligne de récapitulatif réutilisable
function RecapRow({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-2.5">
      <div className="flex items-center gap-2">
        {ok ? (
          <CheckCircle2 className="h-4 w-4 text-[hsl(var(--optimis-green))]" />
        ) : (
          <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
        )}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm text-muted-foreground truncate max-w-[60%] text-right">{value}</span>
    </div>
  );
}
