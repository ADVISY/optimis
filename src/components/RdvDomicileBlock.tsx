import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Home, CalendarClock, Clock, Check, CheckCircle2, User, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { getLastLeadContact, getLastLeadDetails, clearLastLeadContact } from "@/lib/leadTracking";
import { attachAddressAutocomplete } from "@/lib/googleMaps";

/**
 * Décalage UTC d'Europe/Zurich pour une date donnée (gère l'heure d'été/hiver).
 * Ex: "+02:00" en été (CEST), "+01:00" en hiver (CET). On l'accole au datetime
 * ISO envoyé à Google Agenda pour que l'heure choisie soit posée à l'identique,
 * quel que soit le réglage de fuseau côté Zapier.
 */
function zurichOffset(dateStr: string, timeStr: string): string {
  try {
    const provisional = new Date(`${dateStr}T${timeStr}:00Z`);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Zurich",
      timeZoneName: "longOffset",
    }).formatToParts(provisional);
    const off = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    const m = off.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
    if (m) {
      const sign = m[1];
      const hh = m[2].padStart(2, "0");
      const mm = (m[3] ?? "00").padStart(2, "0");
      return `${sign}${hh}:${mm}`;
    }
    return "+01:00";
  } catch {
    return "+01:00";
  }
}

/** Libellés produit lisibles (miroir de submit-lead) pour la description RDV. */
const PRODUIT_LABELS: Record<string, string> = {
  "health-insurance": "Assurance santé",
  subsidy: "Subside assurance maladie",
  "pillar-3a": "3e pilier",
  "premier-achat": "Projet immobilier",
  "lpp-libre-passage": "Libre passage LPP",
  mortgage: "Hypothèque",
  "car-insurance": "Assurance véhicule",
  "household-insurance": "Assurance ménage",
  "legal-protection": "Protection juridique",
  "professional-insurance": "Assurance professionnelle",
  "estimation-immobiliere": "Estimation immobilière",
  termination: "Résiliation",
  "prenatal-insurance": "Assurance prénatale",
  "complementary-insurance": "Assurance complémentaire",
};

// Libellés à NE PAS répéter dans la section « Détails » de la description
// (identité déjà affichée à part, ou champs techniques/tracking sans intérêt).
const DETAIL_SKIP = new Set<string>([
  "Prénom", "Nom", "Téléphone", "Email", "Code postal", "Canton",
  "Type de formulaire", "Langue", "Source", "URL de la page", "Date et heure",
  "Type d'événement", "ID du lead", "Source publicitaire", "Landing URL",
  "Landing Referrer", "UTM Source", "UTM Medium", "UTM Campaign", "UTM Content",
  "UTM Term", "Google Click ID", "Facebook Click ID", "TikTok Click ID",
  "Microsoft Click ID", "Fiche PDF", "Appareil", "Système", "Navigateur",
  "formType", "language", "source", "timestamp", "leadId", "webhookUrl",
  "userAgent", "pageUrl",
]);

/**
 * Bloc « RDV physique à domicile » affiché sur la page merci.
 * Les coordonnées (prénom/nom/tél/email/NPA) sont auto-remplies depuis le lead
 * qui vient d'être soumis (snapshot sessionStorage) ; le prospect ne complète
 * que son adresse + la date + l'heure souhaitées (lieu = son domicile). À la
 * validation, on crée un NOUVEAU lead `rdv-domicile` (tracé au lead d'origine)
 * → submit-lead → Zap Google Agenda + Sheet, puis distribution manuelle.
 */
const RdvDomicileBlock = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const contact = useMemo(() => getLastLeadContact(), []);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState(contact?.postalCode ?? "");
  const [canton, setCanton] = useState(contact?.canton ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [done, setDone] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Autocomplétion Google (Suisse) sur le champ adresse → remplit rue + NPA +
  // ville + canton automatiquement. Si Maps ne charge pas, saisie manuelle.
  useEffect(() => {
    const el = addressInputRef.current;
    if (!el) return;
    let ac: unknown;
    attachAddressAutocomplete(el, (a) => {
      const rue = [a.route, a.streetNumber].filter(Boolean).join(" ").trim();
      setAddress(rue || a.formatted);
      if (a.postalCode) setPostalCode(a.postalCode);
      if (a.city) setCity(a.city);
      if (a.canton) setCanton(a.canton);
    })
      .then((instance) => {
        ac = instance;
      })
      .catch(() => {
        /* Maps indisponible → l'utilisateur saisit à la main */
      });
    return () => {
      const g = (window as unknown as { google?: any }).google;
      if (ac && g?.maps?.event) g.maps.event.clearInstanceListeners(ac);
    };
  }, []);

  // Pas de linkToLeadId : le RDV est un NOUVEAU lead distribuable (nouvel ID
  // RDV-DOMICILE-…). La traçabilité vers la demande initiale passe par le champ
  // « Lead d'origine » (leadOrigine) envoyé dans le payload.
  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "rdv-domicile",
  });

  // Sans lead fraîchement soumis, on n'affiche rien (visite directe de /merci).
  if (!contact?.leadId) return null;

  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");

  const handleSubmit = async () => {
    if (!address.trim() || !city.trim()) {
      toast({ description: t("rdvDomicile.missingAddress"), variant: "destructive" });
      return;
    }
    if (!date) {
      toast({ description: t("rdvDomicile.missingDate"), variant: "destructive" });
      return;
    }
    if (!time) {
      toast({ description: t("rdvDomicile.missingTime"), variant: "destructive" });
      return;
    }

    // Heure exacte choisie → datetime ISO 8601 AVEC offset Europe/Zurich (gère
    // été/hiver) pour que Google Agenda pose l'heure EXACTE. Fin = début + 1h.
    const [h, m] = time.split(":").map(Number);
    const endH = Math.min(h + 1, 23);
    const endTime = `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const tz = zurichOffset(date, time);
    // Adresse complète + « Suisse » → géocodage fiable par Google Maps quand le
    // conseiller clique sur le lieu de l'événement agenda.
    const lieu = [address.trim(), `${postalCode} ${city.trim()}`.trim(), "Suisse"]
      .filter(Boolean)
      .join(", ");
    const dateFr = date.split("-").reverse().join("/");
    const produitLabel = PRODUIT_LABELS[contact.formType ?? ""] ?? (contact.formType ?? "—");

    // Description complète et propre pour l'événement agenda : en-tête RDV +
    // coordonnées + TOUTES les infos fournies par le prospect + réf lead.
    const details = getLastLeadDetails() ?? {};
    const detailLines = Object.entries(details)
      .filter(([k, v]) => !DETAIL_SKIP.has(k) && v != null && v !== "" && typeof v !== "object")
      .map(([k, v]) => `${k} : ${v}`);

    const descriptionLines = [
      "RENDEZ-VOUS À DOMICILE",
      "",
      `Date : ${dateFr} à ${time}`,
      `Lieu : ${lieu}`,
      `Produit : ${produitLabel}`,
      "",
      "COORDONNÉES",
      `Prénom : ${contact.firstName ?? "—"}`,
      `Nom : ${contact.lastName ?? "—"}`,
      `Téléphone : ${contact.phone ?? "—"}`,
      `Email : ${contact.email ?? "—"}`,
      `Code postal : ${postalCode || "—"}`,
      `Canton : ${contact.canton ?? "—"}`,
    ];
    if (detailLines.length) {
      descriptionLines.push("", "DÉTAILS DE LA DEMANDE", ...detailLines);
    }
    descriptionLines.push("", `Réf. lead d'origine : ${contact.leadId ?? "—"}`);
    const description = descriptionLines.join("\n");

    const titre = `RDV domicile — ${fullName || "Prospect"} · ${produitLabel}`;

    const res = await submitLead({
      firstName: contact.firstName ?? "",
      lastName: contact.lastName ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      canton,
      postalCode,
      address: address.trim(),
      city: city.trim(),
      rdvDate: date, // ISO "YYYY-MM-DD"
      rdvTime: time, // "HH:MM" heure choisie par le prospect
      rdvLieu: lieu, // adresse complète → Location de l'événement agenda
      rdvStart: `${date}T${time}:00${tz}`, // ISO+offset → Start événement agenda
      rdvEnd: `${date}T${endTime}:00${tz}`, // ISO+offset → End événement agenda
      rdvTitre: titre, // → Summary de l'événement agenda
      rdvDescription: description, // → Description complète (tout, propre)
      produitOrigine: produitLabel,
      leadOrigine: contact.leadId ?? "",
    });

    if (res) {
      setDone(true);
      clearLastLeadContact();
    }
  };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card className="border-green-200 bg-green-50/60">
          <CardContent className="py-10 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{t("rdvDomicile.successTitle")}</h3>
            <p className="text-muted-foreground">{t("rdvDomicile.successMessage")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 text-left">
      <Card className="border-primary/30 shadow-lg overflow-hidden">
        <CardHeader className="bg-primary/5 border-b">
          <Badge className="w-fit mb-2" variant="secondary">
            {t("rdvDomicile.badge")}
          </Badge>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 shrink-0">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold leading-tight">{t("rdvDomicile.title")}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{t("rdvDomicile.subtitle")}</p>
              <ul className="mt-3 space-y-1.5">
                {[1, 2, 3].map((n) => (
                  <li key={n} className="flex items-center gap-2 text-sm font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {t(`rdvDomicile.benefit${n}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Récap auto-rempli (lecture seule) */}
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {t("rdvDomicile.recap")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
              {fullName && (
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary shrink-0" /> {fullName}
                </span>
              )}
              {contact.phone && (
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary shrink-0" /> {contact.phone}
                </span>
              )}
              {contact.email && (
                <span className="flex items-center gap-2 truncate">
                  <Mail className="h-4 w-4 text-primary shrink-0" /> {contact.email}
                </span>
              )}
              {(postalCode || canton) && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  {[postalCode, canton].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>
          </div>

          {/* Champs à compléter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="rdv-address">{t("rdvDomicile.addressLabel")}</Label>
              <Input
                id="rdv-address"
                ref={addressInputRef}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("rdvDomicile.addressPlaceholder")}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rdv-postal">{t("rdvDomicile.postalCodeLabel")}</Label>
              <Input
                id="rdv-postal"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                inputMode="numeric"
                autoComplete="postal-code"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rdv-city">{t("rdvDomicile.cityLabel")}</Label>
            <Input
              id="rdv-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t("rdvDomicile.cityPlaceholder")}
              autoComplete="address-level2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rdv-date" className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" /> {t("rdvDomicile.dateLabel")}
              </Label>
              <Input
                id="rdv-date"
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rdv-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> {t("rdvDomicile.timeLabel")}
              </Label>
              <Input
                id="rdv-time"
                type="time"
                step={1800}
                min="08:00"
                max="20:00"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <Button
            size="lg"
            className="w-full text-base"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? t("rdvDomicile.submitting") : t("rdvDomicile.submit")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RdvDomicileBlock;
