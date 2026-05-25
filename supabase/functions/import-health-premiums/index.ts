import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PREMIUMS_CSV_URL = "https://opendata.bagnet.ch/?r=/download&path=L1ByYWVtaWVuL1Byw6RtaWVuX0NILmNzdg==";

const DEFAULT_INSURERS: Record<string, string> = {
  "8": "Agrisano", "32": "EGK", "290": "Helsana", "312": "CSS",
  "343": "Vivao Sympany", "376": "Philos", "455": "Groupe Mutuel",
  "509": "Sanitas", "881": "Arcosana", "966": "Sanagate",
  "1384": "Avenir", "1386": "Assura", "1401": "Mutuel Assurance",
  "1479": "Easy Sana", "1509": "Concordia", "1535": "Progrès",
  "1542": "SWICA", "1555": "Compact", "1560": "Visana",
  "1562": "Sana24", "1568": "Atupri", "1587": "KPT",
  "1593": "ÖKK", "1601": "Sympany", "1613": "Aquilana",
  "1630": "Agrisano", "1668": "Avenir", "1672": "Mutuel Assurance",
  "1699": "Sanagate", "1705": "Compact", "1717": "Easy Sana",
  "1723": "Sana24", "1729": "Arcosana", "1747": "Progrès",
  "1753": "Sumiswalder", "1759": "Steffisburg", "1765": "Kolping",
  "1771": "Rhenusana", "1777": "Sanavals", "1783": "SLKK",
  "1789": "Vivao Sympany", "1795": "Intras", "1807": "Moove Sympany",
  "1819": "AMB Assurances",
  // Petites caisses régionales (mapping BAG officiel)
  "134": "Einsiedler Krankenkasse",
  "194": "Sumiswalder Krankenkasse",
  "246": "Krankenkasse Steffisburg",
  "360": "Krankenkasse Luzerner Hinterland",
  "780": "Glarner Krankenversicherung",
  "820": "Cassa da malsauns Lumneziana",
  "923": "SLKK",
  "941": "Sodalis",
  "1040": "Krankenkasse Visperterminen",
  "1113": "Caisse maladie Vallée d'Entremont",
  "1318": "Krankenkasse Wädenswil",
  "1322": "Krankenkasse Birchmeier",
  "1507": "AMB",
};

function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const records: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length < headers.length) continue;
    const record: Record<string, string> = {};
    headers.forEach((header, index) => { record[header] = values[index] || ''; });
    records.push(record);
  }
  return records;
}

function getFranchiseAmount(code: string): number {
  const match = code.match(/FRA-(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = req.method === 'POST' ? await req.json() : {};
    const offset = body.offset || 0;
    const chunkSize = body.chunkSize || 50000;
    const clearFirst = body.clearFirst || false;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log(`Fetching CSV from OFSP (offset=${offset}, chunk=${chunkSize})...`);
    const response = await fetch(PREMIUMS_CSV_URL, {
      headers: { 'Accept': 'text/csv,*/*', 'User-Agent': 'LovableHealthInsurance/1.0' }
    });
    if (!response.ok) throw new Error(`CSV fetch failed: ${response.status}`);
    
    const csvText = await response.text();
    const records = parseCSV(csvText);
    console.log(`Total records: ${records.length}, processing ${offset}-${offset + chunkSize}`);

    if (clearFirst) {
      await supabase.from('health_premiums').delete().gte('id', 0);
      console.log('Cleared existing data');
    }

    const chunk = records.slice(offset, offset + chunkSize);
    let inserted = 0;
    const BATCH = 2000;

    for (let i = 0; i < chunk.length; i += BATCH) {
      const batch = chunk.slice(i, i + BATCH);
      const rows = [];
      for (const record of batch) {
        const premiumValue = record['Prämie'] || record['Praemie'] || '';
        const premium = parseFloat(premiumValue.replace(',', '.'));
        if (isNaN(premium) || premium <= 0) continue;
        const insurerId = record['Versicherer'] || '';
        const franchiseCode = record['Franchise'] || '';
        rows.push({
          canton: record['Kanton'] || '',
          region: record['Region'] || '',
          age_category: record['Altersklasse'] || '',
          franchise_code: franchiseCode,
          franchise_amount: getFranchiseAmount(franchiseCode),
          tarif_type: record['Tariftyp'] || '',
          accident_code: record['Unfalleinschluss'] || '',
          insurer_id: insurerId,
          insurer_name: DEFAULT_INSURERS[insurerId] || `Assureur #${insurerId}`,
          tarif_id: record['Tarif'] || '',
          tarif_name: record['Tarifbezeichnung'] || '',
          premium,
          year: 2026,
        });
      }
      if (rows.length > 0) {
        const { error } = await supabase.from('health_premiums').insert(rows);
        if (error) { console.error(`Batch error:`, error.message); }
        else { inserted += rows.length; }
      }
    }

    const hasMore = offset + chunkSize < records.length;
    const nextOffset = offset + chunkSize;

    console.log(`Chunk done: ${inserted} inserted. hasMore=${hasMore}, nextOffset=${nextOffset}`);

    return new Response(
      JSON.stringify({ success: true, inserted, total: records.length, hasMore, nextOffset }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Import error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
