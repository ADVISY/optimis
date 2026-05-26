-- ============================================================================
-- ⚠️ TEMPORAIRE : Désactivation OTP admin
-- ============================================================================
-- Décision 2026-05-26 : Twilio non configuré sur le nouveau Supabase, on
-- désactive temporairement la vérif OTP pour pouvoir bosser sur le dashboard.
--
-- POUR RÉACTIVER l'OTP plus tard : créer une nouvelle migration qui restaure
-- le code original ci-dessous :
--
--   CREATE OR REPLACE FUNCTION public.is_verified_admin()
--   RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
--     SELECT public.has_role(auth.uid(), 'admin')
--       AND EXISTS (SELECT 1 FROM public.admin_otp_sessions WHERE user_id = auth.uid() AND expires_at > now())
--   $$;
--
-- ET retirer le flag BYPASS_OTP dans src/admin/hooks/useAdminAuth.tsx
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_verified_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;
