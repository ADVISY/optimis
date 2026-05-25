-- ============================================================================
-- LEAD DISTRIBUTION ENGINE — Foundation BD + Fonction de routage
-- ============================================================================
-- Phase 2 roadmap Optimis : moteur de distribution multi-canal
-- Décisions appliquées (cf mémoire) :
--   - Mode exclusif (1 lead = 1 courtier)
--   - Modèle prépayé (facturation au lead distribué)
--   - Distribution au fil de l'eau (pas de quota journalier)
--   - Équilibrage pondéré par volume (score = quantity / (leads_recus+1))
--   - Filtre âge > 63 → non distribuable
--   - 2 canaux MVP : google_sheets + lyta_api (+ crm_externe en phase 6)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENRICHISSEMENT admin_orders : période, statut, filtres
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.order_distribution_statut AS ENUM (
    'attente_paiement', 'active', 'en_pause', 'epuisee', 'expiree', 'annulee'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.admin_orders
  ADD COLUMN IF NOT EXISTS date_debut DATE,
  ADD COLUMN IF NOT EXISTS date_fin DATE,
  ADD COLUMN IF NOT EXISTS cantons TEXT[],
  ADD COLUMN IF NOT EXISTS langues TEXT[],
  ADD COLUMN IF NOT EXISTS statut_distribution order_distribution_statut NOT NULL DEFAULT 'attente_paiement';

-- Marquer comme 'active' les commandes liées à une facture payée
UPDATE public.admin_orders
SET statut_distribution = 'active'
WHERE invoice_id IN (SELECT id FROM public.admin_invoices WHERE status = 'payee')
  AND statut_distribution = 'attente_paiement';

-- ----------------------------------------------------------------------------
-- 2. ENRICHISSEMENT admin_order_lines : solde_restant
-- ----------------------------------------------------------------------------
ALTER TABLE public.admin_order_lines
  ADD COLUMN IF NOT EXISTS solde_restant INTEGER NOT NULL DEFAULT 0;

-- Initialiser le solde restant = quantity pour les lignes existantes
UPDATE public.admin_order_lines SET solde_restant = quantity WHERE solde_restant = 0;

-- Ajouter la contrainte (idempotent via DO block)
DO $$ BEGIN
  ALTER TABLE public.admin_order_lines ADD CONSTRAINT check_solde_positif CHECK (solde_restant >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_order_lines_solde ON public.admin_order_lines(order_id) WHERE solde_restant > 0;

-- ----------------------------------------------------------------------------
-- 3. TABLE canaux_livraison
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.canal_type AS ENUM ('google_sheets', 'lyta_api', 'crm_externe');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.canaux_livraison (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.admin_clients(id) ON DELETE CASCADE,
  type canal_type NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_canaux_client_actif ON public.canaux_livraison(client_id) WHERE actif = true;

ALTER TABLE public.canaux_livraison ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Verified admins read canaux" ON public.canaux_livraison FOR SELECT TO authenticated USING (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Verified admins insert canaux" ON public.canaux_livraison FOR INSERT TO authenticated WITH CHECK (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Verified admins update canaux" ON public.canaux_livraison FOR UPDATE TO authenticated USING (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Verified admins delete canaux" ON public.canaux_livraison FOR DELETE TO authenticated USING (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_canaux_livraison_updated BEFORE UPDATE ON public.canaux_livraison FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 4. TABLE leads
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.lead_statut AS ENUM ('nouveau', 'non_distribuable', 'distribue');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.lead_motif_non_dist AS ENUM (
    'age_superieur_63',
    'aucune_commande_eligible',
    'aucun_canal_actif',
    'autre'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_systeme TEXT NOT NULL DEFAULT 'optimis_comparateur',
  source_externe_id TEXT,
  produit TEXT NOT NULL,
  prenom TEXT,
  nom TEXT,
  email TEXT,
  telephone TEXT,
  canton TEXT,
  langue TEXT,
  date_naissance DATE,
  age INTEGER, -- calculé automatiquement par trigger ci-dessous (immutable interdit en GENERATED)
  statut lead_statut NOT NULL DEFAULT 'nouveau',
  motif_non_distribution lead_motif_non_dist,
  donnees_produit JSONB,
  url_page TEXT,
  source_trafic TEXT,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  distribue_le TIMESTAMPTZ
);

-- Trigger qui calcule l'âge à chaque INSERT/UPDATE
-- Priorité : age explicite > donnees_produit.age > calcul depuis date_naissance
CREATE OR REPLACE FUNCTION public.compute_lead_age()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.age IS NULL THEN
    IF NEW.donnees_produit IS NOT NULL AND NEW.donnees_produit ? 'age' THEN
      NEW.age := (NEW.donnees_produit->>'age')::INTEGER;
    ELSIF NEW.date_naissance IS NOT NULL THEN
      NEW.age := EXTRACT(YEAR FROM AGE(CURRENT_DATE, NEW.date_naissance))::INTEGER;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_lead_compute_age
  BEFORE INSERT OR UPDATE OF date_naissance, donnees_produit, age ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.compute_lead_age();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_leads_statut ON public.leads(statut);
CREATE INDEX IF NOT EXISTS idx_leads_produit ON public.leads(produit);
CREATE INDEX IF NOT EXISTS idx_leads_cree_le ON public.leads(cree_le DESC);
CREATE INDEX IF NOT EXISTS idx_leads_canton ON public.leads(canton);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Verified admins read leads" ON public.leads FOR SELECT TO authenticated USING (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Verified admins insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Verified admins update leads" ON public.leads FOR UPDATE TO authenticated USING (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Verified admins delete leads" ON public.leads FOR DELETE TO authenticated USING (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 5. TABLE distributions (log immuable de chaque envoi)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.distribution_statut AS ENUM ('pending', 'envoye', 'echec', 'retry');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.admin_clients(id),
  order_id UUID NOT NULL REFERENCES public.admin_orders(id),
  order_line_id UUID NOT NULL REFERENCES public.admin_order_lines(id),
  canal_id UUID NOT NULL REFERENCES public.canaux_livraison(id),
  statut distribution_statut NOT NULL DEFAULT 'pending',
  payload_envoye JSONB,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  envoye_le TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_distributions_lead ON public.distributions(lead_id);
CREATE INDEX IF NOT EXISTS idx_distributions_client ON public.distributions(client_id);
CREATE INDEX IF NOT EXISTS idx_distributions_order_line ON public.distributions(order_line_id);
CREATE INDEX IF NOT EXISTS idx_distributions_statut ON public.distributions(statut);
CREATE INDEX IF NOT EXISTS idx_distributions_cree_le ON public.distributions(cree_le DESC);

ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Verified admins read distributions" ON public.distributions FOR SELECT TO authenticated USING (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Verified admins manage distributions" ON public.distributions FOR ALL TO authenticated USING (public.is_verified_admin()) WITH CHECK (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 6. FONCTION DE ROUTAGE — route_lead(lead_id)
-- ----------------------------------------------------------------------------
-- Algo central : applique toutes les règles décidées en mémoire :
--   - Filtre âge > 63
--   - Match commandes actives (produit + cantons + langues + fenêtre + solde > 0)
--   - Équilibrage pondéré par volume (score = quantity / (leads_recus + 1))
--   - Décrément atomique du solde + lock anti race condition
--   - Bascule auto en 'epuisee' si solde global = 0
--   - Log dans distributions (statut 'pending' → adapter de livraison s'en chargera)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.route_lead(p_lead_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead leads%ROWTYPE;
  v_winner_order_line_id UUID;
  v_winner_order_id UUID;
  v_winner_client_id UUID;
  v_canal_id UUID;
  v_distribution_id UUID;
BEGIN
  -- Verrouille le lead (anti double-distribution)
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id AND statut = 'nouveau' FOR UPDATE;
  IF NOT FOUND THEN RETURN NULL; END IF;

  -- Filtre âge > 63
  IF v_lead.age IS NOT NULL AND v_lead.age > 63 THEN
    UPDATE leads SET statut = 'non_distribuable', motif_non_distribution = 'age_superieur_63'
    WHERE id = p_lead_id;
    RETURN NULL;
  END IF;

  -- Sélection du gagnant : équilibrage pondéré
  WITH eligibles AS (
    SELECT
      ol.id AS order_line_id,
      o.id AS order_id,
      o.client_id,
      ol.quantity,
      ol.solde_restant,
      (SELECT COUNT(*) FROM distributions d WHERE d.order_line_id = ol.id) AS leads_recus
    FROM admin_order_lines ol
    JOIN admin_orders o ON o.id = ol.order_id
    LEFT JOIN admin_products ap ON ap.id = ol.product_id
    WHERE
      o.statut_distribution = 'active'
      AND ol.solde_restant > 0
      AND (
        ol.domain::text = v_lead.produit
        OR ap.domain::text = v_lead.produit
        OR ol.subcategory = v_lead.produit
      )
      AND (o.date_debut IS NULL OR o.date_debut <= CURRENT_DATE)
      AND (o.date_fin IS NULL OR o.date_fin >= CURRENT_DATE)
      AND (o.cantons IS NULL OR cardinality(o.cantons) = 0 OR v_lead.canton = ANY(o.cantons))
      AND (o.langues IS NULL OR cardinality(o.langues) = 0 OR v_lead.langue = ANY(o.langues))
  )
  SELECT order_line_id, order_id, client_id
  INTO v_winner_order_line_id, v_winner_order_id, v_winner_client_id
  FROM eligibles
  ORDER BY (quantity::numeric / (leads_recus + 1)) DESC, leads_recus ASC
  LIMIT 1;

  IF v_winner_order_line_id IS NULL THEN
    UPDATE leads SET statut = 'non_distribuable', motif_non_distribution = 'aucune_commande_eligible'
    WHERE id = p_lead_id;
    RETURN NULL;
  END IF;

  -- Lock la ligne sélectionnée (anti race avec un autre lead concurrent)
  PERFORM 1 FROM admin_order_lines WHERE id = v_winner_order_line_id AND solde_restant > 0 FOR UPDATE;

  -- Trouve le canal actif du client
  SELECT id INTO v_canal_id
  FROM canaux_livraison
  WHERE client_id = v_winner_client_id AND actif = true
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_canal_id IS NULL THEN
    UPDATE leads SET statut = 'non_distribuable', motif_non_distribution = 'aucun_canal_actif'
    WHERE id = p_lead_id;
    RETURN NULL;
  END IF;

  -- Décrément atomique
  UPDATE admin_order_lines
  SET solde_restant = solde_restant - 1
  WHERE id = v_winner_order_line_id AND solde_restant > 0;

  -- Si tous les soldes de la commande sont à 0 → épuisée
  IF NOT EXISTS (SELECT 1 FROM admin_order_lines WHERE order_id = v_winner_order_id AND solde_restant > 0) THEN
    UPDATE admin_orders SET statut_distribution = 'epuisee' WHERE id = v_winner_order_id;
  END IF;

  -- Log distribution
  INSERT INTO distributions (lead_id, client_id, order_id, order_line_id, canal_id, statut)
  VALUES (p_lead_id, v_winner_client_id, v_winner_order_id, v_winner_order_line_id, v_canal_id, 'pending')
  RETURNING id INTO v_distribution_id;

  UPDATE leads SET statut = 'distribue', distribue_le = now() WHERE id = p_lead_id;

  RETURN v_distribution_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. UTILITAIRE — expirer les commandes dont la date_fin est dépassée
-- À programmer en cron Supabase (pg_cron) : SELECT expire_orders_overdue();
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.expire_orders_overdue()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE admin_orders
  SET statut_distribution = 'expiree'
  WHERE statut_distribution = 'active'
    AND date_fin IS NOT NULL
    AND date_fin < CURRENT_DATE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ============================================================================
-- FIN — On peut maintenant :
--   1. Configurer les canaux_livraison par client (UI à venir 2E)
--   2. Insérer un lead test → SELECT route_lead('<id>')
--   3. Vérifier la distribution dans la table distributions
-- ============================================================================
