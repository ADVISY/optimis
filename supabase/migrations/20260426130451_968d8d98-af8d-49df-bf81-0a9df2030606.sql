-- =====================================================
-- 1) admin_orders : ajout colonnes manquantes (header)
-- =====================================================
CREATE SEQUENCE IF NOT EXISTS public.admin_order_number_seq START 1;

ALTER TABLE public.admin_orders
  ADD COLUMN IF NOT EXISTS order_number text
    DEFAULT ('CMD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.admin_order_number_seq')::text, 5, '0')),
  ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES public.admin_invoices(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_admin_orders_invoice ON public.admin_orders(invoice_id);

-- =====================================================
-- 2) admin_order_lines : table enfant (1 commande = N lignes)
--    Chaque ligne fige la hiérarchie produit (catégorie › sous-catégorie › produit)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.admin_orders(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  -- Référence + snapshot produit (figé)
  product_id uuid REFERENCES public.admin_products(id) ON DELETE SET NULL,
  product_name text,
  category text,          -- ex: "assurance_finances"
  subcategory text,       -- ex: "assurance_maladie" (sous-domaine)
  domain order_domain,    -- conservé pour compat
  -- Quantité / prix / devise
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'CHF',
  fx_rate_to_chf numeric(12,6) NOT NULL DEFAULT 1,
  line_total numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_order_lines_order ON public.admin_order_lines(order_id);
CREATE INDEX IF NOT EXISTS idx_admin_order_lines_product ON public.admin_order_lines(product_id);

ALTER TABLE public.admin_order_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified admins read order lines"
  ON public.admin_order_lines FOR SELECT TO authenticated
  USING (is_verified_admin());
CREATE POLICY "Verified admins insert order lines"
  ON public.admin_order_lines FOR INSERT TO authenticated
  WITH CHECK (is_verified_admin());
CREATE POLICY "Verified admins update order lines"
  ON public.admin_order_lines FOR UPDATE TO authenticated
  USING (is_verified_admin());
CREATE POLICY "Verified admins delete order lines"
  ON public.admin_order_lines FOR DELETE TO authenticated
  USING (is_verified_admin());

-- =====================================================
-- 3) admin_invoice_lines : enrichir avec hiérarchie produit
-- =====================================================
ALTER TABLE public.admin_invoice_lines
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.admin_products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS product_name text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS subcategory text;

CREATE INDEX IF NOT EXISTS idx_admin_invoice_lines_product ON public.admin_invoice_lines(product_id);
