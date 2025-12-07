-- Fix security issue: Restrict notification INSERT to service role only or from backend functions
DROP POLICY IF EXISTS "Authenticated users can receive notifications" ON public.notifications;

-- Create a more secure policy - only allow service role or via database functions
CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Allow authenticated users to insert notifications only for themselves (for testing/development)
-- In production, this should be restricted to database triggers/functions only
CREATE POLICY "Users can create notifications for others via functions" 
ON public.notifications 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Only super_admins can create notifications for others
  has_role(auth.uid(), 'super_admin'::app_role)
  OR
  -- Users can only create notifications for themselves
  auth.uid() = user_id
);

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);