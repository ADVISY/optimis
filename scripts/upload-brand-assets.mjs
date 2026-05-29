// ============================================================================
// Upload des assets de marque Optimis dans Supabase Storage (bucket public)
// ============================================================================
// Crée un bucket "brand" public et y dépose les logos pour usage dans :
//   - Templates email Supabase Auth
//   - Espace courtier
//   - Toute communication transactionnelle
//
// Usage : node scripts/upload-brand-assets.mjs
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SUPABASE_URL = "https://iuuefrxcmrcdbbuyzhqf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dWVmcnhjbXJjZGJidXl6aHFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0NjA2MSwiZXhwIjoyMDk0MzIyMDYxfQ.gmTbJA4TG9e9LoEDqpAqFQCqNW77CwKWIFZ1705KCfE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BUCKET = "brand";

// 1. Crée le bucket s'il n'existe pas (public)
console.log(`📦 Vérification du bucket "${BUCKET}"...`);
const { data: buckets } = await supabase.storage.listBuckets();
const exists = buckets?.some((b) => b.name === BUCKET);
if (!exists) {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "5MB",
  });
  if (error) {
    console.error("❌ Création bucket:", error.message);
    process.exit(1);
  }
  console.log("✓ Bucket créé");
} else {
  console.log("✓ Bucket existe déjà");
}

// 2. Upload des assets
const assets = [
  { local: "public/logo-optimis.png", remote: "logo-optimis.png", type: "image/png" },
  { local: "src/assets/logo.svg", remote: "logo-optimis.svg", type: "image/svg+xml" },
  { local: "src/assets/logo-white.svg", remote: "logo-optimis-white.svg", type: "image/svg+xml" },
];

for (const a of assets) {
  try {
    const file = readFileSync(join(ROOT, a.local));
    const { error } = await supabase.storage.from(BUCKET).upload(a.remote, file, {
      contentType: a.type,
      upsert: true,
    });
    if (error) {
      console.error(`❌ Upload ${a.remote}:`, error.message);
      continue;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(a.remote);
    console.log(`✓ ${a.remote} → ${data.publicUrl}`);
  } catch (e) {
    console.error(`❌ ${a.local}:`, e.message);
  }
}

console.log("\n📋 URLs publiques disponibles pour le template email :");
const { data: list } = await supabase.storage.from(BUCKET).list();
(list ?? []).forEach((f) => {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
  console.log(`  ${f.name.padEnd(30)} ${data.publicUrl}`);
});
