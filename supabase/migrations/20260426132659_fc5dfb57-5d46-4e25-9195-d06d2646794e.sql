-- Nettoyage
DELETE FROM public.products;
DELETE FROM public.services;
DELETE FROM public.shops;

-- Insertion de 5 nouvelles boutiques actives
-- On utilise le user_id du premier propriétaire existant pour respecter NOT NULL
DO $$
DECLARE
  v_owner uuid;
  s1 uuid := gen_random_uuid();
  s2 uuid := gen_random_uuid();
  s3 uuid := gen_random_uuid();
  s4 uuid := gen_random_uuid();
  s5 uuid := gen_random_uuid();
BEGIN
  SELECT user_id INTO v_owner FROM public.user_roles WHERE role = 'shop_owner' LIMIT 1;
  IF v_owner IS NULL THEN
    SELECT id INTO v_owner FROM auth.users LIMIT 1;
  END IF;

  -- Boutique 1 : Artisanat
  INSERT INTO public.shops (id, user_id, name, slug, category, description, city, region, status, subscription_type, contact_phone, contact_whatsapp, contact_email, logo_url)
  VALUES (s1, v_owner, 'Artisanat du Mayo', 'artisanat-du-mayo', 'Artisanat',
    'Pièces artisanales authentiques du Grand-Nord Cameroun : poteries, sculptures et vanneries.',
    'Maroua', 'Extrême-Nord', 'active', 'base', '+237 690 00 00 01', '+237 690 00 00 01', 'mayo@loummel.com', null);

  INSERT INTO public.products (shop_id, name, description, price, category, image_url, sort_order) VALUES
    (s1, 'Calebasse gravée', 'Calebasse traditionnelle gravée à la main', 4500, 'Artisanat', '/placeholder.svg', 1),
    (s1, 'Statuette en bois de rônier', 'Sculpture artisanale en bois de rônier', 12000, 'Artisanat', '/placeholder.svg', 2),
    (s1, 'Panier tressé', 'Panier en fibres végétales tressé main', 3500, 'Artisanat', '/placeholder.svg', 3),
    (s1, 'Poterie peule', 'Pot en terre cuite décoratif', 7000, 'Artisanat', '/placeholder.svg', 4),
    (s1, 'Tabouret sculpté', 'Tabouret traditionnel sculpté', 15000, 'Artisanat', '/placeholder.svg', 5);

  -- Boutique 2 : Artisanat
  INSERT INTO public.shops (id, user_id, name, slug, category, description, city, region, status, subscription_type, contact_phone, contact_whatsapp, contact_email, logo_url)
  VALUES (s2, v_owner, 'Cuirs de Rhumsiki', 'cuirs-de-rhumsiki', 'Artisanat',
    'Maroquinerie artisanale en cuir véritable du Mandara.',
    'Mokolo', 'Extrême-Nord', 'active', 'base', '+237 690 00 00 02', '+237 690 00 00 02', 'rhumsiki@loummel.com', null);

  INSERT INTO public.products (shop_id, name, description, price, category, image_url, sort_order) VALUES
    (s2, 'Sac en cuir tanné', 'Sac à main en cuir véritable', 18000, 'Artisanat', '/placeholder.svg', 1),
    (s2, 'Ceinture brodée', 'Ceinture en cuir avec broderies traditionnelles', 6000, 'Artisanat', '/placeholder.svg', 2),
    (s2, 'Portefeuille cuir', 'Portefeuille en cuir cousu main', 8500, 'Artisanat', '/placeholder.svg', 3),
    (s2, 'Sandales en cuir', 'Sandales artisanales unisexe', 9000, 'Artisanat', '/placeholder.svg', 4),
    (s2, 'Étui téléphone cuir', 'Étui de protection en cuir', 5000, 'Artisanat', '/placeholder.svg', 5);

  -- Boutique 3 : Textiles
  INSERT INTO public.shops (id, user_id, name, slug, category, description, city, region, status, subscription_type, contact_phone, contact_whatsapp, contact_email, logo_url)
  VALUES (s3, v_owner, 'Tissages du Diamaré', 'tissages-du-diamare', 'Textiles',
    'Pagnes, boubous et accessoires en tissus traditionnels.',
    'Maroua', 'Extrême-Nord', 'active', 'base', '+237 690 00 00 03', '+237 690 00 00 03', 'tissages@loummel.com', null);

  INSERT INTO public.products (shop_id, name, description, price, category, image_url, sort_order) VALUES
    (s3, 'Pagne wax 6 yards', 'Pagne imprimé wax authentique', 12000, 'Textiles', '/placeholder.svg', 1),
    (s3, 'Boubou homme brodé', 'Boubou traditionnel avec broderies', 35000, 'Textiles', '/placeholder.svg', 2),
    (s3, 'Robe femme cousue', 'Robe sur-mesure en pagne', 25000, 'Textiles', '/placeholder.svg', 3),
    (s3, 'Foulard en coton', 'Foulard léger en coton tissé', 4500, 'Textiles', '/placeholder.svg', 4),
    (s3, 'Chèche touareg', 'Chèche traditionnel indigo', 7500, 'Textiles', '/placeholder.svg', 5);

  -- Boutique 4 : Textiles
  INSERT INTO public.shops (id, user_id, name, slug, category, description, city, region, status, subscription_type, contact_phone, contact_whatsapp, contact_email, logo_url)
  VALUES (s4, v_owner, 'Mode Sahel Élégance', 'mode-sahel-elegance', 'Textiles',
    'Prêt-à-porter moderne inspiré des motifs sahéliens.',
    'Garoua', 'Nord', 'active', 'base', '+237 690 00 00 04', '+237 690 00 00 04', 'sahel@loummel.com', null);

  INSERT INTO public.products (shop_id, name, description, price, category, image_url, sort_order) VALUES
    (s4, 'Chemise homme en lin', 'Chemise légère pour le climat sahélien', 14000, 'Textiles', '/placeholder.svg', 1),
    (s4, 'Ensemble femme bazin', 'Ensemble haut + jupe en bazin riche', 45000, 'Textiles', '/placeholder.svg', 2),
    (s4, 'Sac bandoulière tissé', 'Sac en tissu wax doublé', 11000, 'Textiles', '/placeholder.svg', 3),
    (s4, 'Casquette wax', 'Casquette mode en pagne wax', 3500, 'Textiles', '/placeholder.svg', 4),
    (s4, 'Tunique enfant', 'Tunique colorée pour enfant 4-10 ans', 6000, 'Textiles', '/placeholder.svg', 5);

  -- Boutique 5 : Électronique
  INSERT INTO public.shops (id, user_id, name, slug, category, description, city, region, status, subscription_type, contact_phone, contact_whatsapp, contact_email, logo_url)
  VALUES (s5, v_owner, 'Wanda Tech Store', 'wanda-tech-store', 'Électronique',
    'Smartphones, accessoires et petit électroménager.',
    'Maroua', 'Extrême-Nord', 'active', 'base', '+237 690 00 00 05', '+237 690 00 00 05', 'wandatech@loummel.com', null);

  INSERT INTO public.products (shop_id, name, description, price, category, image_url, sort_order) VALUES
    (s5, 'Smartphone Tecno Spark', 'Smartphone 128 Go double SIM', 95000, 'Électronique', '/placeholder.svg', 1),
    (s5, 'Écouteurs sans fil', 'Écouteurs Bluetooth avec étui de charge', 12500, 'Électronique', '/placeholder.svg', 2),
    (s5, 'Chargeur rapide 25W', 'Chargeur USB-C compatible Android', 6500, 'Électronique', '/placeholder.svg', 3),
    (s5, 'Power bank 20000 mAh', 'Batterie externe haute capacité', 15000, 'Électronique', '/placeholder.svg', 4),
    (s5, 'Enceinte Bluetooth', 'Enceinte portable avec radio FM', 22000, 'Électronique', '/placeholder.svg', 5);
END $$;