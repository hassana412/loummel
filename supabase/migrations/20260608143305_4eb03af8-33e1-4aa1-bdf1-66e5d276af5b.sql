
-- Create Bakaou shop manager user and link to shop
DO $$
DECLARE
  v_user_id uuid;
  v_shop_id uuid;
BEGIN
  -- 1. Create auth user if not exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'bakaou@loummel.com';

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id, 'authenticated', 'authenticated',
      'bakaou@loummel.com',
      crypt('B@k0Kri2026', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Gérant Bakaou"}'::jsonb,
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'bakaou@loummel.com'),
      'email', v_user_id::text, now(), now(), now());
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (v_user_id, 'Gérant Bakaou', 'bakaou@loummel.com')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  -- 2. Assign shop_owner role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'shop_owner')
  ON CONFLICT DO NOTHING;

  -- 3. Create / link shop
  SELECT id INTO v_shop_id FROM public.shops WHERE slug = 'bakaou';
  IF v_shop_id IS NULL THEN
    INSERT INTO public.shops (user_id, slug, name, category, status, region, city)
    VALUES (v_user_id, 'bakaou', 'Bakaou', 'Alimentation', 'active', 'Extrême-Nord', 'Maroua')
    RETURNING id INTO v_shop_id;
  ELSE
    UPDATE public.shops SET user_id = v_user_id WHERE id = v_shop_id AND user_id IS NULL;
  END IF;
END $$;
