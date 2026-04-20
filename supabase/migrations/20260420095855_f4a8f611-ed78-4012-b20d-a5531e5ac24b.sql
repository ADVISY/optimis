GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_verified_admin() TO authenticated;