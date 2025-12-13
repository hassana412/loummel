-- Mise à jour des images des produits de la boutique Artisanat Rhumsiki
UPDATE products SET image_url = '/src/assets/artisan-jewelry.jpg' 
WHERE id = 'a3462ef1-d961-4117-a008-74ed2b6e58a5';

UPDATE products SET image_url = '/src/assets/artisan-pottery.jpg' 
WHERE id = '19130755-873c-4a68-92a7-2db913be4a46';

UPDATE products SET image_url = '/src/assets/artisan-leather.jpg' 
WHERE id = '9b2d9352-09e6-446c-bd4c-7dc3ca64aaff';

UPDATE products SET image_url = '/src/assets/artisan-jewelry.jpg' 
WHERE id = '97292000-2492-43d2-80f0-8a003733c57f';

UPDATE products SET image_url = '/src/assets/artisan-textiles.jpg' 
WHERE id = '422b2d8f-18d1-4c3c-ab8d-3b1aa6dd9121';

UPDATE products SET image_url = '/src/assets/artisan-pottery.jpg' 
WHERE id = 'b1a24c20-4e4d-4492-b4b0-280a8524018d';

UPDATE products SET image_url = '/src/assets/artisan-textiles.jpg' 
WHERE id = 'e19ff210-5b94-4b6e-8859-013eefebb752';

-- Trigger pour auto-assigner les rôles lors de la création de compte
CREATE OR REPLACE FUNCTION public.auto_assign_role_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Assigner super_admin pour admin@loummel.com
  IF NEW.email = 'admin@loummel.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Assigner partner pour partenaire@loummel.com
  IF NEW.email = 'partenaire@loummel.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'partner')
    ON CONFLICT DO NOTHING;
    -- Créer aussi l'entrée partenaire
    INSERT INTO public.partners (user_id, partnership_type, region, status)
    VALUES (NEW.id, 'commission', 'Extrême-Nord', 'approved')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;

-- Créer le trigger sur auth.users
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_role_on_signup();