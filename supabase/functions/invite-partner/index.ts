// ============================================================================
// invite-partner — invitation d'un courtier à se créer un compte partner
// ============================================================================
// Input : { client_id, email, full_name? }
// Actions :
//   1. Vérifie que l'appelant est admin (rôle 'admin' dans user_roles)
//   2. Invite le user via Supabase Auth (email avec lien sécurisé)
//   3. Assigne le rôle 'partner' dans user_roles
//   4. Crée la liaison dans partner_user_clients
//   → Le courtier reçoit un email "Activez votre compte" et définit son mdp.
//
// Pré-requis :
//   - SMTP configuré dans Supabase Auth (par défaut limité à 3 emails/heure ;
//     pour prod, brancher Resend/SendGrid via Auth → SMTP Settings)
//   - Template "Invite user" customisé en français (Auth → Email Templates)
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APP_URL = Deno.env.get("APP_URL") ?? "https://le-comparateur-optimis.ch";

async function ensureRoleAndLink(supabase: any, user_id: string, client_id: string) {
  // Idempotent : si déjà présent, on ignore
  await supabase
    .from("user_roles")
    .upsert({ user_id, role: "partner" }, { onConflict: "user_id,role", ignoreDuplicates: true });
  await supabase
    .from("partner_user_clients")
    .upsert({ user_id, client_id }, { onConflict: "user_id,client_id", ignoreDuplicates: true });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { client_id, email, full_name } = await req.json();
    if (!client_id || !email) {
      return new Response(JSON.stringify({ error: "client_id et email requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1. Vérifier l'appelant est un admin
    const callerSupabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: callerData } = await callerSupabase.auth.getUser();
    if (!callerData?.user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await callerSupabase.rpc("has_role", {
      _user_id: callerData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Rôle admin requis" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Service role pour les opérations admin (Auth + RLS bypass)
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 3. Vérifier le client
    const { data: client, error: clientErr } = await supabase
      .from("admin_clients")
      .select("id, company_name")
      .eq("id", client_id)
      .single();
    if (clientErr || !client) {
      return new Response(JSON.stringify({ error: "Client introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Inviter ou récupérer l'user existant
    const { data: inviteData, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: full_name ?? client.company_name,
        invited_for_client_id: client_id,
        invited_for_company: client.company_name,
        intended_role: "partner",
      },
      redirectTo: `${APP_URL}/partner/login`,
    });

    let userId: string | null = null;
    let alreadyExisted = false;

    if (inviteErr) {
      // Cas : user existe déjà → on le récupère pour ajouter le rôle/liaison
      const msg = (inviteErr.message ?? "").toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        // Récupérer par email
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        if (!existing) {
          throw new Error(`Email existe déjà mais user introuvable : ${inviteErr.message}`);
        }
        userId = existing.id;
        alreadyExisted = true;
      } else {
        throw inviteErr;
      }
    } else {
      userId = inviteData.user?.id ?? null;
    }

    if (!userId) {
      throw new Error("Impossible d'obtenir l'user_id après invitation");
    }

    // 5. Assigner rôle + liaison cabinet
    await ensureRoleAndLink(supabase, userId, client_id);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        already_existed: alreadyExisted,
        message: alreadyExisted
          ? `${email} existait déjà — accès partner ajouté pour ${client.company_name}`
          : `Invitation envoyée à ${email}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("[invite-partner] error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e.message ?? String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
