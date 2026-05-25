-- ============================================================================
-- Extension canal_type : ajout 'optimis_dashboard' (espace courtier) + 'email'
-- Décision 2026-05-25 : Optimis devient un canal de livraison à part entière
-- (le courtier se logue sur Optimis et voit ses leads dans un espace dédié)
-- ============================================================================

DO $$ BEGIN
  ALTER TYPE public.canal_type ADD VALUE IF NOT EXISTS 'optimis_dashboard';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE public.canal_type ADD VALUE IF NOT EXISTS 'email';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
