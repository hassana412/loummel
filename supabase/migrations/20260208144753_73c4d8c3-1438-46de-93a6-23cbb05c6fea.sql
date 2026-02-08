-- Table des réclamations (Ticketing)
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complainant_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('shop', 'product', 'partner', 'order', 'service', 'other')),
  target_id UUID,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all complaints
CREATE POLICY "Super admins can manage complaints"
ON public.complaints
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Users can view their own complaints
CREATE POLICY "Users can view their own complaints"
ON public.complaints
FOR SELECT
USING (auth.uid() = complainant_id);

-- Users can create complaints
CREATE POLICY "Users can create complaints"
ON public.complaints
FOR INSERT
WITH CHECK (auth.uid() = complainant_id);

-- Trigger for updated_at
CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Secure storage policy for shop-images bucket
DROP POLICY IF EXISTS "Authenticated users can upload shop images" ON storage.objects;

CREATE POLICY "Shop owners can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'shop-images' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);