
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lead-files', 'lead-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public read lead files"
ON storage.objects FOR SELECT
USING (bucket_id = 'lead-files');

CREATE POLICY "Service role write lead files"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'lead-files');
