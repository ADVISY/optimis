-- Add multi-currency support (CHF / CAD)
ALTER TABLE public.admin_products
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'CHF',
  ADD COLUMN IF NOT EXISTS fx_rate_to_chf numeric NOT NULL DEFAULT 1.0;

ALTER TABLE public.admin_orders
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'CHF',
  ADD COLUMN IF NOT EXISTS fx_rate_to_chf numeric NOT NULL DEFAULT 1.0;

ALTER TABLE public.admin_invoices
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'CHF',
  ADD COLUMN IF NOT EXISTS fx_rate_to_chf numeric NOT NULL DEFAULT 1.0;

-- Restrict allowed currencies
DO $$ BEGIN
  ALTER TABLE public.admin_products
    ADD CONSTRAINT admin_products_currency_check CHECK (currency IN ('CHF','CAD'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.admin_orders
    ADD CONSTRAINT admin_orders_currency_check CHECK (currency IN ('CHF','CAD'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.admin_invoices
    ADD CONSTRAINT admin_invoices_currency_check CHECK (currency IN ('CHF','CAD'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;