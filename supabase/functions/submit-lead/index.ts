import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Default Zapier webhook URL
const DEFAULT_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/21326682/un2n4oc/";

// Form-specific webhook URLs
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
    if (nationalDigits.length >= 2 && SWISS_MOBILE_PREFIXES.has(nationalDigits.slice(0, 2))) {
      return groupDigits(digits.slice(0, 10), [3, 3, 2, 2]);
    }
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

// Détection appareil depuis User-Agent
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

// Génère le PDF de la fiche lead
function generateLeadPdf(leadData: Record<string, unknown>, deviceInfo: { device: string; os: string; browser: string }): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 15;
  let y = 18;

  // En-tête
  doc.setFillColor(45, 90, 61); // emerald
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Fiche Lead - Optimis", marginX, 13);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const leadId = String(leadData["ID du lead"] ?? leadData.leadId ?? "");
  const formType = String(leadData["Type de formulaire"] ?? leadData.formType ?? "");
  doc.text(`${formType} | ${leadId}`, marginX, 21);

  y = 38;
  doc.setTextColor(0, 0, 0);

  const addSection = (title: string) => {
    if (y > pageH - 25) { doc.addPage(); y = 20; }
    doc.setFillColor(240, 245, 242);
    doc.rect(marginX - 2, y - 4, pageW - marginX * 2 + 4, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(45, 90, 61);
    doc.text(title, marginX, y + 1);
    y += 9;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
  };

  const addRow = (label: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return;
    if (y > pageH - 15) { doc.addPage(); y = 20; }
    const strVal = String(value);
    doc.setFont("helvetica", "bold");
    doc.text(`${label} :`, marginX, y);
    doc.setFont("helvetica", "normal");
    const wrapped = doc.splitTextToSize(strVal, pageW - marginX * 2 - 55);
    doc.text(wrapped, marginX + 55, y);
    y += Math.max(5, wrapped.length * 4.5);
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

  // Section détails du formulaire (tout le reste)
  addSection("Détails du formulaire");
  for (const [k, v] of Object.entries(leadData)) {
    if (technical.has(k)) continue;
    if (typeof v === "object") continue;
    addRow(k, v);
  }

  // Section traçabilité
  addSection("Traçabilité");
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

  // Pied de page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Optimis - Fiche Lead générée le ${new Date().toLocaleString("fr-CH")}`, marginX, pageH - 8);
    doc.text(`Page ${i}/${pageCount}`, pageW - marginX - 15, pageH - 8);
  }

  const arrayBuffer = doc.output("arraybuffer");
  return new Uint8Array(arrayBuffer);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const leadData = await req.json() as Record<string, unknown>;
    const formType = typeof leadData.formType === "string" ? leadData.formType : "";
    const leadId = typeof leadData.leadId === "string" ? leadData.leadId : "unknown";
    const timestamp = typeof leadData.timestamp === "string" ? leadData.timestamp : new Date().toISOString();
    const phoneEntry = getLeadPhone(leadData);

    if (phoneEntry) {
      const phoneValidation = getPhoneValidationResult(phoneEntry.value);
      if (!phoneValidation.isValid) {
        console.error("Lead rejected due to invalid phone number", { formType, leadId, reason: phoneValidation.reason });
        return new Response(
          JSON.stringify({ success: false, error: "Invalid phone number", reason: phoneValidation.reason, missingDigits: phoneValidation.missingDigits }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      leadData[phoneEntry.key] = phoneValidation.formatted;
    }

    console.log("=== LEAD SUBMISSION ===", { formType, leadId, timestamp });

    // Device detection (depuis le userAgent envoyé par le client, sinon header)
    const userAgent = typeof leadData.userAgent === "string"
      ? leadData.userAgent
      : (req.headers.get("user-agent") ?? "");
    leadData.userAgent = userAgent;
    const deviceInfo = detectDevice(userAgent);
    leadData["Appareil"] = deviceInfo.device;
    leadData["Système"] = deviceInfo.os;
    leadData["Navigateur"] = deviceInfo.browser;

    // Génération PDF + upload vers Supabase Storage
    let pdfUrl = "";
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const admin = createClient(supabaseUrl, serviceKey);

      const pdfBytes = generateLeadPdf(leadData, deviceInfo);
      const date = new Date();
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const safeLeadId = leadId.replace(/[^a-zA-Z0-9_-]/g, "_");
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
          .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        if (signError) console.error("Signed URL failed:", signError);
        else pdfUrl = signed?.signedUrl ?? "";
        console.log("PDF stocké :", path);
      }
    } catch (pdfErr) {
      console.error("Erreur génération PDF:", pdfErr);
    }

    if (pdfUrl) leadData["Fiche PDF"] = pdfUrl;

    // Sélection webhook
    const webhookUrl =
      (typeof leadData.webhookUrl === "string" && leadData.webhookUrl) ||
      FORM_WEBHOOKS[formType] ||
      DEFAULT_WEBHOOK_URL;

    const dataToSend = { ...leadData };
    delete dataToSend.webhookUrl;

    console.log("Sending to Zapier:", webhookUrl);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    const responseText = await response.text();
    console.log("Zapier response:", response.status, responseText);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Zapier webhook failed: ${response.status}`, details: responseText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, leadId, pdfUrl, message: "Lead sent to Zapier successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing lead:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
