
UPDATE storage.buckets SET public = false WHERE id = 'lead-files';
DROP POLICY IF EXISTS "Public read lead files" ON storage.objects;
