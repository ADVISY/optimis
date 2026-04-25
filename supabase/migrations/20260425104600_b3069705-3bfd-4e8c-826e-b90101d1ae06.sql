CREATE TABLE public.admin_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain order_domain NOT NULL,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  avg_cpl NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified admins read products"
ON public.admin_products FOR SELECT TO authenticated
USING (is_verified_admin());

CREATE POLICY "Verified admins insert products"
ON public.admin_products FOR INSERT TO authenticated
WITH CHECK (is_verified_admin());

CREATE POLICY "Verified admins update products"
ON public.admin_products FOR UPDATE TO authenticated
USING (is_verified_admin());

CREATE POLICY "Verified admins delete products"
ON public.admin_products FOR DELETE TO authenticated
USING (is_verified_admin());

CREATE TRIGGER admin_products_set_updated_at
BEFORE UPDATE ON public.admin_products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Verified admins upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND is_verified_admin());

CREATE POLICY "Verified admins update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND is_verified_admin());

CREATE POLICY "Verified admins delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND is_verified_admin());