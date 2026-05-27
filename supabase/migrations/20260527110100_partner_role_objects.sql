-- ============================================================================
-- Espace courtier — étape 2/2 : tables, helpers, RLS
-- ============================================================================

-- 1. Table de liaison user × client (multi-comptes par cabinet possible)
CREATE TABLE IF NOT EXISTS public.partner_user_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.admin_clients(id) ON DELETE CASCADE,
  role_in_company TEXT DEFAULT 'admin', -- 'admin' / 'member' (futur usage)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_partner_user_clients_user ON public.partner_user_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_user_clients_client ON public.partner_user_clients(client_id);

ALTER TABLE public.partner_user_clients ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins manage partner liaisons" ON public.partner_user_clients
    FOR ALL TO authenticated
    USING (public.is_verified_admin())
    WITH CHECK (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Partners read own liaisons" ON public.partner_user_clients
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Helpers PG
CREATE OR REPLACE FUNCTION public.current_user_client_ids()
RETURNS SETOF UUID
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT client_id FROM partner_user_clients WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_partner()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'partner')
$$;

-- 3. RLS partners — accès en lecture seule à leurs données
DO $$ BEGIN
  CREATE POLICY "Partners read own cabinet" ON public.admin_clients
    FOR SELECT TO authenticated
    USING (public.is_partner() AND id IN (SELECT public.current_user_client_ids()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Partners read own orders" ON public.admin_orders
    FOR SELECT TO authenticated
    USING (public.is_partner() AND client_id IN (SELECT public.current_user_client_ids()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Partners read own order lines" ON public.admin_order_lines
    FOR SELECT TO authenticated
    USING (
      public.is_partner()
      AND order_id IN (SELECT id FROM admin_orders WHERE client_id IN (SELECT public.current_user_client_ids()))
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Partners read own invoices" ON public.admin_invoices
    FOR SELECT TO authenticated
    USING (public.is_partner() AND client_id IN (SELECT public.current_user_client_ids()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Partners read own invoice lines" ON public.admin_invoice_lines
    FOR SELECT TO authenticated
    USING (
      public.is_partner()
      AND invoice_id IN (SELECT id FROM admin_invoices WHERE client_id IN (SELECT public.current_user_client_ids()))
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Partners read own distributions" ON public.distributions
    FOR SELECT TO authenticated
    USING (public.is_partner() AND client_id IN (SELECT public.current_user_client_ids()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Partners update own distributions" ON public.distributions
    FOR UPDATE TO authenticated
    USING (public.is_partner() AND client_id IN (SELECT public.current_user_client_ids()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Partners read distributed leads" ON public.leads
    FOR SELECT TO authenticated
    USING (
      public.is_partner()
      AND id IN (SELECT lead_id FROM distributions WHERE client_id IN (SELECT public.current_user_client_ids()))
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Mini-CRM partner — statut commercial sur les distributions
DO $$ BEGIN
  CREATE TYPE public.distribution_statut_commercial AS ENUM (
    'a_traiter', 'contacte', 'rdv_pris', 'devis_envoye', 'signe', 'perdu', 'injoignable'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.distributions
  ADD COLUMN IF NOT EXISTS statut_commercial distribution_statut_commercial DEFAULT 'a_traiter',
  ADD COLUMN IF NOT EXISTS notes_courtier TEXT,
  ADD COLUMN IF NOT EXISTS statut_commercial_mis_a_jour_le TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_distributions_statut_commercial ON public.distributions(statut_commercial);
