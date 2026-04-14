import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VERIFY_SERVICE_SID = "VA2b4327548063070224159545d3d7a1dd";

function normalizeToE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("41") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("33") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("07") && digits.length === 10) return `+41${digits.slice(1)}`;
  if ((digits.startsWith("06") || digits.startsWith("07")) && digits.length === 10) {
    const prefix2 = digits.slice(1, 3);
    if (["76", "77", "78", "79"].includes(prefix2)) return `+41${digits.slice(1)}`;
    return `+33${digits.slice(1)}`;
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ success: false, error: "Phone and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const phoneE164 = normalizeToE164(phone);
    if (!phoneE164) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_phone", message: "Numéro de téléphone invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const codeStr = String(code).trim();
    if (!/^\d{4,8}$/.test(codeStr)) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_code", message: "Le code doit contenir des chiffres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    if (!accountSid) throw new Error("TWILIO_ACCOUNT_SID is not configured");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    if (!authToken) throw new Error("TWILIO_AUTH_TOKEN is not configured");

    const basicAuth = btoa(`${accountSid}:${authToken}`);

    const checkResponse = await fetch(
      `https://verify.twilio.com/v2/Services/${VERIFY_SERVICE_SID}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phoneE164,
          Code: codeStr,
        }),
      }
    );

    const checkData = await checkResponse.json();

    if (!checkResponse.ok) {
      console.error("Twilio VerificationCheck failed:", checkResponse.status, JSON.stringify(checkData));

      // Code not found or expired
      if (checkData?.code === 20404) {
        return new Response(
          JSON.stringify({ success: false, error: "expired", message: "Le code a expiré. Veuillez en demander un nouveau." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (checkData?.code === 60202) {
        return new Response(
          JSON.stringify({ success: false, error: "max_attempts", message: "Trop de tentatives. Veuillez demander un nouveau code." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: "verification_failed", message: "Erreur lors de la vérification" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (checkData.status === "approved") {
      console.log("OTP verified successfully for", phoneE164);
      return new Response(
        JSON.stringify({ success: true, verified: true, phoneE164 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Status is "pending" = wrong code
    return new Response(
      JSON.stringify({ success: false, error: "wrong_code", message: "Code incorrect. Veuillez réessayer." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
