// ============================================================================
// deliver-distribution — adapter de livraison d'un lead à son courtier
// ============================================================================
// Prend un distribution_id en input, lit le canal correspondant, envoie le
// lead au courtier via le canal configuré (google_sheets via webhook,
// lyta_api, crm_externe via webhook, optimis_dashboard = no-op, email).
//
// Côté frontend : appelée après route_lead / distribute_lead_manual pour
// transformer la distribution 'pending' → 'envoye'.
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ----------------------------------------------------------------------------
// Adapter 1 : Webhook (Google Sheets via Zapier/Make/N8n, ou CRM externe direct)
// ----------------------------------------------------------------------------
async function deliverViaWebhook(payload: any, canal: any): Promise<void> {
  const url = canal.config?.webhook_url ?? canal.config?.endpoint;
  if (!url) throw new Error("URL du webhook absente dans la config du canal");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (canal.config?.auth_header) {
    headers["Authorization"] = canal.config.auth_header;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Webhook responded ${res.status}: ${text.slice(0, 300)}`);
  }
}

// ----------------------------------------------------------------------------
// Adapter 2 : LYTA API (push direct dans instance tenant)
// ----------------------------------------------------------------------------
async function deliverViaLytaApi(payload: any, canal: any): Promise<void> {
  const endpoint = canal.config?.endpoint;
  const tenantId = canal.config?.tenant_id;
  const token = canal.config?.token;
  if (!endpoint || !tenantId || !token) {
    throw new Error("Config LYTA incomplète (endpoint, tenant_id, token requis)");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Tenant-Id": tenantId,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LYTA API responded ${res.status}: ${text.slice(0, 300)}`);
  }
}

// ----------------------------------------------------------------------------
// Adapter 3 : Email (envoi via Resend ou autre — à brancher plus tard)
// ----------------------------------------------------------------------------
async function deliverViaEmail(_payload: any, canal: any): Promise<void> {
  const emailTo = canal.config?.email_to;
  if (!emailTo) throw new Error("Adresse email absente");
  // TODO: brancher un provider email (Resend, SendGrid, SES, etc.)
  // Pour l'instant on log et on considère envoyé
  console.log(`[email] Lead à envoyer à ${emailTo} — TODO brancher provider`);
  throw new Error("Adapter email non encore implémenté (TODO Resend)");
}

// ----------------------------------------------------------------------------
// Handler principal
// ----------------------------------------------------------------------------
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { distribution_id } = await req.json();
    if (!distribution_id) {
      return new Response(
        JSON.stringify({ success: false, error: "distribution_id requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Récupère la distribution + lead + canal + client
    const { data: dist, error: distErr } = await supabase
      .from("distributions")
      .select(`
        id, statut, lead_id, client_id, canal_id,
        leads(*),
        admin_clients(company_name, contact_name, email),
        canaux_livraison(type, config)
      `)
      .eq("id", distribution_id)
      .single();

    if (distErr || !dist) {
      throw new Error(`Distribution introuvable : ${distErr?.message}`);
    }

    if (dist.statut === "envoye") {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "déjà envoyé" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lead: any = dist.leads;
    const canal: any = dist.canaux_livraison;
    if (!canal) throw new Error("Canal de livraison introuvable");

    // 2. Prépare le payload = exactement ce qui était envoyé à Zapier (donnees_produit)
    //    + métadonnées Optimis (lead_id interne, courtier, etc.)
    const payload = {
      ...(lead.donnees_produit ?? {}),
      _optimis: {
        lead_id: lead.id,
        distribution_id: dist.id,
        client: dist.admin_clients?.company_name,
        canal_type: canal.type,
        sent_at: new Date().toISOString(),
      },
    };

    // 3. Dispatch vers l'adapter selon le type
    let errorMessage: string | null = null;
    try {
      if (canal.type === "google_sheets" || canal.type === "crm_externe") {
        await deliverViaWebhook(payload, canal);
      } else if (canal.type === "lyta_api") {
        await deliverViaLytaApi(payload, canal);
      } else if (canal.type === "email") {
        await deliverViaEmail(payload, canal);
      } else if (canal.type === "optimis_dashboard") {
        // No-op : le lead est juste visible dans l'espace courtier Optimis
        // → on marque envoyé sans rien faire
      } else {
        throw new Error(`Type de canal inconnu : ${canal.type}`);
      }
    } catch (e: any) {
      errorMessage = e.message ?? String(e);
    }

    // 4. Met à jour le statut de la distribution
    if (errorMessage) {
      await supabase
        .from("distributions")
        .update({
          statut: "echec",
          error_message: errorMessage,
          retry_count: ((dist as any).retry_count ?? 0) + 1,
        })
        .eq("id", dist.id);

      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      await supabase
        .from("distributions")
        .update({
          statut: "envoye",
          envoye_le: new Date().toISOString(),
          payload_envoye: payload,
        })
        .eq("id", dist.id);

      return new Response(
        JSON.stringify({ success: true, distribution_id: dist.id, canal_type: canal.type }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (e: any) {
    console.error("[deliver-distribution] error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e.message ?? String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
