-- Public bucket for company logo (used in invoice PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public read company-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-assets');

-- Verified admin write
CREATE POLICY "Verified admins upload company-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-assets' AND public.is_verified_admin());

CREATE POLICY "Verified admins update company-assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-assets' AND public.is_verified_admin());

CREATE POLICY "Verified admins delete company-assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-assets' AND public.is_verified_admin());