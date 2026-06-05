-- Remove public read access to OTP verifications (codes/phones must never be readable from the client)
DROP POLICY IF EXISTS "Anonymous can read own OTP by id" ON public.otp_verifications;

-- Restrict SECURITY DEFINER function execution from public/anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_verified_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_verified_admin() TO authenticated;