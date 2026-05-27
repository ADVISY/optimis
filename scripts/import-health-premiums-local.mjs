// ============================================================================
// Import local des primes LAMal depuis l'OFSP
// ============================================================================
// L'edge function import-health-premiums plante en mémoire avec 229k rows
// (WORKER_RESOURCE_LIMIT). Ce script local fait la même chose en streaming.
//
// Usage: node scripts/import-health-premiums-local.mjs
// ============================================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://iuuefrxcmrcdbbuyzhqf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dWVmcnhjbXJjZGJidXl6aHFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0NjA2MSwiZXhwIjoyMDk0MzIyMDYxfQ.gmTbJA4TG9e9LoEDqpAqFQCqNW77CwKWIFZ1705KCfE";

const PREMIUMS_CSV_URL =
  "https://opendata.bagnet.ch/?r=/download&path=L1ByYWVtaWVuL1Byw6RtaWVuX0NILmNzdg==";

const DEFAULT_INSURERS = {
  "8": "Agrisano", "32": "EGK", "290": "Helsana", "312": "CSS",
  "343": "Vivao Sympany", "376": "Philos", "455": "Groupe Mutuel",
  "509": "Sanitas", "881": "Arcosana", "966": "Sanagate",
  "1384": "Avenir", "1386": "Assura", "1401": "Mutuel Assurance",
  "1479": "Easy Sana", "1509": "Concordia", "1535": "Progrès",
  "1542": "SWICA", "1555": "Compact", "1560": "Visana",
  "1562": "Sana24", "1568": "Atupri", "1587": "KPT",
  "1593": "ÖKK", "1601": "Sympany", "1613": "Aquilana",
  "1668": "Avenir", "1672": "Mutuel Assurance", "1699": "Sanagate",
  "1705": "Compact", "1717": "Easy Sana", "1723": "Sana24",
  "1729": "Arcosana", "1747": "Progrès", "1759": "Steffisburg",
  "1765": "Kolping", "1771": "Rhenusana", "1777": "Sanavals",
  "1783": "SLKK", "1789": "Vivao Sympany", "1795": "Intras",
  "1807": "Moove Sympany", "1819": "AMB Assurances",
  "134": "Einsiedler Krankenkasse", "194": "Sumiswalder Krankenkasse",
  "246": "Krankenkasse Steffisburg", "360": "Krankenkasse Luzerner Hinterland",
  "780": "Glarner Krankenversicherung", "820": "Cassa da malsauns Lumneziana",
  "923": "SLKK", "941": "Sodalis", "1040": "Krankenkasse Visperterminen",
  "1113": "Caisse maladie Vallée d'Entremont", "1318": "Krankenkasse Wädenswil",
  "1322": "Krankenkasse Birchmeier", "1507": "AMB",
};

function getFranchiseAmount(code) {
  const m = String(code).match(/(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headerLine = lines.shift();
  if (!headerLine) return [];
  const sep = headerLine.includes(";") ? ";" : ",";
  const headers = headerLine.split(sep).map((h) => h.trim().replace(/^"|"$/g, ""));
  const records = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split(sep);
    const rec = {};
    for (let i = 0; i < headers.length; i++) {
      rec[headers[i]] = (cols[i] ?? "").trim().replace(/^"|"$/g, "");
    }
    records.push(rec);
  }
  return records;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log("📥 Téléchargement du CSV OFSP...");
const t0 = Date.now();
const response = await fetch(PREMIUMS_CSV_URL, {
  headers: { Accept: "text/csv,*/*", "User-Agent": "OptimisLocalImport/1.0" },
});
if (!response.ok) {
  console.error(`❌ CSV fetch failed: ${response.status}`);
  process.exit(1);
}
const csvText = await response.text();
const sizeMB = (csvText.length / 1024 / 1024).toFixed(1);
console.log(`✓ CSV téléchargé (${sizeMB} MB) en ${((Date.now() - t0) / 1000).toFixed(1)}s`);

console.log("🔍 Parse...");
const t1 = Date.now();
const records = parseCSV(csvText);
console.log(`✓ ${records.length.toLocaleString("fr-CH")} lignes parsées en ${((Date.now() - t1) / 1000).toFixed(1)}s`);

console.log("🗑  Suppression des anciennes primes...");
const { error: delErr } = await supabase.from("health_premiums").delete().gte("id", 0);
if (delErr) {
  console.error("⚠️  Erreur delete:", delErr.message);
}

console.log("📤 Insertion par batches...");
const BATCH = 2000;
let inserted = 0;
let skipped = 0;
const t2 = Date.now();

for (let i = 0; i < records.length; i += BATCH) {
  const batch = records.slice(i, i + BATCH);
  const rows = [];
  for (const record of batch) {
    const premiumValue = record["Prämie"] || record["Praemie"] || "";
    const premium = parseFloat(premiumValue.replace(",", "."));
    if (isNaN(premium) || premium <= 0) { skipped++; continue; }
    const insurerId = record["Versicherer"] || "";
    const franchiseCode = record["Franchise"] || "";
    rows.push({
      canton: record["Kanton"] || "",
      region: record["Region"] || "",
      age_category: record["Altersklasse"] || "",
      franchise_code: franchiseCode,
      franchise_amount: getFranchiseAmount(franchiseCode),
      tarif_type: record["Tariftyp"] || "",
      accident_code: record["Unfalleinschluss"] || "",
      insurer_id: insurerId,
      insurer_name: DEFAULT_INSURERS[insurerId] || `Assureur #${insurerId}`,
      tarif_id: record["Tarif"] || "",
      tarif_name: record["Tarifbezeichnung"] || "",
      premium,
      year: 2026,
    });
  }
  if (rows.length > 0) {
    const { error } = await supabase.from("health_premiums").insert(rows);
    if (error) {
      console.error(`❌ Batch ${i}-${i + BATCH} error:`, error.message);
      break;
    } else {
      inserted += rows.length;
    }
  }
  if (i % 20000 === 0 && i > 0) {
    const pct = ((i / records.length) * 100).toFixed(1);
    process.stdout.write(`\r  ${inserted.toLocaleString("fr-CH")} insérées (${pct}%)`);
  }
}

const elapsed = ((Date.now() - t2) / 1000).toFixed(1);
console.log(`\n✅ Terminé : ${inserted.toLocaleString("fr-CH")} primes insérées en ${elapsed}s`);
if (skipped > 0) console.log(`   (${skipped} lignes ignorées : prime invalide)`);
