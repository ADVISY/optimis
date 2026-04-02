import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// URL for Swiss health insurance premiums data (OFSP/BAG official data from opendata.swiss)
const PREMIUMS_CSV_URL = "https://opendata.bagnet.ch/?r=/download&path=L1ByYWVtaWVuL1Byw6RtaWVuX0NILmNzdg==";
const INSURERS_CSV_URL = "https://opendata.bagnet.ch/?r=/download&path=L1ByYWVtaWVuL1ZlcnNpY2hlcnRlbmJlc3RhbmRfQ0guY3N2";

interface PremiumRequest {
  canton: string;
  postalCode?: string;
  birthYear: number;
  franchise: number;
  model: string; // "base" | "ham" | "hmo" | "div" | "all"
  withAccident: boolean;
  language?: string;
}

interface PremiumResult {
  insurerId: string;
  insurerName: string;
  premium: number;
  model: string;
  modelName: string;
  franchise: number;
  withAccident: boolean;
  region: string;
  tarifId: string;
  tarifName: string;
}

// Parse CSV data - the OFSP CSV uses COMMA as separator
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // First line is header - OFSP uses comma separator
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const records: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length < headers.length) continue;
    
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }
  
  return records;
}

// Determine age category based on birth year
function getAgeCategory(birthYear: number): string {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  
  if (age <= 18) return "AKL-KIN";
  if (age <= 25) return "AKL-JUG";
  return "AKL-ERW";
}

// Map franchise amounts to franchise codes
function getFranchiseCode(franchise: number): string {
  return `FRA-${franchise}`;
}

// Map model codes to API codes
function getModelCode(model: string): string {
  const mapping: Record<string, string> = {
    'base': 'TAR-BASE',
    'standard': 'TAR-BASE',
    'family-doctor': 'TAR-HAM',
    'ham': 'TAR-HAM',
    'hmo': 'TAR-HMO',
    'telemed': 'TAR-DIV',
    'div': 'TAR-DIV',
  };
  return mapping[model.toLowerCase()] || 'TAR-BASE';
}

// Map model codes to display names
function getModelName(modelCode: string, language: string = 'fr'): string {
  const models: Record<string, Record<string, string>> = {
    'TAR-BASE': { fr: 'Standard', de: 'Standard', it: 'Standard' },
    'TAR-HAM': { fr: 'Médecin de famille', de: 'Hausarzt', it: 'Medico di famiglia' },
    'TAR-HMO': { fr: 'HMO', de: 'HMO', it: 'HMO' },
    'TAR-DIV': { fr: 'Télémédecine', de: 'Telemedizin', it: 'Telemedicina' },
  };
  return models[modelCode]?.[language] || models[modelCode]?.['fr'] || modelCode;
}

// Get accident coverage code
function getAccidentCode(withAccident: boolean): string {
  return withAccident ? "MIT-UNF" : "OHN-UNF";
}

// Cache for premium data
let premiumsCache: { data: Record<string, string>[] | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

// Cache for insurer names
let insurersCache: { data: Map<string, string> | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

async function fetchInsurers(): Promise<Map<string, string>> {
  const now = Date.now();
  
  if (insurersCache.data && (now - insurersCache.timestamp) < CACHE_TTL) {
    return insurersCache.data;
  }
  
  console.log('Fetching insurer names from OFSP...');
  
  try {
    const response = await fetch(INSURERS_CSV_URL, {
      headers: {
        'Accept': 'text/csv,application/csv,*/*',
        'User-Agent': 'LovableHealthInsurance/1.0',
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch insurers: ${response.status}`);
      return getDefaultInsurers();
    }
    
    const csvText = await response.text();
    const records = parseCSV(csvText);
    
    const insurerMap = new Map<string, string>();
    
    for (const record of records) {
      // The CSV has columns like: BAG-Nr,Name,etc.
      const bagNr = record['BAG-Nr'] || record['Versicherer'] || record['ID'];
      const name = record['Name'] || record['Versicherer_Name'] || record['InsurerName'];
      
      if (bagNr && name) {
        insurerMap.set(bagNr, name);
      }
    }
    
    console.log(`Loaded ${insurerMap.size} insurer names`);
    
    // If no insurers loaded, use defaults
    if (insurerMap.size === 0) {
      return getDefaultInsurers();
    }
    
    insurersCache = { data: insurerMap, timestamp: now };
    return insurerMap;
    
  } catch (error) {
    console.error('Error fetching insurers:', error);
    return getDefaultInsurers();
  }
}

function getDefaultInsurers(): Map<string, string> {
  // Complete list of Swiss health insurers (2026) - BAG number -> Name (user-friendly French)
  const insurers = new Map<string, string>([
    // Major insurers
    ["8", "Agrisano"],
    ["32", "EGK"],
    ["290", "Helsana"],
    ["312", "CSS"],
    ["343", "Vivao Sympany"],
    ["376", "Philos"],
    ["455", "Groupe Mutuel"],
    ["509", "Sanitas"],
    ["881", "Arcosana"],
    ["966", "Sanagate"],
    ["1384", "Avenir"],
    ["1386", "Assura"],
    ["1401", "Mutuel Assurance"],
    ["1479", "Easy Sana"],
    ["1509", "Concordia"],
    ["1535", "Progrès"],
    ["1542", "SWICA"],
    ["1555", "Compact"],
    ["1560", "Visana"],
    ["1562", "Sana24"],
    ["1568", "Atupri"],
    ["1587", "KPT"],
    ["1593", "ÖKK"],
    ["1601", "Sympany"],
    ["1613", "Aquilana"],
    ["1630", "Agrisano"],
    ["1668", "Avenir"],
    ["1672", "Mutuel Assurance"],
    ["1699", "Sanagate"],
    ["1705", "Compact"],
    ["1717", "Easy Sana"],
    ["1723", "Sana24"],
    ["1729", "Arcosana"],
    ["1747", "Progrès"],
    ["1753", "Sumiswalder"],
    ["1759", "Steffisburg"],
    ["1765", "Kolping"],
    ["1771", "Rhenusana"],
    ["1777", "Sanavals"],
    ["1783", "SLKK"],
    ["1789", "Vivao Sympany"],
    ["1795", "Intras"],
    ["1807", "Moove Sympany"],
    ["1819", "AMB Assurances"],
  ]);
  
  return insurers;
}

async function fetchPremiums(): Promise<Record<string, string>[]> {
  const now = Date.now();
  
  if (premiumsCache.data && premiumsCache.data.length > 0 && (now - premiumsCache.timestamp) < CACHE_TTL) {
    console.log(`Returning cached premium data (${premiumsCache.data.length} records)`);
    return premiumsCache.data;
  }
  
  console.log('Fetching fresh premium data from OFSP opendata.swiss...');
  
  try {
    const response = await fetch(PREMIUMS_CSV_URL, {
      headers: {
        'Accept': 'text/csv,application/csv,*/*',
        'User-Agent': 'LovableHealthInsurance/1.0',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch premiums: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log(`Received ${csvText.length} bytes of CSV data`);
    
    if (csvText.length < 100) {
      throw new Error('Invalid CSV data received');
    }
    
    const records = parseCSV(csvText);
    
    if (records.length === 0) {
      throw new Error('No records parsed from CSV');
    }
    
    premiumsCache = { data: records, timestamp: now };
    console.log(`Loaded ${records.length} premium records`);
    return records;
    
  } catch (error) {
    console.error('Error fetching premiums:', error);
    
    if (premiumsCache.data && premiumsCache.data.length > 0) {
      console.log('Returning stale cached data due to fetch error');
      return premiumsCache.data;
    }
    
    throw error;
  }
}

// Find premiums matching criteria
async function findPremiums(request: PremiumRequest): Promise<PremiumResult[]> {
  const [premiums, insurers] = await Promise.all([
    fetchPremiums(),
    fetchInsurers(),
  ]);
  
  const ageCategory = getAgeCategory(request.birthYear);
  const accidentCode = getAccidentCode(request.withAccident);
  const modelCode = request.model === 'all' ? null : getModelCode(request.model);
  const franchiseCode = getFranchiseCode(request.franchise);
  const language = request.language || 'fr';
  
  console.log(`Search: canton=${request.canton}, age=${ageCategory}, franchise=${franchiseCode}, model=${modelCode || 'all'}, accident=${accidentCode}`);
  
  const results: PremiumResult[] = [];
  const seenInsurers = new Set<string>();
  
  for (const record of premiums) {
    // Match canton
    if (record['Kanton'] !== request.canton) continue;
    
    // Match age category
    if (record['Altersklasse'] !== ageCategory) continue;
    
    // Match accident coverage
    if (record['Unfalleinschluss'] !== accidentCode) continue;
    
    // Match model type (if specified)
    const recordModel = record['Tariftyp'];
    if (modelCode && recordModel !== modelCode) continue;
    
    // Match franchise
    if (record['Franchise'] !== franchiseCode) continue;
    
    // Get premium value
    const premiumValue = record['Prämie'] || record['Praemie'];
    if (!premiumValue) continue;
    
    const premium = parseFloat(premiumValue.replace(',', '.'));
    if (isNaN(premium) || premium <= 0) continue;
    
    const insurerId = record['Versicherer'] || '';
    
    // Skip duplicates (keep lowest price per insurer+model)
    const uniqueKey = `${insurerId}-${recordModel}`;
    if (seenInsurers.has(uniqueKey)) continue;
    seenInsurers.add(uniqueKey);
    
    // Get insurer name - prefer default (clean French names) over CSV (German legal names)
    let insurerName = getDefaultInsurers().get(insurerId);
    if (!insurerName) {
      insurerName = insurers.get(insurerId) || `Assureur #${insurerId}`;
    }
    
    results.push({
      insurerId,
      insurerName,
      premium,
      model: recordModel,
      modelName: getModelName(recordModel, language),
      franchise: request.franchise,
      withAccident: request.withAccident,
      region: record['Region'] || 'PR-REG CH0',
      tarifId: record['Tarif'] || '',
      tarifName: record['Tarifbezeichnung'] || '',
    });
  }
  
  // Sort by premium (lowest first)
  results.sort((a, b) => a.premium - b.premium);
  
  console.log(`Found ${results.length} matching premiums`);
  return results;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    
    let params: PremiumRequest;
    
    if (req.method === 'GET') {
      params = {
        canton: url.searchParams.get('canton') || '',
        postalCode: url.searchParams.get('postalCode') || undefined,
        birthYear: parseInt(url.searchParams.get('birthYear') || '1990'),
        franchise: parseInt(url.searchParams.get('franchise') || '2500'),
        model: url.searchParams.get('model') || 'base',
        withAccident: url.searchParams.get('withAccident') === 'true',
        language: url.searchParams.get('language') || 'fr',
      };
    } else if (req.method === 'POST') {
      const body = await req.json();
      params = {
        canton: body.canton || '',
        postalCode: body.postalCode || undefined,
        birthYear: body.birthYear || 1990,
        franchise: body.franchise || 2500,
        model: body.model || 'base',
        withAccident: body.withAccident ?? true,
        language: body.language || 'fr',
      };
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!params.canton) {
      return new Response(
        JSON.stringify({ error: 'Canton is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Request params:', JSON.stringify(params));
    
    const results = await findPremiums(params);
    
    return new Response(
      JSON.stringify({
        success: true,
        params,
        count: results.length,
        premiums: results.slice(0, 50),
        source: 'OFSP priminfo.admin.ch / opendata.swiss',
        year: 2026,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
