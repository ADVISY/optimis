import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parsePhoneNumberFromString } from "npm:libphonenumber-js@1.13.1";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ----------------------------------------------------------------------------
// CONFIG webhooks Zapier (filet pendant la transition vers moteur BD)
// ----------------------------------------------------------------------------
const DEFAULT_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/21326682/un2n4oc/";

const FORM_WEBHOOKS: Record<string, string> = {
  "health-insurance": "https://hooks.zapier.com/hooks/catch/21326682/unuyrh7/",
  "car-insurance": "https://hooks.zapier.com/hooks/catch/21326682/un2n4oc/",
  "pillar-3a": "https://hooks.zapier.com/hooks/catch/21326682/unuyz9t/",
  "subsidy": "https://hooks.zapier.com/hooks/catch/21326682/unuyk5n/",
  "mortgage": "https://hooks.zapier.com/hooks/catch/21326682/un2n4oc/",
  "household-insurance": "https://hooks.zapier.com/hooks/catch/21326682/ujoz6jo/",
  "legal-protection": "https://hooks.zapier.com/hooks/catch/21326682/ujosv7s/",
  "termination": "https://hooks.zapier.com/hooks/catch/21326682/ujoz785/",
  "lpp-libre-passage": "https://hooks.zapier.com/hooks/catch/21326682/un855tt/",
  "professional-insurance": "https://hooks.zapier.com/hooks/catch/21326682/un8i19a/",
  "estimation-immobiliere": "https://hooks.zapier.com/hooks/catch/21326682/un8s2j4/",
  "partner": "https://hooks.zapier.com/hooks/catch/21326682/u79h7km/",
  "prenatal-insurance": "https://hooks.zapier.com/hooks/catch/21326682/4oeel8v/",
  "complementary-insurance": "https://hooks.zapier.com/hooks/catch/21326682/43vygp3/",
};

// Overrides de webhook par langue (clé : `${formType}:${lang}`) — repris de la prod
const FORM_WEBHOOKS_BY_LANG: Record<string, string> = {
  "car-insurance:de": "https://hooks.zapier.com/hooks/catch/21326682/4b9togp/",
};

// ----------------------------------------------------------------------------
// CONFIG mapping formType → domain produit (pour table leads.produit)
// ----------------------------------------------------------------------------
const FORM_TO_PRODUIT: Record<string, string> = {
  "health-insurance": "assurance_maladie",
  "car-insurance": "assurance_non_vie",
  "pillar-3a": "assurance_vie",
  "subsidy": "assurance_maladie",
  "mortgage": "hypotheque",
  "household-insurance": "assurance_non_vie",
  "legal-protection": "assurance_non_vie",
  "termination": "autre",
  "lpp-libre-passage": "lpp",
  "professional-insurance": "assurance_non_vie",
  "estimation-immobiliere": "autre",
  "partner": "autre",
  "prenatal-insurance": "assurance_maladie",
  "complementary-insurance": "assurance_maladie",
};

// ----------------------------------------------------------------------------
// VALIDATION TÉLÉPHONE (inchangé v1)
// ----------------------------------------------------------------------------
const SWISS_MOBILE_PREFIXES = new Set(["76", "77", "78", "79"]);
const digitsOnly = (value: string) => value.replace(/\D/g, "");

const groupDigits = (digits: string, groups: number[]) => {
  const parts: string[] = [];
  let cursor = 0;
  for (const groupSize of groups) {
    if (cursor >= digits.length) break;
    parts.push(digits.slice(cursor, cursor + groupSize));
    cursor += groupSize;
  }
  if (cursor < digits.length) parts.push(digits.slice(cursor));
  return parts.join(" ").trim();
};

const formatPhone = (value: string) => {
  const digits = digitsOnly(value);
  if (!digits) return "";
  if (digits.startsWith("41")) {
    const grouped = groupDigits(digits.slice(2, 11), [2, 3, 2, 2]);
    return grouped ? `+41 ${grouped}` : "+41";
  }
  if (digits.startsWith("33")) {
    const grouped = groupDigits(digits.slice(2, 11), [1, 2, 2, 2, 2]);
    return grouped ? `+33 ${grouped}` : "+33";
  }
  if (digits.startsWith("0")) {
    const nationalDigits = digits.slice(1);
    if (nationalDigits.startsWith("6")) return groupDigits(digits.slice(0, 10), [2, 2, 2, 2, 2]);
    if (nationalDigits.length >= 2 && SWISS_MOBILE_PREFIXES.has(nationalDigits.slice(0, 2))) return groupDigits(digits.slice(0, 10), [3, 3, 2, 2]);
    if (nationalDigits.startsWith("7")) return groupDigits(digits.slice(0, 10), [2, 2, 2, 2, 2]);
    return groupDigits(digits.slice(0, 10), [3, 3, 2, 2]);
  }
  return digits;
};

const getPhoneValidationResult = (phone: string) => {
  const digits = digitsOnly(phone);
  if (!digits) return { isValid: false, reason: "empty", missingDigits: 0, formatted: "" };
  if (digits.startsWith("41")) {
    const nationalDigits = digits.slice(2);
    if (digits.length < 11) return { isValid: false, reason: "too_short", missingDigits: 11 - digits.length, formatted: formatPhone(phone) };
    if (digits.length > 11) return { isValid: false, reason: "too_long", missingDigits: 0, formatted: formatPhone(phone) };
    if (!SWISS_MOBILE_PREFIXES.has(nationalDigits.slice(0, 2))) return { isValid: false, reason: "invalid_mobile_prefix", missingDigits: 0, formatted: formatPhone(phone) };
    return { isValid: true, reason: null, missingDigits: 0, formatted: formatPhone(phone) };
  }
  if (digits.startsWith("33")) {
    const nationalDigits = digits.slice(2);
    if (digits.length < 11) return { isValid: false, reason: "too_short", missingDigits: 11 - digits.length, formatted: formatPhone(phone) };
    if (digits.length > 11) return { isValid: false, reason: "too_long", missingDigits: 0, formatted: formatPhone(phone) };
    if (!["6", "7"].includes(nationalDigits.slice(0, 1))) return { isValid: false, reason: "invalid_mobile_prefix", missingDigits: 0, formatted: formatPhone(phone) };
    return { isValid: true, reason: null, missingDigits: 0, formatted: formatPhone(phone) };
  }
  if (digits.startsWith("0")) {
    const nationalDigits = digits.slice(1);
    const isSwissLocal = nationalDigits.length >= 2 && SWISS_MOBILE_PREFIXES.has(nationalDigits.slice(0, 2));
    const isFrenchLocal = nationalDigits.startsWith("6") || nationalDigits.startsWith("7");
    if (digits.length < 10) return { isValid: false, reason: "too_short", missingDigits: 10 - digits.length, formatted: formatPhone(phone) };
    if (digits.length > 10) return { isValid: false, reason: "too_long", missingDigits: 0, formatted: formatPhone(phone) };
    if (!isSwissLocal && !isFrenchLocal) return { isValid: false, reason: "invalid_mobile_prefix", missingDigits: 0, formatted: formatPhone(phone) };
    return { isValid: true, reason: null, missingDigits: 0, formatted: formatPhone(phone) };
  }
  return { isValid: false, reason: "invalid_prefix", missingDigits: 0, formatted: formatPhone(phone) };
};

const getLeadPhone = (leadData: Record<string, unknown>) => {
  if (typeof leadData["Téléphone"] === "string") return { key: "Téléphone", value: leadData["Téléphone"] };
  if (typeof leadData.phone === "string") return { key: "phone", value: leadData.phone };
  return null;
};

// ----------------------------------------------------------------------------
// EXTRACTION DES CHAMPS MÉTIER depuis payload Zapier multilingue
// ----------------------------------------------------------------------------
function getStr(data: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = data[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function getNum(data: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = data[k];
    if (typeof v === "number" && !isNaN(v)) return v;
    if (typeof v === "string" && v.trim() && !isNaN(Number(v))) return Number(v);
  }
  return undefined;
}

interface ExtractedLead {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  canton?: string;
  langue?: string;
  date_naissance?: string;
  age?: number;
  url_page?: string;
  source_trafic?: string;
}

function extractLeadFields(leadData: Record<string, unknown>): ExtractedLead {
  return {
    prenom: getStr(leadData, "Prénom", "PRÉNOM", "PRENOM", "prenom", "Vorname", "firstName"),
    nom: getStr(leadData, "Nom", "NOM", "nom", "Nachname", "lastName"),
    email: getStr(leadData, "Email", "EMAIL", "email", "E-Mail", "e-mail"),
    telephone: getStr(leadData, "Téléphone", "TELEPHONE", "telephone", "phone", "Telefon"),
    canton: getStr(leadData, "Canton", "CANTON", "canton", "Kanton"),
    langue: getStr(leadData, "Langue", "LANGUE", "langue", "Sprache", "language", "lang"),
    date_naissance: getStr(leadData, "Date de naissance", "Date naissance", "date_naissance", "Geburtsdatum", "birthdate"),
    age: getNum(leadData, "AGE", "Age", "age", "Alter"),
    url_page: getStr(leadData, "URL", "url", "URL de la page", "Page URL", "Seiten-URL"),
    source_trafic: getStr(leadData, "Source", "source", "Source du trafic", "Traffic Source"),
  };
}

// ----------------------------------------------------------------------------
// EMAIL DE CONFIRMATION AU PROSPECT (via Resend)
// ----------------------------------------------------------------------------
const PRODUIT_LABELS: Record<string, string> = {
  "health-insurance": "assurance santé",
  "subsidy": "subside d'assurance maladie",
  "pillar-3a": "3e pilier",
  "lpp-libre-passage": "libre passage LPP",
  "mortgage": "hypothèque",
  "car-insurance": "assurance véhicule",
  "household-insurance": "assurance ménage",
  "legal-protection": "protection juridique",
  "professional-insurance": "assurance professionnelle",
  "estimation-immobiliere": "estimation immobilière",
  "termination": "résiliation",
  "prenatal-insurance": "assurance prénatale",
  "complementary-insurance": "assurance complémentaire",
  "partner": "partenariat Optimis",
};

function buildProspectEmail(prenom: string, produitLabel: string): string {
  const greeting = prenom ? `Merci ${prenom}` : "Merci";
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<style>
  :root { color-scheme: light only; supported-color-schemes: light only; }
  /* Force mode clair sur Gmail dark mode (inversion automatique) */
  [data-ogsc] body, [data-ogsb] body { background-color: #F5F7FA !important; }
  [data-ogsc] .light-bg, [data-ogsb] .light-bg { background-color: #ffffff !important; }
  [data-ogsc] .light-text-dark, [data-ogsb] .light-text-dark { color: #0f172a !important; }
  [data-ogsc] .light-text-muted, [data-ogsb] .light-text-muted { color: #475569 !important; }
  [data-ogsc] .light-text-gray, [data-ogsb] .light-text-gray { color: #64748B !important; }
  [data-ogsc] .light-text-green, [data-ogsb] .light-text-green { color: #34664B !important; }
  [data-ogsc] .light-bg-card, [data-ogsb] .light-bg-card { background-color: #F8FAFC !important; }
  [data-ogsc] .light-bg-footer, [data-ogsb] .light-bg-footer { background-color: #F8FAFC !important; }
  @media (prefers-color-scheme: dark) {
    body, .light-bg, .light-bg-card, .light-bg-footer { background-color: #ffffff !important; }
    .light-text-dark { color: #0f172a !important; }
    .light-text-muted { color: #475569 !important; }
    .light-text-gray { color: #64748B !important; }
    .light-text-green { color: #34664B !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#F5F7FA !important; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color:#0f172a !important;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F5F7FA !important; padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="light-bg" style="max-width:600px; background-color:#ffffff !important; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(15,23,42,0.06);">
        <tr><td align="center" class="light-bg" style="padding:48px 40px 24px; background-color:#ffffff !important; border-bottom:1px solid #F1F5F9;">
          <img src="https://iuuefrxcmrcdbbuyzhqf.supabase.co/storage/v1/object/public/brand/logo-optimis.png" alt="Optimis" width="140" style="display:block; height:auto; max-width:140px;" />
        </td></tr>
        <tr><td class="light-bg" style="padding:40px 48px 40px; background-color:#ffffff !important;">
          <h1 class="light-text-green" style="margin:0 0 8px; font-size:32px; line-height:1.2; color:#34664B !important; font-weight:700; letter-spacing:-0.5px;">${greeting}.</h1>
          <p class="light-text-muted" style="margin:0 0 24px; font-size:17px; line-height:1.6; color:#475569 !important;">Votre demande de <strong class="light-text-dark" style="color:#0f172a !important;">${produitLabel}</strong> a bien été reçue.</p>
          <p class="light-text-muted" style="margin:0 0 36px; font-size:16px; line-height:1.6; color:#475569 !important;">Un conseiller vous contactera sous <strong class="light-text-dark" style="color:#0f172a !important;">24 heures</strong> pour vous présenter les meilleures offres adaptées à votre situation.</p>

          <div class="light-bg-card" style="background-color:#F8FAFC !important; border:1px solid #E2E8F0; border-radius:14px; padding:28px 28px 24px; margin-bottom:32px;">
            <h3 class="light-text-gray" style="margin:0 0 20px; font-size:12px; font-weight:700; color:#64748B !important; text-transform:uppercase; letter-spacing:1.2px;">Prochaines étapes</h3>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr><td style="padding:0 0 16px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
                <td valign="top" style="width:36px;"><div style="width:28px; height:28px; border-radius:50%; background-color:#ffffff !important; border:1.5px solid #34664B; color:#34664B !important; text-align:center; font-size:13px; line-height:25px; font-weight:700;">1</div></td>
                <td style="padding-left:14px; font-size:15px; line-height:1.5; color:#334155 !important;">Notre équipe analyse votre demande et compare les meilleures offres.</td>
              </tr></table></td></tr>
              <tr><td style="padding:0 0 16px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
                <td valign="top" style="width:36px;"><div style="width:28px; height:28px; border-radius:50%; background-color:#ffffff !important; border:1.5px solid #34664B; color:#34664B !important; text-align:center; font-size:13px; line-height:25px; font-weight:700;">2</div></td>
                <td style="padding-left:14px; font-size:15px; line-height:1.5; color:#334155 !important;">Un conseiller spécialisé vous appelle pour discuter de vos besoins.</td>
              </tr></table></td></tr>
              <tr><td><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
                <td valign="top" style="width:36px;"><div style="width:28px; height:28px; border-radius:50%; background-color:#34664B !important; color:#ffffff !important; text-align:center; font-size:13px; line-height:28px; font-weight:700;">3</div></td>
                <td style="padding-left:14px; font-size:15px; line-height:1.5; color:#334155 !important;">Vous recevez une proposition personnalisée et 100% gratuite.</td>
              </tr></table></td></tr>
            </table>
          </div>

          <p class="light-text-gray" style="margin:0; font-size:14px; line-height:1.5; color:#64748B !important; text-align:center;">À très bientôt,<br><strong class="light-text-green" style="color:#34664B !important; font-weight:600;">L'équipe Optimis</strong></p>
        </td></tr>
        <tr><td class="light-bg-footer" style="padding:24px 48px; background-color:#F8FAFC !important; border-top:1px solid #E2E8F0; text-align:center;">
          <p style="margin:0 0 6px; font-size:12px; color:#94A3B8 !important;">Optimislink Sàrl · Place de la Fontaine 9 · 1868 Collombey</p>
          <p style="margin:0; font-size:12px; color:#94A3B8 !important;">Question ? <a href="mailto:lesiteoptimis@gmail.com" style="color:#34664B !important; text-decoration:none; font-weight:600;">lesiteoptimis@gmail.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendProspectConfirmation(email: string, prenom: string, formType: string): Promise<{ ok: boolean; error?: string }> {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return { ok: false, error: "RESEND_API_KEY manquante" };
  if (!email) return { ok: false, error: "email vide" };

  const produitLabel = PRODUIT_LABELS[formType] ?? "demande";
  const html = buildProspectEmail(prenom, produitLabel);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Optimis <no-reply@le-comparateur-optimis.ch>",
        to: email,
        subject: `Votre demande de ${produitLabel} — Optimis`,
        html,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${errText.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  }
}

// ----------------------------------------------------------------------------
// SMS DE CONFIRMATION AU PROSPECT (via Twilio Messages API)
// ----------------------------------------------------------------------------
// NB: Twilio Verify (utilisé pour les OTP) n'envoie QUE des codes. Pour un SMS
// libre, on passe par l'API Messages, qui nécessite un expéditeur :
//   - TWILIO_MESSAGING_SERVICE_SID  (recommandé), OU
//   - TWILIO_SMS_FROM = "Optimis"   (Sender ID alphanumérique, OK en CH/FR), OU
//                       "+41..."     (numéro Twilio acheté)
// Si aucun n'est défini, le SMS est simplement sauté (l'email part quand même).
// ----------------------------------------------------------------------------
const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(COMBINING_MARKS, "");
}

function normalizeToE164(phone: string): string | null {
  const trimmed = phone.trim();
  let parsed = parsePhoneNumberFromString(trimmed);
  if (parsed?.isValid()) return parsed.number;
  for (const country of ["CH", "FR", "DE", "IT", "ES", "PT", "BE", "AT", "LU"] as const) {
    parsed = parsePhoneNumberFromString(trimmed, country);
    if (parsed?.isValid()) return parsed.number;
  }
  return null;
}

function buildProspectSms(prenom: string, produitLabel: string): string {
  const hi = prenom ? `Merci ${prenom},` : "Merci,";
  // SMS sans accents (GSM-7) pour rester sur des segments de 160 caracteres.
  return stripAccents(
    `Optimis: ${hi} votre demande de ${produitLabel} a bien ete recue. Un conseiller vous contactera sous 24h.`
  );
}

async function sendProspectSms(phone: string, prenom: string, formType: string): Promise<{ ok: boolean; error?: string }> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");
  const from = Deno.env.get("TWILIO_SMS_FROM");

  if (!accountSid || !authToken) return { ok: false, error: "TWILIO creds manquantes" };
  if (!messagingServiceSid && !from) return { ok: false, error: "TWILIO_MESSAGING_SERVICE_SID ou TWILIO_SMS_FROM manquant" };
  if (!phone) return { ok: false, error: "telephone vide" };

  const to = normalizeToE164(phone);
  if (!to) return { ok: false, error: `telephone invalide: ${phone}` };

  const produitLabel = PRODUIT_LABELS[formType] ?? "demande";
  const body = buildProspectSms(prenom, produitLabel);

  const params = new URLSearchParams({ To: to, Body: body });
  if (messagingServiceSid) params.set("MessagingServiceSid", messagingServiceSid);
  else params.set("From", from!);

  try {
    const basicAuth = btoa(`${accountSid}:${authToken}`);
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${basicAuth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { ok: false, error: `Twilio ${res.status}: ${errText.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  }
}

// Convertit "DD.MM.YYYY", "DD/MM/YYYY", "YYYY-MM-DD" en "YYYY-MM-DD" pour Postgres DATE
function normalizeDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim();
  // ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) return cleaned.slice(0, 10);
  // DD.MM.YYYY ou DD/MM/YYYY
  const m = cleaned.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return undefined;
}

// ----------------------------------------------------------------------------
// DÉTECTION APPAREIL + GÉNÉRATION PDF (repris de la prod Lovable)
// ----------------------------------------------------------------------------
function detectDevice(ua: string): { device: string; os: string; browser: string } {
  if (!ua) return { device: "Inconnu", os: "Inconnu", browser: "Inconnu" };
  const isMobile = /Mobi|Android|iPhone|iPod/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const device = isTablet ? "Tablette" : isMobile ? "Mobile" : "Ordinateur";
  let os = "Inconnu";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  let browser = "Inconnu";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  return { device, os, browser };
}

// Génère le PDF de la fiche lead — design premium Optimis
function generateLeadPdf(leadData: Record<string, unknown>, deviceInfo: { device: string; os: string; browser: string }): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 18;

  // Palette Optimis
  const EMERALD: [number, number, number] = [45, 90, 61];
  const EMERALD_DARK: [number, number, number] = [30, 60, 41];
  const GOLD: [number, number, number] = [201, 168, 76];
  const INK: [number, number, number] = [28, 32, 30];
  const MUTED: [number, number, number] = [110, 118, 114];
  const RULE: [number, number, number] = [225, 230, 227];
  const TINT: [number, number, number] = [246, 249, 247];

  const leadId = String(leadData["ID du lead"] ?? leadData.leadId ?? "");
  const formType = String(leadData["Type de formulaire"] ?? leadData.formType ?? "");

  // ====== EN-TÊTE (logo + bandeau) ======
  const headerH = 42;
  doc.setFillColor(...EMERALD);
  doc.rect(0, 0, pageW, headerH, "F");
  // bande or fine en bas du header
  doc.setFillColor(...GOLD);
  doc.rect(0, headerH, pageW, 1.2, "F");
  // accent décoratif (cercle estompé)
  doc.setFillColor(...EMERALD_DARK);
  doc.circle(pageW - 18, headerH / 2, 22, "F");

  // --- Logo Optimis (mark + wordmark vectoriels) ---
  // Mark : losange émeraude entouré d'un anneau or
  const markX = marginX + 7;
  const markY = headerH / 2;
  doc.setFillColor(...GOLD);
  doc.circle(markX, markY, 6.5, "F");
  doc.setFillColor(...EMERALD);
  doc.circle(markX, markY, 5.3, "F");
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("O", markX, markY + 1.2, { align: "center" });

  // Wordmark
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("OPTIMIS", markX + 11, markY - 1.2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text("LE  COMPARATEUR  SUISSE", markX + 11.4, markY + 4);

  // Titre fiche à droite
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(220, 230, 224);
  doc.text("FICHE LEAD", pageW - marginX, markY - 4, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(formType || "Lead", pageW - marginX, markY + 1.8, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text(leadId, pageW - marginX, markY + 6.5, { align: "right" });

  let y = headerH + 14;

  // ====== Bandeau résumé (date + canaux) ======
  const dateStr = String(leadData["Date et heure"] ?? "");
  const langStr = String(leadData["Langue"] ?? leadData.language ?? "");
  doc.setFillColor(...TINT);
  doc.rect(marginX, y - 6, pageW - marginX * 2, 14, "F");
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.2);
  doc.line(marginX, y + 8, pageW - marginX, y + 8);

  const stampCols = [
    { label: "Date", value: dateStr || "—" },
    { label: "Langue", value: (langStr || "—").toUpperCase() },
    { label: "Appareil", value: deviceInfo.device },
    { label: "Navigateur", value: deviceInfo.browser },
  ];
  const colW = (pageW - marginX * 2) / stampCols.length;
  stampCols.forEach((c, i) => {
    const cx = marginX + colW * i + 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(...MUTED);
    doc.text(c.label.toUpperCase(), cx, y - 1);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(c.value, cx, y + 4.5);
  });

  y += 18;

  // ====== Helpers de section / lignes ======
  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 22) { doc.addPage(); y = 22; }
  };

  const addSection = (title: string) => {
    ensureSpace(14);
    // barre or verticale
    doc.setFillColor(...GOLD);
    doc.rect(marginX, y - 4.5, 1.2, 6.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...EMERALD);
    doc.text(title.toUpperCase(), marginX + 4, y);
    // filet horizontal
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.2);
    doc.line(marginX, y + 3.5, pageW - marginX, y + 3.5);
    y += 9;
  };

  const addRow = (label: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return;
    const labelW = 55;
    const valW = pageW - marginX * 2 - labelW - 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const wrapped = doc.splitTextToSize(String(value), valW);
    const rowH = Math.max(6, wrapped.length * 4.3 + 2);
    ensureSpace(rowH);
    // label
    doc.setTextColor(...MUTED);
    doc.text(label, marginX + 2, y + 1);
    // value
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(wrapped, marginX + labelW + 4, y + 1);
    // dotted separator
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.15);
    doc.line(marginX, y + rowH - 1, pageW - marginX, y + rowH - 1);
    y += rowH;
  };

  // Champs techniques à exclure des sections principales
  const technical = new Set([
    "formType", "leadId", "language", "timestamp", "webhookUrl", "userAgent",
    "Fiche PDF", "Appareil", "Système", "Navigateur",
    "UTM Source", "UTM Medium", "UTM Campaign", "UTM Content", "UTM Term",
    "TikTok Click ID", "Facebook Click ID", "Google Click ID", "Microsoft Click ID",
    "Source publicitaire", "Landing URL", "Landing Referrer",
    "URL de la page", "Source", "Date et heure", "Type d'événement",
    "Type de formulaire", "Langue", "ID du lead",
  ]);

  // Section identité
  addSection("Identité du prospect");
  ["Prénom", "Nom", "Email", "Téléphone", "Date de naissance", "Canton", "Code postal", "Adresse", "Ville"].forEach((k) => {
    if (k in leadData) { addRow(k, leadData[k]); technical.add(k); }
  });

  // Section détails du formulaire
  addSection("Détails du formulaire");
  for (const [k, v] of Object.entries(leadData)) {
    if (technical.has(k)) continue;
    if (typeof v === "object") continue;
    addRow(k, v);
  }

  // Section traçabilité
  addSection("Traçabilité & attribution");
  addRow("ID du lead", leadId);
  addRow("Date et heure", leadData["Date et heure"]);
  addRow("Type d'événement", leadData["Type d'événement"]);
  addRow("Langue", leadData["Langue"] ?? leadData.language);
  addRow("URL de la page", leadData["URL de la page"]);
  addRow("Source (referrer)", leadData["Source"]);
  addRow("Source publicitaire", leadData["Source publicitaire"]);
  addRow("UTM Source", leadData["UTM Source"]);
  addRow("UTM Medium", leadData["UTM Medium"]);
  addRow("UTM Campaign", leadData["UTM Campaign"]);
  addRow("UTM Content", leadData["UTM Content"]);
  addRow("UTM Term", leadData["UTM Term"]);
  addRow("Landing URL", leadData["Landing URL"]);
  addRow("Landing Referrer", leadData["Landing Referrer"]);
  addRow("Google Click ID", leadData["Google Click ID"]);
  addRow("Facebook Click ID", leadData["Facebook Click ID"]);
  addRow("TikTok Click ID", leadData["TikTok Click ID"]);
  addRow("Microsoft Click ID", leadData["Microsoft Click ID"]);

  // Section appareil
  addSection("Appareil utilisé");
  addRow("Type d'appareil", deviceInfo.device);
  addRow("Système d'exploitation", deviceInfo.os);
  addRow("Navigateur", deviceInfo.browser);
  addRow("User-Agent", leadData.userAgent);

  // ====== Pied de page sur toutes les pages ======
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // filet or
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(marginX, pageH - 14, pageW - marginX, pageH - 14);
    // texte
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text("OptimisLink Sàrl  ·  Le Comparateur Suisse  ·  le-comparateur-optimis.ch", marginX, pageH - 9);
    doc.setTextColor(...EMERALD);
    doc.setFont("helvetica", "bold");
    doc.text(`${i} / ${pageCount}`, pageW - marginX, pageH - 9, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(`Document confidentiel · ${new Date().toLocaleDateString("fr-CH")}`, pageW / 2, pageH - 9, { align: "center" });
  }

  const arrayBuffer = doc.output("arraybuffer");
  return new Uint8Array(arrayBuffer);
}

// ----------------------------------------------------------------------------
// HANDLER PRINCIPAL
// ----------------------------------------------------------------------------
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const leadData = await req.json() as Record<string, unknown>;
    const formType = typeof leadData.formType === "string" ? leadData.formType : "";
    const externalLeadId = typeof leadData.leadId === "string" ? leadData.leadId : `unknown-${Date.now()}`;
    const timestamp = typeof leadData.timestamp === "string" ? leadData.timestamp : new Date().toISOString();

    // ===== Validation téléphone (inchangé) =====
    const phoneEntry = getLeadPhone(leadData);
    if (phoneEntry) {
      const phoneValidation = getPhoneValidationResult(phoneEntry.value);
      if (!phoneValidation.isValid) {
        console.error("Lead rejected — invalid phone", { formType, externalLeadId, reason: phoneValidation.reason });
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid phone number",
            reason: phoneValidation.reason,
            missingDigits: phoneValidation.missingDigits,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      leadData[phoneEntry.key] = phoneValidation.formatted;
    }

    console.log("=== LEAD SUBMISSION ===");
    console.log("FormType:", formType, "| externalLeadId:", externalLeadId);

    // ===== Détection appareil (repris de la prod) =====
    const userAgent = typeof leadData.userAgent === "string"
      ? leadData.userAgent
      : (req.headers.get("user-agent") ?? "");
    leadData.userAgent = userAgent;
    const deviceInfo = detectDevice(userAgent);
    leadData["Appareil"] = deviceInfo.device;
    leadData["Système"] = deviceInfo.os;
    leadData["Navigateur"] = deviceInfo.browser;

    // ===== Génération PDF fiche lead + upload bucket privé "lead-files" =====
    // (fire-and-forget : si le PDF échoue, le lead est quand même stocké + envoyé à Zapier)
    let pdfUrl = "";
    try {
      const pdfSupabaseUrl = Deno.env.get("SUPABASE_URL");
      const pdfServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (pdfSupabaseUrl && pdfServiceKey) {
        const admin = createClient(pdfSupabaseUrl, pdfServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        const pdfBytes = generateLeadPdf(leadData, deviceInfo);
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const safeLeadId = externalLeadId.replace(/[^a-zA-Z0-9_-]/g, "_");
        const path = `${yyyy}/${mm}/${formType || "lead"}/${safeLeadId}.pdf`;
        const { error: uploadError } = await admin.storage
          .from("lead-files")
          .upload(path, pdfBytes, { contentType: "application/pdf", upsert: true });
        if (uploadError) {
          console.error("PDF upload failed:", uploadError);
        } else {
          // Lien signé valable 10 ans
          const { data: signed, error: signError } = await admin.storage
            .from("lead-files")
            .createSignedUrl(path, 60 * 60 * 24 * 365 * 10, {
              download: `fiche-lead-${safeLeadId}.pdf`,
            });
          if (signError) console.error("Signed URL failed:", signError);
          else pdfUrl = signed?.signedUrl ?? "";
          console.log("PDF stocké :", path);
        }
      }
    } catch (pdfErr) {
      console.error("Erreur génération PDF:", pdfErr);
    }
    leadData["ID Lead"] = externalLeadId;
    leadData["Date soumission"] = timestamp;
    leadData["Fiche PDF"] = pdfUrl || "";

    // Préparer le payload propre (= exactement ce qui sera envoyé à Zapier)
    // donnees_produit = strictement identique au payload Zapier, pour faciliter
    // les comparaisons "BD vs Zapier" et copier-coller éventuel.
    const dataForZapier = { ...leadData };
    delete dataForZapier.webhookUrl;
    delete dataForZapier.userAgent;

    // ===== NEW: Stockage BD + routage (fallback safe) =====
    let bdResult: {
      stored: boolean;
      lead_id?: string;
      distribution_id?: string | null;
      error?: string;
    } = { stored: false };

    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (supabaseUrl && serviceKey) {
        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const fields = extractLeadFields(leadData);
        const produit = FORM_TO_PRODUIT[formType] || "autre";

        const insertPayload: Record<string, unknown> = {
          source_systeme: "optimis_comparateur",
          source_externe_id: externalLeadId,
          produit,
          source_formulaire: formType || null, // formType brut pour sous-onglets fins
          prenom: fields.prenom ?? null,
          nom: fields.nom ?? null,
          email: fields.email ?? null,
          telephone: fields.telephone ?? null,
          canton: fields.canton ?? null,
          langue: fields.langue ?? null,
          date_naissance: normalizeDate(fields.date_naissance) ?? null,
          age: fields.age ?? null,
          donnees_produit: dataForZapier, // payload identique à Zapier
          url_page: fields.url_page ?? null,
          source_trafic: fields.source_trafic ?? null,
          cree_le: timestamp,
        };

        const { data: lead, error: insertError } = await supabase
          .from("leads")
          .insert(insertPayload)
          .select("id")
          .single();

        if (insertError) {
          console.error("Erreur insert lead:", insertError);
          bdResult = { stored: false, error: insertError.message };
        } else {
          bdResult.stored = true;
          bdResult.lead_id = lead.id;

          // ========================================================================
          // AUTO-ROUTAGE DÉSACTIVÉ (décision 2026-05-25)
          // Le lead reste en statut 'nouveau' et attend une action manuelle
          // depuis le dashboard admin (sélection courtier ou bouton "auto-route").
          // ========================================================================
          bdResult.distribution_id = null;
          console.log("Lead stocké en statut 'nouveau' (auto-routage désactivé):", { lead_id: lead.id });

          // ========================================================================
          // EMAIL CONFIRMATION AU PROSPECT (async, fire-and-forget si échec)
          // ========================================================================
          if (fields.email) {
            const emailRes = await sendProspectConfirmation(fields.email, fields.prenom ?? "", formType);
            if (emailRes.ok) {
              console.log(`[prospect-email] envoyé à ${fields.email}`);
              (bdResult as any).email_sent = true;
            } else {
              console.error(`[prospect-email] échec : ${emailRes.error}`);
              (bdResult as any).email_sent = false;
              (bdResult as any).email_error = emailRes.error;
            }
          }

          // ========================================================================
          // SMS CONFIRMATION AU PROSPECT (async, fire-and-forget si échec)
          // ========================================================================
          if (fields.telephone) {
            const smsRes = await sendProspectSms(fields.telephone, fields.prenom ?? "", formType);
            if (smsRes.ok) {
              console.log(`[prospect-sms] envoyé à ${fields.telephone}`);
              (bdResult as any).sms_sent = true;
            } else {
              console.error(`[prospect-sms] échec : ${smsRes.error}`);
              (bdResult as any).sms_sent = false;
              (bdResult as any).sms_error = smsRes.error;
            }
          }
        }
      } else {
        console.warn("SUPABASE_URL ou SERVICE_ROLE_KEY manquant — skip BD storage");
      }
    } catch (e) {
      // BD échoue → on continue vers Zapier en fallback (zéro perte de lead)
      console.error("Exception bloc BD:", e);
      bdResult = { stored: false, error: e instanceof Error ? e.message : String(e) };
    }

    // ===== Envoi Zapier (filet de sécurité pendant la transition) =====
    // On utilise dataForZapier — strictement identique à ce qui est stocké en BD
    // Sélection webhook côté serveur uniquement (pas d'override client → anti-SSRF, repris prod)
    const lang = String(leadData["Langue"] ?? leadData.language ?? "").toLowerCase();
    const webhookUrl =
      FORM_WEBHOOKS_BY_LANG[`${formType}:${lang}`] ||
      FORM_WEBHOOKS[formType] ||
      DEFAULT_WEBHOOK_URL;

    console.log("Sending to Zapier:", webhookUrl);
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataForZapier),
    });

    const responseText = await response.text();
    console.log("Zapier status:", response.status);

    if (!response.ok) {
      console.error("Zapier failed:", response.status, responseText);
      // Si Zapier rate ET la BD rate → vraie erreur. Si BD OK → on a quand même stocké.
      if (!bdResult.stored) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Zapier webhook failed: ${response.status}`,
            details: responseText,
            bd: bdResult,
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log("=== LEAD PROCESSED ===");

    return new Response(
      JSON.stringify({
        success: true,
        leadId: externalLeadId,
        pdfUrl,
        bd: bdResult,
        zapier_ok: response.ok,
        message: "Lead processed",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing lead:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
