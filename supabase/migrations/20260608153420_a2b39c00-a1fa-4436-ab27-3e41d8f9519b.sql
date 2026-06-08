
-- audit_logs: scope policies to authenticated role
DROP POLICY IF EXISTS "Super admins can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Super admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Super admins can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- complaints: scope policies to authenticated role
DROP POLICY IF EXISTS "Users can create complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Super admins can manage complaints" ON public.complaints;
CREATE POLICY "Users can create complaints" ON public.complaints
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = complainant_id);
CREATE POLICY "Users can view their own complaints" ON public.complaints
  FOR SELECT TO authenticated
  USING (auth.uid() = complainant_id);
CREATE POLICY "Super admins can manage complaints" ON public.complaints
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- storage: drop the broad listing/select policy on shop-images.
-- Public file URLs continue to work through the public CDN since the bucket is public.
DROP POLICY IF EXISTS "Anyone can view shop images" ON storage.objects;

-- Revoke EXECUTE on SECURITY DEFINER helpers from anon/public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_assign_role_on_signup() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
