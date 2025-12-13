-- Create audit_logs table for tracking admin actions
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Only super admins can insert audit logs
CREATE POLICY "Super admins can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'));