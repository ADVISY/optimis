-- Table singleton de paramètres entreprise
CREATE TABLE IF NOT EXISTS public.admin_company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'OptimisLink Sàrl',
  address_line1 text NOT NULL DEFAULT 'Route de la Gare 1',
  address_line2 text,
  postal_code text NOT NULL DEFAULT '1009',
  city text NOT NULL DEFAULT 'Pully',
  country text NOT NULL DEFAULT 'CH',
  iban_qr text NOT NULL DEFAULT 'CH4431999123000889012',
  vat_number text,
  default_vat_rate numeric NOT NULL DEFAULT 8.10,
  contact_email text,
  contact_phone text,
  invoice_footer text DEFAULT 'Merci pour votre confiance.',
  payment_terms_days integer NOT NULL DEFAULT 30,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified admins read company settings"
  ON public.admin_company_settings FOR SELECT TO authenticated
  USING (is_verified_admin());

CREATE POLICY "Verified admins insert company settings"
  ON public.admin_company_settings FOR INSERT TO authenticated
  WITH CHECK (is_verified_admin());

CREATE POLICY "Verified admins update company settings"
  ON public.admin_company_settings FOR UPDATE TO authenticated
  USING (is_verified_admin());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_admin_company_settings_touch ON public.admin_company_settings;
CREATE TRIGGER trg_admin_company_settings_touch
  BEFORE UPDATE ON public.admin_company_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Singleton initial
INSERT INTO public.admin_company_settings (company_name)
SELECT 'OptimisLink Sàrl'
WHERE NOT EXISTS (SELECT 1 FROM public.admin_company_settings);

-- Bucket storage pour les PDFs de factures
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Verified admins read invoice PDFs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'invoices' AND is_verified_admin());

CREATE POLICY "Verified admins write invoice PDFs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'invoices' AND is_verified_admin());

CREATE POLICY "Verified admins update invoice PDFs"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'invoices' AND is_verified_admin());

CREATE POLICY "Verified admins delete invoice PDFs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'invoices' AND is_verified_admin());