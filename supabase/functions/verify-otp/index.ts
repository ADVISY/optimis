import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { otpId, code } = await req.json();

    if (!otpId || !code) {
      return new Response(
        JSON.stringify({ success: false, error: "OTP ID and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof code !== "string" || !/^\d{4}$/.test(code)) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_code", message: "Le code doit contenir 4 chiffres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the OTP record
    const { data: otp, error: fetchError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("id", otpId)
      .single();

    if (fetchError || !otp) {
      return new Response(
        JSON.stringify({ success: false, error: "otp_not_found", message: "Code de vérification non trouvé" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already verified
    if (otp.verified) {
      return new Response(
        JSON.stringify({ success: true, verified: true, message: "Déjà vérifié" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (new Date(otp.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: "expired", message: "Le code a expiré. Veuillez en demander un nouveau." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check max attempts
    if (otp.attempts >= otp.max_attempts) {
      return new Response(
        JSON.stringify({ success: false, error: "max_attempts", message: "Trop de tentatives. Veuillez demander un nouveau code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment attempts
    await supabase
      .from("otp_verifications")
      .update({ attempts: otp.attempts + 1 })
      .eq("id", otpId);

    // Verify code
    if (otp.code !== code) {
      const remaining = otp.max_attempts - (otp.attempts + 1);
      return new Response(
        JSON.stringify({
          success: false,
          error: "wrong_code",
          message: `Code incorrect. ${remaining} tentative(s) restante(s).`,
          remainingAttempts: remaining,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark as verified
    await supabase
      .from("otp_verifications")
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq("id", otpId);

    console.log("OTP verified successfully:", otpId, "phone:", otp.phone_e164);

    return new Response(
      JSON.stringify({ success: true, verified: true, phoneE164: otp.phone_e164 }),
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
