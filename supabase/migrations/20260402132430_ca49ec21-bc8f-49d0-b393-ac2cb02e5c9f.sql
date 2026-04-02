
CREATE TABLE public.health_premiums (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  canton TEXT NOT NULL,
  region TEXT,
  age_category TEXT NOT NULL,
  franchise_code TEXT NOT NULL,
  franchise_amount INT NOT NULL,
  tarif_type TEXT NOT NULL,
  accident_code TEXT NOT NULL,
  insurer_id TEXT NOT NULL,
  insurer_name TEXT,
  tarif_id TEXT,
  tarif_name TEXT,
  premium NUMERIC(10,2) NOT NULL,
  year INT NOT NULL DEFAULT 2026,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX idx_health_premiums_search ON public.health_premiums (canton, age_category, franchise_code, tarif_type, accident_code);
CREATE INDEX idx_health_premiums_canton ON public.health_premiums (canton);

-- Allow public read access (no auth needed for price comparison)
ALTER TABLE public.health_premiums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read health premiums" ON public.health_premiums FOR SELECT TO anon, authenticated USING (true);

-- Service role can insert/update (for import function)
CREATE POLICY "Service role can manage premiums" ON public.health_premiums FOR ALL TO service_role USING (true) WITH CHECK (true);
