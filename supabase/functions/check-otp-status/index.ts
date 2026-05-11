import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VERIFY_SERVICE_SID = "VA2b4327548063070224159545d3d7a1dd";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const phone = url.searchParams.get("phone");
    const sid = url.searchParams.get("sid");

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const basicAuth = btoa(`${accountSid}:${authToken}`);

    const results: Record<string, unknown> = {};

    // 1. Account info (trial status, balance)
    const accRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
      headers: { Authorization: `Basic ${basicAuth}` },
    });
    const acc = await accRes.json();
    results.account = { status: acc.status, type: acc.type, friendly_name: acc.friendly_name };

    // 2. Balance
    const balRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Balance.json`, {
      headers: { Authorization: `Basic ${basicAuth}` },
    });
    results.balance = await balRes.json();

    // 3. Specific verification status
    if (sid) {
      const vRes = await fetch(
        `https://verify.twilio.com/v2/Services/${VERIFY_SERVICE_SID}/Verifications/${sid}`,
        { headers: { Authorization: `Basic ${basicAuth}` } }
      );
      const verification = await vRes.json();
      results.verification = verification;

      const attempts = verification.send_code_attempts || [];
      results.attempts = [];
      for (const a of attempts) {
        const aRes = await fetch(
          `https://verify.twilio.com/v2/Attempts/${a.attempt_sid}`,
          { headers: { Authorization: `Basic ${basicAuth}` } }
        );
        (results.attempts as any[]).push(await aRes.json());
      }
    }

    // 4. Recent messages to that phone (delivery status)
    if (phone) {
      const msgRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json?To=${encodeURIComponent(phone)}&PageSize=5`,
        { headers: { Authorization: `Basic ${basicAuth}` } }
      );
      const msgs = await msgRes.json();
      results.recentMessages = (msgs.messages || []).map((m: any) => ({
        sid: m.sid,
        to: m.to,
        from: m.from,
        status: m.status,
        error_code: m.error_code,
        error_message: m.error_message,
        date_sent: m.date_sent,
        body: m.body?.slice(0, 50),
      }));
    }

    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
