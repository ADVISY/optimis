import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Default Zapier webhook URL
const DEFAULT_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/21326682/un2n4oc/";

// Form-specific webhook URLs
const FORM_WEBHOOKS: Record<string, string> = {
  "lpp-libre-passage": "https://hooks.zapier.com/hooks/catch/21326682/un855tt/",
  "professional-insurance": "https://hooks.zapier.com/hooks/catch/21326682/un8i19a/",
  "estimation-immobiliere": "https://hooks.zapier.com/hooks/catch/21326682/un8s2j4/",
  "partner": "https://hooks.zapier.com/hooks/catch/21326682/un8k5nv/",
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

  if (cursor < digits.length) {
    parts.push(digits.slice(cursor));
  }

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

    if (nationalDigits.startsWith("6")) {
      return groupDigits(digits.slice(0, 10), [2, 2, 2, 2, 2]);
    }

    if (nationalDigits.length >= 2 && SWISS_MOBILE_PREFIXES.has(nationalDigits.slice(0, 2))) {
      return groupDigits(digits.slice(0, 10), [3, 3, 2, 2]);
    }

    if (nationalDigits.startsWith("7")) {
      return groupDigits(digits.slice(0, 10), [2, 2, 2, 2, 2]);
    }

    return groupDigits(digits.slice(0, 10), [3, 3, 2, 2]);
  }

  return digits;
};

const getPhoneValidationResult = (phone: string) => {
  const digits = digitsOnly(phone);

  if (!digits) {
    return { isValid: false, reason: "empty", missingDigits: 0, formatted: "" };
  }

  if (digits.startsWith("41")) {
    const nationalDigits = digits.slice(2);

    if (digits.length < 11) {
      return { isValid: false, reason: "too_short", missingDigits: 11 - digits.length, formatted: formatPhone(phone) };
    }

    if (digits.length > 11) {
      return { isValid: false, reason: "too_long", missingDigits: 0, formatted: formatPhone(phone) };
    }

    if (!SWISS_MOBILE_PREFIXES.has(nationalDigits.slice(0, 2))) {
      return { isValid: false, reason: "invalid_mobile_prefix", missingDigits: 0, formatted: formatPhone(phone) };
    }

    return { isValid: true, reason: null, missingDigits: 0, formatted: formatPhone(phone) };
  }

  if (digits.startsWith("33")) {
    const nationalDigits = digits.slice(2);

    if (digits.length < 11) {
      return { isValid: false, reason: "too_short", missingDigits: 11 - digits.length, formatted: formatPhone(phone) };
    }

    if (digits.length > 11) {
      return { isValid: false, reason: "too_long", missingDigits: 0, formatted: formatPhone(phone) };
    }

    if (!["6", "7"].includes(nationalDigits.slice(0, 1))) {
      return { isValid: false, reason: "invalid_mobile_prefix", missingDigits: 0, formatted: formatPhone(phone) };
    }

    return { isValid: true, reason: null, missingDigits: 0, formatted: formatPhone(phone) };
  }

  if (digits.startsWith("0")) {
    const nationalDigits = digits.slice(1);
    const isSwissLocal = nationalDigits.length >= 2 && SWISS_MOBILE_PREFIXES.has(nationalDigits.slice(0, 2));
    const isFrenchLocal = nationalDigits.startsWith("6") || nationalDigits.startsWith("7");

    if (digits.length < 10) {
      return { isValid: false, reason: "too_short", missingDigits: 10 - digits.length, formatted: formatPhone(phone) };
    }

    if (digits.length > 10) {
      return { isValid: false, reason: "too_long", missingDigits: 0, formatted: formatPhone(phone) };
    }

    if (!isSwissLocal && !isFrenchLocal) {
      return { isValid: false, reason: "invalid_mobile_prefix", missingDigits: 0, formatted: formatPhone(phone) };
    }

    return { isValid: true, reason: null, missingDigits: 0, formatted: formatPhone(phone) };
  }

  return { isValid: false, reason: "invalid_prefix", missingDigits: 0, formatted: formatPhone(phone) };
};

const getLeadPhone = (leadData: Record<string, unknown>) => {
  if (typeof leadData["Téléphone"] === "string") {
    return { key: "Téléphone", value: leadData["Téléphone"] };
  }

  if (typeof leadData.phone === "string") {
    return { key: "phone", value: leadData.phone };
  }

  return null;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const leadData = await req.json() as Record<string, unknown>;
    const formType = typeof leadData.formType === "string" ? leadData.formType : "";
    const leadId = typeof leadData.leadId === "string" ? leadData.leadId : "unknown";
    const timestamp = typeof leadData.timestamp === "string" ? leadData.timestamp : new Date().toISOString();
    const phoneEntry = getLeadPhone(leadData);

    if (phoneEntry) {
      const phoneValidation = getPhoneValidationResult(phoneEntry.value);

      if (!phoneValidation.isValid) {
        console.error("Lead rejected due to invalid phone number", {
          formType,
          leadId,
          reason: phoneValidation.reason,
          missingDigits: phoneValidation.missingDigits,
        });

        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid phone number",
            reason: phoneValidation.reason,
            missingDigits: phoneValidation.missingDigits,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      leadData[phoneEntry.key] = phoneValidation.formatted;
    }
    
    console.log("=== LEAD SUBMISSION ===");
    console.log("FormType:", formType);
    console.log("LeadId:", leadId);
    console.log("Timestamp:", timestamp);

    // Use form-specific webhook, then custom webhook, then default
    const webhookUrl =
      (typeof leadData.webhookUrl === "string" && leadData.webhookUrl) ||
      FORM_WEBHOOKS[formType] ||
      DEFAULT_WEBHOOK_URL;
    
    // Remove technical/internal fields before sending to Zapier
    const dataToSend = { ...leadData };
    delete dataToSend.webhookUrl;
    delete dataToSend.userAgent;

    console.log("Sending to Zapier webhook:", webhookUrl);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });

    const responseText = await response.text();
    console.log("Zapier response status:", response.status);
    console.log("Zapier response body:", responseText);

    if (!response.ok) {
      console.error("Zapier webhook failed:", response.status, responseText);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Zapier webhook failed: ${response.status}`,
          details: responseText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("=== LEAD SENT SUCCESSFULLY ===");

    return new Response(
      JSON.stringify({
        success: true,
        leadId,
        message: "Lead sent to Zapier successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing lead:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
