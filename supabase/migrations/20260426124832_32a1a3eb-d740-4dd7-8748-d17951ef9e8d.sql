ALTER TABLE public.admin_orders
  DROP COLUMN total CASCADE,
  DROP COLUMN quantity CASCADE,
  DROP COLUMN unit_price CASCADE,
  DROP COLUMN domain CASCADE,
  DROP COLUMN comment,
  DROP COLUMN currency,
  DROP COLUMN fx_rate_to_chf;