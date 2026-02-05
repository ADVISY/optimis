import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Default Zapier webhook URL
const DEFAULT_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/21326682/ul72n92/";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const leadData = await req.json();
    
    console.log("=== LEAD SUBMISSION ===");
    console.log("FormType:", leadData.formType);
    console.log("LeadId:", leadData.leadId);
    console.log("Timestamp:", leadData.timestamp);
    console.log("Full lead data:", JSON.stringify(leadData, null, 2));

    // Use custom webhook URL if provided, otherwise use default
    const webhookUrl = leadData.webhookUrl || DEFAULT_WEBHOOK_URL;
    
    // Remove webhookUrl from lead data before sending to Zapier
    const { webhookUrl: _, ...dataToSend } = leadData;

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
        leadId: dataToSend.leadId,
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
