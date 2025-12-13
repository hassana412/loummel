-- Assign shop_owner role to rhumsiki@loummel.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('6691c254-1710-473c-85d6-f4389a64530c', 'shop_owner')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create VIP shop "Artisanat Rhumsiki"
INSERT INTO public.shops (
  id, user_id, name, slug, description, category, region, city,
  status, is_vip, affiliate_code, subscription_type, subscription_amount,
  contact_phone, contact_whatsapp, contact_email, contact_address,
  social_facebook, social_instagram, social_tiktok,
  has_whatsapp, has_social, has_seo
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '6691c254-1710-473c-85d6-f4389a64530c',
  'Artisanat Rhumsiki',
  'artisanat-rhumsiki',
  'Découvrez l''artisanat authentique du Nord Cameroun. Bijoux Fulani, poteries traditionnelles, maroquinerie artisanale et textiles tissés à la main par nos maîtres artisans de Rhumsiki.',
  'Artisanat',
  'Extrême-Nord',
  'Rhumsiki',
  'active',
  true,
  'LM-RHUM01',
  'vip',
  15000,
  '+237 6 99 12 34 56',
  '+237 6 99 12 34 56',
  'contact@artisanat-rhumsiki.cm',
  'Quartier Artisans, Rhumsiki, Extrême-Nord, Cameroun',
  'https://facebook.com/artisanatrhumsiki',
  'https://instagram.com/artisanat_rhumsiki',
  'https://tiktok.com/@artisanatrhumsiki',
  true, true, true
);

-- Insert 7 products
INSERT INTO public.products (shop_id, name, description, price, is_promo, promo_price, category, sort_order) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Collier Fulani traditionnel', 'Collier en perles et cuivre fabriqué selon les techniques ancestrales Fulani. Pièce unique symbolisant la richesse culturelle du Sahel.', 25000, true, 20000, 'Bijoux', 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Poterie Rhumsiki décorative', 'Vase en terre cuite orné de motifs géométriques traditionnels. Façonné à la main par nos potières expertes.', 15000, false, null, 'Poterie', 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sac en cuir tressé artisanal', 'Sac à bandoulière en cuir tanné naturellement avec tressage traditionnel. Robuste et élégant.', 35000, false, null, 'Maroquinerie', 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bracelet en cuivre martelé', 'Bracelet ajustable en cuivre pur, martelé à la main avec motifs Sahéliens. Unisexe.', 8000, true, 6500, 'Bijoux', 4),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tapis tissé traditionnel', 'Tapis en fibres naturelles tissé sur métier traditionnel. Motifs géométriques typiques du Nord Cameroun. Dimensions: 150x100cm.', 45000, false, null, 'Textiles', 5),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sculpture bois Rhumsiki', 'Statuette en bois d''ébène sculpté représentant les pics volcaniques de Rhumsiki. Hauteur: 30cm.', 28000, false, null, 'Sculpture', 6),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Boubou brodé homme', 'Grand boubou en bazin riche avec broderies traditionnelles faites main. Taille unique ajustable.', 55000, true, 48000, 'Textiles', 7);

-- Insert 4 services
INSERT INTO public.services (shop_id, name, description, price, duration, sort_order) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Création bijoux sur mesure', 'Conception et réalisation de bijoux personnalisés selon vos envies. Consultation préalable incluse.', 50000, '2-3 semaines', 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Visite atelier artisanal', 'Découverte guidée de notre atelier avec démonstrations des techniques traditionnelles. Durée: 2h.', 5000, '2 heures', 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Formation tissage traditionnel', 'Initiation au tissage sur métier traditionnel. Session individuelle ou en groupe (max 4 personnes).', 25000, '1 journée', 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Gravure personnalisée', 'Gravure de noms, dates ou motifs sur nos créations en cuivre ou bois. Idéal pour cadeaux personnalisés.', 3000, '30 minutes', 4);