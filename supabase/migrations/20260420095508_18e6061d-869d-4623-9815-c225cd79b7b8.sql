-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.client_status AS ENUM ('actif', 'inactif');
CREATE TYPE public.order_domain AS ENUM ('assurance_maladie', 'lpp', 'hypotheque', 'telecom', 'energie', 'autre');
CREATE TYPE public.invoice_status AS ENUM ('brouillon', 'envoyee', 'payee', 'en_attente');

-- ============================================================================
-- USER ROLES (separate table)
-- ============================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============================================================================
-- ADMIN PROFILES
-- ============================================================================
CREATE TABLE public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_e164 TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ADMIN OTP SESSIONS
-- ============================================================================
CREATE TABLE public.admin_otp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes'),
  ip_address TEXT,
  user_agent TEXT
);
ALTER TABLE public.admin_otp_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_admin_otp_sessions_user ON public.admin_otp_sessions(user_id, expires_at DESC);

CREATE OR REPLACE FUNCTION public.is_verified_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
    AND EXISTS (SELECT 1 FROM public.admin_otp_sessions WHERE user_id = auth.uid() AND expires_at > now())
$$;

-- ============================================================================
-- CLIENTS
-- ============================================================================
CREATE TABLE public.admin_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  status client_status NOT NULL DEFAULT 'actif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_clients ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_admin_clients_status ON public.admin_clients(status);
CREATE INDEX idx_admin_clients_created ON public.admin_clients(created_at DESC);

-- ============================================================================
-- ORDERS
-- ============================================================================
CREATE TABLE public.admin_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.admin_clients(id) ON DELETE RESTRICT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  domain order_domain NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  total NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_admin_orders_client ON public.admin_orders(client_id);
CREATE INDEX idx_admin_orders_date ON public.admin_orders(order_date DESC);
CREATE INDEX idx_admin_orders_domain ON public.admin_orders(domain);

-- ============================================================================
-- INVOICES
-- ============================================================================
CREATE SEQUENCE public.admin_invoice_number_seq START 1001;

CREATE TABLE public.admin_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE DEFAULT ('OPT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.admin_invoice_number_seq')::text, 5, '0')),
  client_id UUID NOT NULL REFERENCES public.admin_clients(id) ON DELETE RESTRICT,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL DEFAULT (CURRENT_DATE + interval '30 days'),
  status invoice_status NOT NULL DEFAULT 'brouillon',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_rate NUMERIC(5,2) NOT NULL DEFAULT 8.10,
  vat_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_invoices ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_admin_invoices_client ON public.admin_invoices(client_id);
CREATE INDEX idx_admin_invoices_status ON public.admin_invoices(status);
CREATE INDEX idx_admin_invoices_date ON public.admin_invoices(invoice_date DESC);

CREATE TABLE public.admin_invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.admin_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_invoice_lines ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_admin_invoice_lines_invoice ON public.admin_invoice_lines(invoice_id);

-- ============================================================================
-- TIMESTAMP TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_admin_profiles_updated BEFORE UPDATE ON public.admin_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_admin_clients_updated BEFORE UPDATE ON public.admin_clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_admin_orders_updated BEFORE UPDATE ON public.admin_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_admin_invoices_updated BEFORE UPDATE ON public.admin_invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
CREATE POLICY "Verified admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_verified_admin());

CREATE POLICY "Verified admins read profiles" ON public.admin_profiles FOR SELECT TO authenticated USING (public.is_verified_admin());
CREATE POLICY "Admins update own profile" ON public.admin_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own OTP sessions" ON public.admin_otp_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own OTP sessions" ON public.admin_otp_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Verified admins read clients" ON public.admin_clients FOR SELECT TO authenticated USING (public.is_verified_admin());
CREATE POLICY "Verified admins insert clients" ON public.admin_clients FOR INSERT TO authenticated WITH CHECK (public.is_verified_admin());
CREATE POLICY "Verified admins update clients" ON public.admin_clients FOR UPDATE TO authenticated USING (public.is_verified_admin());
CREATE POLICY "Verified admins delete clients" ON public.admin_clients FOR DELETE TO authenticated USING (public.is_verified_admin());

CREATE POLICY "Verified admins read orders" ON public.admin_orders FOR SELECT TO authenticated USING (public.is_verified_admin());
CREATE POLICY "Verified admins insert orders" ON public.admin_orders FOR INSERT TO authenticated WITH CHECK (public.is_verified_admin());
CREATE POLICY "Verified admins update orders" ON public.admin_orders FOR UPDATE TO authenticated USING (public.is_verified_admin());
CREATE POLICY "Verified admins delete orders" ON public.admin_orders FOR DELETE TO authenticated USING (public.is_verified_admin());

CREATE POLICY "Verified admins read invoices" ON public.admin_invoices FOR SELECT TO authenticated USING (public.is_verified_admin());
CREATE POLICY "Verified admins insert invoices" ON public.admin_invoices FOR INSERT TO authenticated WITH CHECK (public.is_verified_admin());
CREATE POLICY "Verified admins update invoices" ON public.admin_invoices FOR UPDATE TO authenticated USING (public.is_verified_admin());
CREATE POLICY "Verified admins delete invoices" ON public.admin_invoices FOR DELETE TO authenticated USING (public.is_verified_admin());

CREATE POLICY "Verified admins read invoice lines" ON public.admin_invoice_lines FOR SELECT TO authenticated USING (public.is_verified_admin());
CREATE POLICY "Verified admins insert invoice lines" ON public.admin_invoice_lines FOR INSERT TO authenticated WITH CHECK (public.is_verified_admin());
CREATE POLICY "Verified admins update invoice lines" ON public.admin_invoice_lines FOR UPDATE TO authenticated USING (public.is_verified_admin());
CREATE POLICY "Verified admins delete invoice lines" ON public.admin_invoice_lines FOR DELETE TO authenticated USING (public.is_verified_admin());

-- ============================================================================
-- SEED INITIAL ADMIN + DEMO DATA
-- ============================================================================
DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_client1 UUID;
  v_client2 UUID;
  v_client3 UUID;
  v_client4 UUID;
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'lesiteoptimis@gmail.com', crypt('ChangeMe2026!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin Optimis"}'::jsonb,
    false, '', '', '', ''
  );

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    gen_random_uuid(), v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', 'lesiteoptimis@gmail.com', 'email_verified', true),
    'email', v_user_id::text, now(), now(), now()
  );

  INSERT INTO public.admin_profiles (user_id, email, full_name, phone_e164, is_active)
  VALUES (v_user_id, 'lesiteoptimis@gmail.com', 'Admin Optimis', '+41782122360', true);

  INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin');

  -- Demo clients (no RETURNING since multi-row insert)
  INSERT INTO public.admin_clients (company_name, contact_name, email, phone, address, status, notes) VALUES
    ('Assurance Helvetia SA', 'Marc Dubois', 'm.dubois@helvetia-demo.ch', '+41 21 555 12 34', 'Rue du Lac 12, 1003 Lausanne', 'actif', 'Client premium - leads santé'),
    ('Crédit Suisse Partners', 'Sophie Müller', 's.muller@cs-partners-demo.ch', '+41 44 333 22 11', 'Bahnhofstrasse 8, 8001 Zürich', 'actif', 'Hypothèques exclusivement'),
    ('Allianz Suisse', 'Pierre Favre', 'p.favre@allianz-demo.ch', '+41 22 444 55 66', 'Rue de Genève 45, 1201 Genève', 'actif', NULL),
    ('Sunrise UPC Business', 'Laura Bianchi', 'l.bianchi@sunrise-demo.ch', '+41 91 222 11 33', 'Via Lugano 5, 6900 Lugano', 'inactif', 'Pause contractuelle');

  SELECT id INTO v_client1 FROM public.admin_clients WHERE company_name = 'Assurance Helvetia SA';
  SELECT id INTO v_client2 FROM public.admin_clients WHERE company_name = 'Crédit Suisse Partners';
  SELECT id INTO v_client3 FROM public.admin_clients WHERE company_name = 'Allianz Suisse';
  SELECT id INTO v_client4 FROM public.admin_clients WHERE company_name = 'Sunrise UPC Business';

  INSERT INTO public.admin_orders (client_id, order_date, domain, quantity, unit_price, comment) VALUES
    (v_client1, CURRENT_DATE - 2, 'assurance_maladie', 50, 35.00, 'Livraison janvier'),
    (v_client1, CURRENT_DATE - 10, 'assurance_maladie', 80, 35.00, NULL),
    (v_client2, CURRENT_DATE - 5, 'hypotheque', 25, 120.00, 'Leads qualifiés Romandie'),
    (v_client2, CURRENT_DATE - 15, 'hypotheque', 30, 120.00, NULL),
    (v_client3, CURRENT_DATE - 7, 'lpp', 15, 85.00, 'Suisse alémanique'),
    (v_client3, CURRENT_DATE - 20, 'assurance_maladie', 40, 35.00, NULL),
    (v_client4, CURRENT_DATE - 30, 'telecom', 100, 18.00, 'Volume mensuel');

  INSERT INTO public.admin_invoices (client_id, invoice_date, due_date, status, subtotal, vat_amount, total, notes, paid_at) VALUES
    (v_client1, CURRENT_DATE - 5, CURRENT_DATE + 25, 'envoyee', 4550.00, 368.55, 4918.55, 'Leads janvier 2026', NULL),
    (v_client2, CURRENT_DATE - 12, CURRENT_DATE + 18, 'payee', 6600.00, 534.60, 7134.60, NULL, CURRENT_DATE - 2),
    (v_client3, CURRENT_DATE - 3, CURRENT_DATE + 27, 'en_attente', 2675.00, 216.68, 2891.68, NULL, NULL),
    (v_client1, CURRENT_DATE, CURRENT_DATE + 30, 'brouillon', 1750.00, 141.75, 1891.75, 'Brouillon en cours', NULL);
END $$;