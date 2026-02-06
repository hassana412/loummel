-- Create flyers table for homepage advertising
CREATE TABLE public.flyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('promo', 'new_shop', 'deal', 'event')),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_text TEXT NOT NULL DEFAULT 'Voir',
  cta_link TEXT NOT NULL DEFAULT '/recherche',
  badge TEXT,
  discount TEXT,
  end_date TIMESTAMP WITH TIME ZONE,
  gradient TEXT NOT NULL DEFAULT 'from-orange-500 via-red-500 to-pink-500',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.flyers ENABLE ROW LEVEL SECURITY;

-- Everyone can view active flyers
CREATE POLICY "Anyone can view active flyers" 
ON public.flyers 
FOR SELECT 
USING (is_active = true);

-- Super admins can do everything
CREATE POLICY "Super admins can manage flyers" 
ON public.flyers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_flyers_updated_at
BEFORE UPDATE ON public.flyers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some demo flyers
INSERT INTO public.flyers (type, title, subtitle, description, cta_text, cta_link, badge, discount, gradient, sort_order) VALUES
('deal', '🔥 Ventes Flash', 'Jusqu''à -50% sur l''artisanat', 'Profitez de réductions exceptionnelles sur nos produits artisanaux du Nord Cameroun', 'Voir les offres', '/recherche?promo=true', 'FLASH DEAL', '-50%', 'from-red-600 via-orange-500 to-yellow-500', 1),
('new_shop', '✨ Nouvelle Boutique', 'Artisanat Mandara', 'Découvrez les créations uniques de notre nouvel artisan partenaire', 'Découvrir', '/recherche', 'NOUVEAU', NULL, 'from-emerald-600 via-teal-500 to-cyan-500', 2),
('promo', '🎁 Offre Spéciale', 'Livraison gratuite', 'Livraison offerte sur toutes vos commandes à partir de 25 000 FCFA', 'En profiter', '/recherche', 'PROMO', NULL, 'from-violet-600 via-purple-500 to-pink-500', 3),
('event', '🛍️ Pack VIP', '15 000 FCFA/an', 'Boostez votre visibilité avec notre formule VIP premium', 'Devenir VIP', '/inscription-vendeur', 'VIP', NULL, 'from-amber-500 via-yellow-500 to-orange-400', 4);