-- Add affiliate_code to shops table
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS affiliate_code TEXT UNIQUE;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT, -- 'new_shop', 'new_partner', 'shop_affiliated', 'shop_validated', 'order'
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert notifications (via service role or triggers)
CREATE POLICY "Authenticated users can receive notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Super admins can view all notifications
CREATE POLICY "Super admins can view all notifications"
ON public.notifications FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create storage bucket for shop images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shop-images', 'shop-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for shop-images bucket
CREATE POLICY "Anyone can view shop images"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-images');

CREATE POLICY "Authenticated users can upload shop images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'shop-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own shop images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'shop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own shop images"
ON storage.objects FOR DELETE
USING (bucket_id = 'shop-images' AND auth.uid()::text = (storage.foldername(name))[1]);