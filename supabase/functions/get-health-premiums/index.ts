import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PremiumRequest {
  canton: string;
  postalCode?: string;
  birthYear: number;
  franchise: number;
  model: string;
  withAccident: boolean;
  language?: string;
}

function getAgeCategory(birthYear: number): string {
  const age = new Date().getFullYear() - birthYear;
  if (age <= 18) return "AKL-KIN";
  if (age <= 25) return "AKL-JUG";
  return "AKL-ERW";
}

function getModelCode(model: string): string {
  const mapping: Record<string, string> = {
    'base': 'TAR-BASE', 'standard': 'TAR-BASE',
    'family-doctor': 'TAR-HAM', 'ham': 'TAR-HAM',
    'hmo': 'TAR-HMO', 'telemed': 'TAR-DIV', 'div': 'TAR-DIV',
  };
  return mapping[model.toLowerCase()] || 'TAR-BASE';
}

function getModelName(modelCode: string, language: string = 'fr'): string {
  const models: Record<string, Record<string, string>> = {
    'TAR-BASE': { fr: 'Standard', de: 'Standard', it: 'Standard' },
    'TAR-HAM': { fr: 'Médecin de famille', de: 'Hausarzt', it: 'Medico di famiglia' },
    'TAR-HMO': { fr: 'HMO', de: 'HMO', it: 'HMO' },
    'TAR-DIV': { fr: 'Télémédecine', de: 'Telemedizin', it: 'Telemedicina' },
  };
  return models[modelCode]?.[language] || models[modelCode]?.['fr'] || modelCode;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let params: PremiumRequest;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      params = {
        canton: url.searchParams.get('canton') || '',
        postalCode: url.searchParams.get('postalCode') || undefined,
        birthYear: parseInt(url.searchParams.get('birthYear') || '1990'),
        franchise: parseInt(url.searchParams.get('franchise') || '2500'),
        model: url.searchParams.get('model') || 'base',
        withAccident: url.searchParams.get('withAccident') === 'true',
        language: url.searchParams.get('language') || 'fr',
      };
    } else {
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
    }

    if (!params.canton) {
      return new Response(
        JSON.stringify({ error: 'Canton is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ageCategory = getAgeCategory(params.birthYear);
    const accidentCode = params.withAccident ? "MIT-UNF" : "OHN-UNF";
    const modelCode = params.model === 'all' ? null : getModelCode(params.model);
    const franchiseCode = `FRA-${params.franchise}`;
    const language = params.language || 'fr';

    console.log(`Query: canton=${params.canton}, age=${ageCategory}, franchise=${franchiseCode}, model=${modelCode || 'all'}, accident=${accidentCode}`);

    // Query the database instead of CSV
    // Exclude small regional insurers that aren't actively promoted
    const EXCLUDED_INSURER_IDS = ['134', '194', '246', '360', '780', '820', '923', '941', '1040', '1113', '1318', '1322', '1507'];

    let query = supabase
      .from('health_premiums')
      .select('*')
      .eq('canton', params.canton)
      .eq('age_category', ageCategory)
      .eq('accident_code', accidentCode)
      .eq('franchise_code', franchiseCode)
      .gt('premium', 0)
      .not('insurer_id', 'in', `(${EXCLUDED_INSURER_IDS.join(',')})`)
      .order('premium', { ascending: true })
      .limit(100);

    if (modelCode) {
      query = query.eq('tarif_type', modelCode);
    }

    const { data: rows, error: dbError } = await query;

    if (dbError) {
      console.error('DB error:', dbError.message);
      throw new Error(`Database query failed: ${dbError.message}`);
    }

    // Deduplicate: keep lowest price per insurer+model
    const seen = new Set<string>();
    const premiums = (rows || [])
      .filter(row => {
        const key = `${row.insurer_id}-${row.tarif_type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(row => ({
        insurerId: row.insurer_id,
        insurerName: row.insurer_name || `Assureur #${row.insurer_id}`,
        premium: parseFloat(row.premium),
        model: row.tarif_type,
        modelName: getModelName(row.tarif_type, language),
        franchise: row.franchise_amount,
        withAccident: row.accident_code === 'MIT-UNF',
        region: row.region || '',
        tarifId: row.tarif_id || '',
        tarifName: row.tarif_name || '',
      }));

    console.log(`Found ${premiums.length} premiums`);

    return new Response(
      JSON.stringify({
        success: true,
        params,
        count: premiums.length,
        premiums: premiums.slice(0, 50),
        source: 'OFSP priminfo.admin.ch / opendata.swiss',
        year: 2026,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
