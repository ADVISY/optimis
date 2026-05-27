-- ============================================================================
-- Table notifications + triggers automatiques
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = broadcast tous admins
  type TEXT NOT NULL,
  titre TEXT NOT NULL,
  message TEXT,
  lien TEXT,
  metadata JSONB,
  lu BOOLEAN NOT NULL DEFAULT false,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_lu ON public.notifications(user_id, lu, cree_le DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_global ON public.notifications(cree_le DESC) WHERE user_id IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins read notifs (own or global)" ON public.notifications
    FOR SELECT TO authenticated
    USING (
      public.is_verified_admin()
      AND (user_id IS NULL OR user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins update own notifs" ON public.notifications
    FOR UPDATE TO authenticated
    USING (public.is_verified_admin() AND (user_id IS NULL OR user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins delete own notifs" ON public.notifications
    FOR DELETE TO authenticated
    USING (public.is_verified_admin() AND (user_id IS NULL OR user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- Trigger : notif quand statut_distribution d'une commande change
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_client_name TEXT;
  v_total_qty INTEGER;
BEGIN
  IF OLD.statut_distribution IS DISTINCT FROM NEW.statut_distribution THEN
    SELECT company_name INTO v_client_name FROM admin_clients WHERE id = NEW.client_id;
    SELECT COALESCE(SUM(quantity), 0) INTO v_total_qty FROM admin_order_lines WHERE order_id = NEW.id;

    IF NEW.statut_distribution = 'epuisee' THEN
      INSERT INTO notifications (user_id, type, titre, message, lien, metadata)
      VALUES (
        NULL,
        'commande_livree',
        '✓ Livraison terminée : ' || COALESCE(NEW.order_number, '?'),
        v_total_qty || ' leads livrés à ' || COALESCE(v_client_name, '?'),
        '/admin/commandes',
        jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number, 'client_name', v_client_name)
      );
    ELSIF NEW.statut_distribution = 'expiree' THEN
      INSERT INTO notifications (user_id, type, titre, message, lien, metadata)
      VALUES (
        NULL,
        'commande_expiree',
        '⚠ Commande expirée : ' || COALESCE(NEW.order_number, '?'),
        'La commande de ' || COALESCE(v_client_name, '?') || ' a atteint sa date_fin avec un solde restant.',
        '/admin/commandes',
        jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_notify_order_status_change
    AFTER UPDATE ON public.admin_orders
    FOR EACH ROW EXECUTE FUNCTION public.notify_order_status_change();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
