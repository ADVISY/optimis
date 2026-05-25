DROP POLICY IF EXISTS "Public read company-assets" ON storage.objects;

CREATE POLICY "Public read company-assets logo"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'company-assets'
  AND (storage.foldername(name))[1] = 'logo'
);