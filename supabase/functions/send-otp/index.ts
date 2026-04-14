import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";
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
    const { phone } = await req.json();

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    if (!TWILIO_API_KEY) throw new Error("TWILIO_API_KEY is not configured");

    // Send verification via Twilio Verify API
    const verifyResponse = await fetch(
      `${GATEWAY_URL}/Services/${VERIFY_SERVICE_SID}/Verifications`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phoneE164,
          Channel: "sms",
        }),
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.error("Twilio Verify failed:", verifyResponse.status, JSON.stringify(verifyData));

      if (verifyData?.code === 60203) {
        return new Response(
          JSON.stringify({ success: false, error: "too_many_requests", message: "Trop de tentatives. Veuillez patienter quelques minutes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: "Failed to send SMS", details: verifyData?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Twilio Verify sent successfully to", phoneE164, "SID:", verifyData.sid);

    return new Response(
      JSON.stringify({
        success: true,
        otpId: verifyData.sid,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
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
