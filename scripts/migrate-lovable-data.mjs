// ============================================================================
// Migration des données Lovable → nouveau Supabase autonome
// ============================================================================
// Copie les données métier de l'ANCIEN projet Supabase (Lovable Cloud)
// vers le NOUVEAU projet autonome, en LECTURE SEULE sur l'ancien.
//
//   ⚠️ RÈGLE ABSOLUE : ce script n'écrit JAMAIS dans l'ancien projet.
//      Il ne fait que lire (SELECT) côté ANCIEN, et upsert côté NOUVEAU.
//      Aucun DELETE / UPDATE / TRUNCATE nulle part.
//
// Idempotent : upsert avec `ignoreDuplicates` sur la clé primaire → on peut
// relancer autant de fois que voulu (resync delta avant la bascule finale).
//
// ----------------------------------------------------------------------------
// PRÉREQUIS — variables d'environnement (jamais de secret en dur) :
//
//   OLD_SUPABASE_URL    = https://phshmvklhwpihayanhpf.supabase.co   (ancien Lovable)
//   OLD_SERVICE_KEY     = <service_role key de l'ANCIEN projet>       (Dashboard → Settings → API)
//   NEW_SUPABASE_URL    = https://iuuefrxcmrcdbbuyzhqf.supabase.co    (nouveau, par défaut)
//   NEW_SERVICE_KEY     = <service_role key du NOUVEAU projet>
//
// La service_role key contourne la RLS (lecture complète côté ancien,
// écriture complète côté nouveau). On utilise service_role car les tables
// admin/leads sont protégées par RLS.
//
// ----------------------------------------------------------------------------
// USAGE :
//
//   # 1) Inventaire + plan, AUCUNE écriture (par défaut) :
//   OLD_SUPABASE_URL=... OLD_SERVICE_KEY=... NEW_SERVICE_KEY=... \
//     node scripts/migrate-lovable-data.mjs
//
//   # 2) Migration réelle :
//   OLD_SUPABASE_URL=... OLD_SERVICE_KEY=... NEW_SERVICE_KEY=... \
//     node scripts/migrate-lovable-data.mjs --run
//
//   # Limiter à certaines tables :
//   node scripts/migrate-lovable-data.mjs --run --only=admin_clients,leads
// ============================================================================

import { createClient } from "@supabase/supabase-js";

// ----------------------------------------------------------------------------
// Config
// ----------------------------------------------------------------------------
const OLD_URL = process.env.OLD_SUPABASE_URL;
const OLD_KEY = process.env.OLD_SERVICE_KEY;
const NEW_URL = process.env.NEW_SUPABASE_URL ?? "https://iuuefrxcmrcdbbuyzhqf.supabase.co";
const NEW_KEY = process.env.NEW_SERVICE_KEY;

// Ordre FK-safe : parents AVANT enfants. La clé `conflict` = colonne(s) PK
// servant à l'upsert idempotent. `skip:true` = table connue mais non migrée
// (éphémère, régénérée, ou propre au nouveau moteur → vide côté ancien).
const TABLES = [
  // --- Référentiels & clients (parents) ---
  { name: "admin_products",          conflict: "id" },
  { name: "admin_clients",           conflict: "id" },
  { name: "admin_company_settings",  conflict: "id" },

  // --- Commandes (FK → clients / products) ---
  { name: "admin_orders",            conflict: "id" },
  { name: "admin_order_lines",       conflict: "id" },

  // --- Factures (FK → clients / orders) ---
  { name: "admin_invoices",          conflict: "id" },
  { name: "admin_invoice_lines",     conflict: "id" },

  // --- Leads (gros volume, indépendant) ---
  { name: "leads",                   conflict: "id" },

  // --- Comptes / rôles (liés à auth.users → à traiter à part, désactivé par défaut) ---
  { name: "admin_profiles",          conflict: "id", skip: true, why: "lié à auth.users — recréer les comptes via invite plutôt que copier" },
  { name: "user_roles",              conflict: "id", skip: true, why: "lié à auth.users — dépend des comptes recréés" },
  { name: "partner_user_clients",    conflict: "id", skip: true, why: "lié à auth.users (espace courtier) — recréer après invites" },

  // --- Éphémère / régénéré / propre au nouveau moteur (pas de données utiles côté ancien) ---
  { name: "health_premiums",         conflict: "id", skip: true, why: "régénéré via import-health-premiums (229k rows OFSP)" },
  { name: "otp_verifications",       conflict: "id", skip: true, why: "éphémère (codes OTP)" },
  { name: "admin_otp_sessions",      conflict: "id", skip: true, why: "éphémère (sessions OTP)" },
  { name: "distributions",           conflict: "id", skip: true, why: "moteur de distribution autonome — vide côté ancien" },
  { name: "canaux_livraison",        conflict: "id", skip: true, why: "moteur de distribution autonome — vide côté ancien" },
  { name: "notifications",           conflict: "id", skip: true, why: "notifications autonomes — vide côté ancien" },
];

const PAGE = 1000;   // lecture paginée côté ancien
const CHUNK = 500;   // taille de batch d'upsert côté nouveau

// ----------------------------------------------------------------------------
// Args
// ----------------------------------------------------------------------------
const args = process.argv.slice(2);
const DO_RUN = args.includes("--run");
const onlyArg = args.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.replace("--only=", "").split(",").map((s) => s.trim()).filter(Boolean) : null;

// ----------------------------------------------------------------------------
// Garde-fous
// ----------------------------------------------------------------------------
function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

if (!OLD_URL || !OLD_KEY) fail("OLD_SUPABASE_URL et OLD_SERVICE_KEY sont requis (ancien projet Lovable, lecture seule).");
if (!NEW_KEY) fail("NEW_SERVICE_KEY est requis (service_role du nouveau projet).");
if (OLD_URL === NEW_URL) fail("OLD_SUPABASE_URL === NEW_SUPABASE_URL : refus (on ne migre pas un projet vers lui-même).");

const oldDb = createClient(OLD_URL, OLD_KEY, { auth: { persistSession: false } });
const newDb = createClient(NEW_URL, NEW_KEY, { auth: { persistSession: false } });

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
async function countRows(db, table) {
  const { count, error } = await db.from(table).select("*", { count: "exact", head: true });
  if (error) return { count: null, error: error.message };
  return { count: count ?? 0, error: null };
}

async function fetchPage(db, table, from, to) {
  const { data, error } = await db.from(table).select("*").range(from, to);
  if (error) throw new Error(`lecture ${table} [${from}-${to}] : ${error.message}`);
  return data ?? [];
}

async function upsertChunk(db, table, rows, conflict) {
  const { error } = await db.from(table).upsert(rows, { onConflict: conflict, ignoreDuplicates: true });
  if (error) throw new Error(`upsert ${table} : ${error.message}`);
}

function pad(s, n) { return String(s).padEnd(n); }
function padNum(s, n) { return String(s).padStart(n); }

// ----------------------------------------------------------------------------
// Migration d'une table
// ----------------------------------------------------------------------------
async function migrateTable(t) {
  const oldCount = await countRows(oldDb, t.name);
  if (oldCount.error) {
    console.log(`  ⏭️  ${pad(t.name, 24)} ABSENTE côté ancien (${oldCount.error}) — ignorée`);
    return { table: t.name, status: "absent_old", old: null, newBefore: null, newAfter: null };
  }
  const newBefore = await countRows(newDb, t.name);

  if (!DO_RUN) {
    console.log(`  📋 ${pad(t.name, 24)} ancien=${padNum(oldCount.count, 7)}  nouveau=${padNum(newBefore.count ?? "?", 7)}  → à copier ~${padNum(Math.max(0, oldCount.count - (newBefore.count ?? 0)), 7)}`);
    return { table: t.name, status: "planned", old: oldCount.count, newBefore: newBefore.count, newAfter: null };
  }

  // --- Copie réelle, paginée + batchée ---
  let copied = 0;
  for (let from = 0; from < oldCount.count; from += PAGE) {
    const to = Math.min(from + PAGE - 1, oldCount.count - 1);
    const rows = await fetchPage(oldDb, t.name, from, to);
    if (rows.length === 0) break;
    for (let i = 0; i < rows.length; i += CHUNK) {
      await upsertChunk(newDb, t.name, rows.slice(i, i + CHUNK), t.conflict);
    }
    copied += rows.length;
    process.stdout.write(`\r  ⏳ ${pad(t.name, 24)} ${padNum(copied, 7)}/${oldCount.count}`);
  }
  const newAfter = await countRows(newDb, t.name);
  const ok = (newAfter.count ?? 0) >= oldCount.count;
  console.log(`\r  ${ok ? "✅" : "⚠️ "} ${pad(t.name, 24)} ancien=${padNum(oldCount.count, 7)}  nouveau ${padNum(newBefore.count ?? "?", 7)}→${padNum(newAfter.count ?? "?", 7)}`);
  return { table: t.name, status: ok ? "ok" : "mismatch", old: oldCount.count, newBefore: newBefore.count, newAfter: newAfter.count };
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
async function main() {
  console.log("\n=================================================================");
  console.log(`  Migration données Lovable → autonome  ${DO_RUN ? "🚀 MODE RÉEL (--run)" : "🔍 DRY-RUN (lecture seule)"}`);
  console.log("=================================================================");
  console.log(`  ANCIEN  (lecture) : ${OLD_URL}`);
  console.log(`  NOUVEAU (écriture): ${NEW_URL}`);
  if (ONLY) console.log(`  Filtre --only     : ${ONLY.join(", ")}`);
  console.log("-----------------------------------------------------------------");

  const toProcess = TABLES.filter((t) => {
    if (ONLY) return ONLY.includes(t.name);
    return !t.skip;
  });

  // Tables skip non incluses : on les liste pour transparence
  if (!ONLY) {
    for (const t of TABLES.filter((t) => t.skip)) {
      console.log(`  ⚪ ${pad(t.name, 24)} SKIP — ${t.why}`);
    }
    console.log("-----------------------------------------------------------------");
  }

  const results = [];
  for (const t of toProcess) {
    try {
      results.push(await migrateTable(t));
    } catch (e) {
      console.log(`\r  ❌ ${pad(t.name, 24)} ÉCHEC : ${e.message}`);
      results.push({ table: t.name, status: "error", error: e.message });
    }
  }

  console.log("-----------------------------------------------------------------");
  const errs = results.filter((r) => r.status === "error" || r.status === "mismatch");
  if (!DO_RUN) {
    console.log("  ℹ️  DRY-RUN terminé. Relance avec --run pour copier réellement.");
  } else if (errs.length === 0) {
    console.log("  ✅ Migration terminée — tous les comptes nouveau ≥ ancien.");
  } else {
    console.log(`  ⚠️  Terminé avec ${errs.length} table(s) à vérifier : ${errs.map((e) => e.table).join(", ")}`);
  }
  console.log("=================================================================\n");
}

main().catch((e) => fail(e?.message ?? String(e)));
