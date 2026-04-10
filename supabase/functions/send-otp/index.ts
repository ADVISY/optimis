import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";
const TWILIO_FROM_NUMBER = "+41445054225";
const OTP_EXPIRY_MINUTES = 10;

function generateOtpCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function normalizeToE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");

  // Swiss: +41 7X XXX XX XX → 11 digits starting with 41
  if (digits.startsWith("41") && digits.length === 11) {
    return `+${digits}`;
  }

  // French: +33 6/7 XX XX XX XX → 11 digits starting with 33
  if (digits.startsWith("33") && digits.length === 11) {
    return `+${digits}`;
  }

  // Local Swiss: 07X XXX XX XX → 10 digits starting with 0
  if (digits.startsWith("07") && digits.length === 10) {
    return `+41${digits.slice(1)}`;
  }

  // Local French: 06/07 XX XX XX XX → 10 digits starting with 0
  if ((digits.startsWith("06") || digits.startsWith("07")) && digits.length === 10) {
    // Could be French or Swiss - assume Swiss if 07[6-9]
    const prefix2 = digits.slice(1, 3);
    if (["76", "77", "78", "79"].includes(prefix2)) {
      return `+41${digits.slice(1)}`;
    }
    // French 06 or 07 non-Swiss
    return `+33${digits.slice(1)}`;
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, leadId } = await req.json();

    if (!phone || typeof phone !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const phoneE164 = normalizeToE164(phone);
    if (!phoneE164) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid phone number format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: max 3 OTPs per phone per 10 minutes
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentOtps } = await supabase
      .from("otp_verifications")
      .select("id")
      .eq("phone_e164", phoneE164)
      .gte("created_at", tenMinutesAgo);

    if (recentOtps && recentOtps.length >= 3) {
      return new Response(
        JSON.stringify({ success: false, error: "too_many_requests", message: "Trop de tentatives. Veuillez patienter quelques minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate code and store
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const { data: otpRecord, error: insertError } = await supabase
      .from("otp_verifications")
      .insert({
        phone_e164: phoneE164,
        code,
        lead_id: leadId || null,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to store OTP:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to generate verification code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send SMS via Twilio gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    if (!TWILIO_API_KEY) {
      throw new Error("TWILIO_API_KEY is not configured");
    }

    const smsBody = `Votre code de vérification Optimis : ${code}. Ce code expire dans ${OTP_EXPIRY_MINUTES} minutes.`;

    const twilioResponse = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: phoneE164,
        From: TWILIO_FROM_NUMBER,
        Body: smsBody,
      }),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio SMS failed:", twilioResponse.status, JSON.stringify(twilioData));
      // Clean up the OTP record since SMS failed
      await supabase.from("otp_verifications").delete().eq("id", otpRecord.id);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to send SMS", details: twilioData?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("OTP SMS sent successfully to", phoneE164, "OTP ID:", otpRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        otpId: otpRecord.id,
        expiresAt,
        phoneLastDigits: phoneE164.slice(-4),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-otp:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
