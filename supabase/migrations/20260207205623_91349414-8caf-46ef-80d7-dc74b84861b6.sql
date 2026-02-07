-- Allow super admins to update notifications (mark as read)
CREATE POLICY "Super admins can update all notifications"
ON public.notifications
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'));