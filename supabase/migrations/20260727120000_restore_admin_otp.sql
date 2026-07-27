-- ============================================================================
-- 🔐 RÉACTIVATION OTP admin (annule la migration temporaire 20260526100000)
-- ============================================================================
-- Restaure is_verified_admin() avec le contrôle de session OTP.
--
-- ⚠️ NE PAS APPLIQUER tant que Twilio n'est PAS configuré sur ce projet
--    Supabase : sinon les admins ne pourront plus recevoir de code et
--    seront verrouillés hors du dashboard.
--
-- À appliquer EN MÊME TEMPS que le passage de BYPASS_OTP à false dans
-- src/admin/hooks/useAdminAuth.tsx (le front et la RLS doivent être alignés).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_verified_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
    AND EXISTS (
      SELECT 1 FROM public.admin_otp_sessions
      WHERE user_id = auth.uid() AND expires_at > now()
    )
$$;
