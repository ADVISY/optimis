import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Home, Clock, MapPin, Check, CheckCircle2, User, Phone, Mail,
  ChevronLeft, ChevronRight, CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { getLastLeadContact, getLastLeadDetails, clearLastLeadContact } from "@/lib/leadTracking";
import { attachAddressAutocomplete } from "@/lib/googleMaps";

const pad = (n: number) => String(n).padStart(2, "0");
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function zurichOffset(dateStr: string, timeStr: string): string {
  try {
    const provisional = new Date(`${dateStr}T${timeStr}:00Z`);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Zurich",
      timeZoneName: "longOffset",
    }).formatToParts(provisional);
    const off = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    const m = off.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
    if (m) return `${m[1]}${m[2].padStart(2, "0")}:${(m[3] ?? "00").padStart(2, "0")}`;
    return "+01:00";
  } catch {
    return "+01:00";
  }
}

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

const TIME_SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let h = 8; h <= 19; h++) {
    out.push(`${pad(h)}:00`);
    if (h < 19) out.push(`${pad(h)}:30`);
  }
  return out;
})();

/**
 * Tunnel « RDV à domicile » style Calendly : panneau info à gauche, calendrier
 * mensuel + créneaux à droite, puis mini-formulaire d'adresse à la confirmation.
 * Coordonnées auto-remplies depuis le lead ; adresse en autocomplétion Google.
 */
const RdvDomicileBlock = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const contact = useMemo(() => getLastLeadContact(), []);

  const hasLead = !!contact?.leadId;
  const [firstName, setFirstName] = useState(contact?.firstName ?? "");
  const [lastName, setLastName] = useState(contact?.lastName ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [subject, setSubject] = useState(
    contact?.formType ? (PRODUIT_LABELS[contact.formType] ?? "") : "",
  );
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState(contact?.postalCode ?? "");
  const [canton, setCanton] = useState(contact?.canton ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [done, setDone] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const acAttached = useRef(false);
  const { submitLead, isSubmitting } = useLeadSubmission({ formType: "rdv-domicile" });

  // --- Calendrier ---
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const monthLabel = viewMonth.toLocaleDateString("fr-CH", { month: "long", year: "numeric" });
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const canPrev = new Date(year, month, 1) > new Date(todayMid.getFullYear(), todayMid.getMonth(), 1);

  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const produitLabel = subject.trim() || "Prise de rendez-vous";
  const dateFrLong = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("fr-CH", {
        weekday: "long", day: "numeric", month: "long",
      })
    : "";

  // Callback ref : attache l'autocomplete Google quand l'input adresse apparaît
  // (rendu conditionnellement après le choix du créneau).
  const addressRef = (el: HTMLInputElement | null) => {
    if (el) {
      if (!acAttached.current) {
        acAttached.current = true;
        attachAddressAutocomplete(el, (a) => {
          const rue = [a.route, a.streetNumber].filter(Boolean).join(" ").trim();
          setAddress(rue || a.formatted);
          if (a.postalCode) setPostalCode(a.postalCode);
          if (a.city) setCity(a.city);
          if (a.canton) setCanton(a.canton);
        }).catch(() => {});
      }
    } else {
      acAttached.current = false;
    }
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !phone.trim() || !email.trim()) {
      toast({ description: t("rdvDomicile.missingContact", "Merci d'indiquer vos nom, téléphone et email."), variant: "destructive" });
      return;
    }
    if (!subject.trim()) {
      toast({ description: t("rdvDomicile.missingSubject", "Merci d'indiquer l'objet de votre demande."), variant: "destructive" });
      return;
    }
    if (!address.trim() || !city.trim()) {
      toast({ description: t("rdvDomicile.missingAddress"), variant: "destructive" });
      return;
    }
    const [h, m] = time.split(":").map(Number);
    const endH = Math.min(h + 1, 23);
    const endTime = `${pad(endH)}:${pad(m)}`;
    const tz = zurichOffset(date, time);
    const lieu = [address.trim(), `${postalCode} ${city.trim()}`.trim(), "Suisse"].filter(Boolean).join(", ");
    const dateFr = date.split("-").reverse().join("/");

    const details = getLastLeadDetails() ?? {};
    const detailLines = Object.entries(details)
      .filter(([k, v]) => !DETAIL_SKIP.has(k) && v != null && v !== "" && typeof v !== "object")
      .map(([k, v]) => `${k} : ${v}`);

    const descriptionLines = [
      "RENDEZ-VOUS À DOMICILE", "",
      `Date : ${dateFr} à ${time}`,
      `Lieu : ${lieu}`,
      `Objet : ${produitLabel}`, "",
      "COORDONNÉES",
      `Prénom : ${firstName || "-"}`,
      `Nom : ${lastName || "-"}`,
      `Téléphone : ${phone || "-"}`,
      `Email : ${email || "-"}`,
      `Code postal : ${postalCode || "-"}`,
      `Canton : ${canton || "-"}`,
    ];
    if (detailLines.length) descriptionLines.push("", "DÉTAILS DE LA DEMANDE", ...detailLines);
    descriptionLines.push("", `Réf. lead d'origine : ${contact?.leadId ?? "-"}`);

    const res = await submitLead({
      firstName: firstName.trim(), lastName: lastName.trim(),
      email: email.trim(), phone: phone.trim(),
      canton, postalCode, address: address.trim(), city: city.trim(),
      rdvDate: date, rdvTime: time, rdvLieu: lieu,
      rdvStart: `${date}T${time}:00${tz}`, rdvEnd: `${date}T${endTime}:00${tz}`,
      rdvTitre: `RDV domicile · ${fullName || "Prospect"} · ${produitLabel}`,
      rdvDescription: descriptionLines.join("\n"),
      produitOrigine: produitLabel, leadOrigine: contact?.leadId ?? "",
    });
    if (res) {
      setDone(true);
      clearLastLeadContact();
    }
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="border-green-200 bg-green-50/60 p-10 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t("rdvDomicile.successTitle")}</h2>
          <p className="text-muted-foreground">{t("rdvDomicile.successMessage")}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-left">
      <Card className="overflow-hidden shadow-xl border-primary/15">
        <div className="grid md:grid-cols-[0.85fr_1.15fr]">
          {/* ---- Panneau info (gauche) ---- */}
          <div className="bg-muted/30 p-6 md:border-r border-b md:border-b-0">
            <div className="rounded-full bg-primary/15 p-2.5 w-fit mb-3">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="secondary" className="mb-2">{t("rdvDomicile.badge")}</Badge>
            <h1 className="text-xl font-bold leading-tight">{t("rdvDomicile.title")}</h1>

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {t("rdvDomicile.duration", "Environ 1 heure")}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {t("rdvDomicile.atHome", "À votre domicile")}</p>
            </div>

            <ul className="mt-4 space-y-1.5">
              {[1, 2, 3].map((n) => (
                <li key={n} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {t(`rdvDomicile.benefit${n}`)}
                </li>
              ))}
            </ul>

            {hasLead && (
              <div className="mt-5 pt-4 border-t space-y-1.5 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("rdvDomicile.recap")}</p>
                {fullName && <p className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> {fullName}</p>}
                {phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {phone}</p>}
                {email && <p className="flex items-center gap-2 truncate"><Mail className="h-4 w-4 text-primary" /> {email}</p>}
              </div>
            )}
          </div>

          {/* ---- Planificateur (droite) ---- */}
          <div className="p-6">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <CalendarDays className="h-4 w-4 text-primary" />
              {t("rdvDomicile.pickTitle", "Choisissez une date & une heure")}
            </h2>

            {/* Calendrier */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => setViewMonth(new Date(year, month - 1, 1))}
                className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Mois précédent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-medium capitalize">{monthLabel}</span>
              <button
                type="button"
                onClick={() => setViewMonth(new Date(year, month + 1, 1))}
                className="p-1.5 rounded-md hover:bg-muted"
                aria-label="Mois suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
              {WEEKDAYS.map((d, i) => <span key={i} className="py-1">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstWeekday }).map((_, i) => <span key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const cellDate = new Date(year, month, day);
                const iso = `${year}-${pad(month + 1)}-${pad(day)}`;
                const past = cellDate < todayMid;
                const selected = date === iso;
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={past}
                    onClick={() => { setDate(iso); setTime(""); }}
                    className={[
                      "h-9 w-full rounded-full text-sm transition-colors",
                      past ? "text-muted-foreground/30 cursor-not-allowed" : "hover:bg-primary/10 font-medium",
                      selected ? "bg-primary text-primary-foreground hover:bg-primary" : "",
                    ].join(" ")}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Créneaux */}
            {date && (
              <div className="mt-5">
                <p className="text-sm font-medium mb-2 capitalize">{dateFrLong}</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
                  {TIME_SLOTS.map((slot) => (
                    <Button
                      key={slot}
                      type="button"
                      size="sm"
                      variant={time === slot ? "default" : "outline"}
                      onClick={() => setTime(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmation : adresse + valider */}
            {date && time && (
              <div className="mt-6 pt-5 border-t space-y-4">
                <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-sm flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                  <span className="capitalize">{dateFrLong}</span> · <b>{time}</b>
                </div>

                {!hasLead && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="rdv-fn">{t("rdvDomicile.firstNameLabel", "Prénom")}</Label>
                        <Input id="rdv-fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="off" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="rdv-ln">{t("rdvDomicile.lastNameLabel", "Nom")}</Label>
                        <Input id="rdv-ln" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="off" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="rdv-phone">{t("rdvDomicile.phoneLabel", "Téléphone")}</Label>
                        <Input id="rdv-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07x xxx xx xx" autoComplete="off" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="rdv-email">{t("rdvDomicile.emailLabel", "Email")}</Label>
                        <Input id="rdv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rdv-subject">{t("rdvDomicile.subjectLabel", "Objet de la demande")}</Label>
                      <Input id="rdv-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("rdvDomicile.subjectPlaceholder", "Ex. Assurance maladie, hypothèque…")} autoComplete="off" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="rdv-address">{t("rdvDomicile.addressLabel")}</Label>
                    <Input id="rdv-address" ref={addressRef} value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t("rdvDomicile.addressPlaceholder")} autoComplete="off" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rdv-postal">{t("rdvDomicile.postalCodeLabel")}</Label>
                    <Input id="rdv-postal" value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)} inputMode="numeric" autoComplete="off" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rdv-city">{t("rdvDomicile.cityLabel")}</Label>
                  <Input id="rdv-city" value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t("rdvDomicile.cityPlaceholder")} autoComplete="off" />
                </div>

                <Button size="lg" className="w-full h-12 text-base" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? t("rdvDomicile.submitting") : t("rdvDomicile.submit")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RdvDomicileBlock;
