import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
          //
          // Pour réactiver l'auto-routage :
          //   const { data: distId } = await supabase.rpc("route_lead", { p_lead_id: lead.id });
          //   bdResult.distribution_id = distId;
          // ========================================================================
          bdResult.distribution_id = null;
          console.log("Lead stocké en statut 'nouveau' (auto-routage désactivé):", { lead_id: lead.id });
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
    const webhookUrl =
      (typeof leadData.webhookUrl === "string" && leadData.webhookUrl) ||
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
