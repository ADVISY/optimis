-- ============================================================================
-- DISTRIBUTION MANUELLE (Habib choisit le courtier au lieu de route_lead auto)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. get_eligible_orders_for_lead — liste les commandes éligibles avec score
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_eligible_orders_for_lead(p_lead_id UUID)
RETURNS TABLE (
  order_line_id UUID,
  order_id UUID,
  order_number TEXT,
  client_id UUID,
  company_name TEXT,
  contact_name TEXT,
  product_name TEXT,
  quantity INTEGER,
  solde_restant INTEGER,
  leads_recus BIGINT,
  score NUMERIC,
  has_active_canal BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead leads%ROWTYPE;
BEGIN
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;
  IF NOT FOUND THEN RETURN; END IF;

  RETURN QUERY
  WITH eligibles AS (
    SELECT
      ol.id AS order_line_id,
      o.id AS order_id,
      o.order_number,
      o.client_id,
      c.company_name,
      c.contact_name,
      ol.product_name,
      ol.quantity,
      ol.solde_restant,
      (SELECT COUNT(*) FROM distributions d WHERE d.order_line_id = ol.id) AS leads_recus,
      EXISTS (SELECT 1 FROM canaux_livraison cl WHERE cl.client_id = o.client_id AND cl.actif = true) AS has_active_canal
    FROM admin_order_lines ol
    JOIN admin_orders o ON o.id = ol.order_id
    JOIN admin_clients c ON c.id = o.client_id
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
  SELECT
    eligibles.order_line_id,
    eligibles.order_id,
    eligibles.order_number,
    eligibles.client_id,
    eligibles.company_name,
    eligibles.contact_name,
    eligibles.product_name,
    eligibles.quantity,
    eligibles.solde_restant,
    eligibles.leads_recus,
    ROUND((eligibles.quantity::numeric / (eligibles.leads_recus + 1)), 2) AS score,
    eligibles.has_active_canal
  FROM eligibles
  ORDER BY score DESC, eligibles.leads_recus ASC;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. distribute_lead_manual — distribue à une ligne de commande choisie
-- ----------------------------------------------------------------------------
-- Même logique que route_lead, mais sans le choix automatique : Habib désigne
-- explicitement l'order_line_id de destination. Toutes les autres vérifs
-- (âge > 63, solde > 0, fenêtre, statut, canal actif) sont conservées.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.distribute_lead_manual(
  p_lead_id UUID,
  p_order_line_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead leads%ROWTYPE;
  v_order_id UUID;
  v_client_id UUID;
  v_solde INTEGER;
  v_statut order_distribution_statut;
  v_canal_id UUID;
  v_distribution_id UUID;
BEGIN
  -- Lock lead
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id AND statut = 'nouveau' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead introuvable ou déjà traité';
  END IF;

  -- Filtre âge > 63 (cohérence avec route_lead)
  IF v_lead.age IS NOT NULL AND v_lead.age > 63 THEN
    UPDATE leads SET statut = 'non_distribuable', motif_non_distribution = 'age_superieur_63'
    WHERE id = p_lead_id;
    RAISE EXCEPTION 'Lead non distribuable : âge > 63';
  END IF;

  -- Lock + récup info de la ligne de commande
  SELECT ol.order_id, o.client_id, ol.solde_restant, o.statut_distribution
  INTO v_order_id, v_client_id, v_solde, v_statut
  FROM admin_order_lines ol
  JOIN admin_orders o ON o.id = ol.order_id
  WHERE ol.id = p_order_line_id
  FOR UPDATE OF ol;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ligne de commande introuvable';
  END IF;

  IF v_statut != 'active' THEN
    RAISE EXCEPTION 'Commande non active (statut: %)', v_statut;
  END IF;

  IF v_solde <= 0 THEN
    RAISE EXCEPTION 'Commande sans solde restant';
  END IF;

  -- Canal actif
  SELECT id INTO v_canal_id
  FROM canaux_livraison
  WHERE client_id = v_client_id AND actif = true
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_canal_id IS NULL THEN
    RAISE EXCEPTION 'Aucun canal de livraison actif pour ce client';
  END IF;

  -- Décrément atomique
  UPDATE admin_order_lines
  SET solde_restant = solde_restant - 1
  WHERE id = p_order_line_id AND solde_restant > 0;

  -- Si tous les soldes de la commande sont à 0 → épuisée
  IF NOT EXISTS (SELECT 1 FROM admin_order_lines WHERE order_id = v_order_id AND solde_restant > 0) THEN
    UPDATE admin_orders SET statut_distribution = 'epuisee' WHERE id = v_order_id;
  END IF;

  -- Log distribution
  INSERT INTO distributions (lead_id, client_id, order_id, order_line_id, canal_id, statut)
  VALUES (p_lead_id, v_client_id, v_order_id, p_order_line_id, v_canal_id, 'pending')
  RETURNING id INTO v_distribution_id;

  UPDATE leads SET statut = 'distribue', distribue_le = now() WHERE id = p_lead_id;

  RETURN v_distribution_id;
END;
$$;
