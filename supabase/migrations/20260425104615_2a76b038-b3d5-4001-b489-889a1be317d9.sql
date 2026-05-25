-- Remplacer la policy SELECT large par une plus restreinte qui empêche le listing
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;

-- Lecture publique d'un fichier précis (par bucket+name) mais pas de listing
CREATE POLICY "Public read product images by name"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'product-images' AND name IS NOT NULL);