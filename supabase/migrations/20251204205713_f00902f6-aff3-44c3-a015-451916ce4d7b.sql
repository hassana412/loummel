-- Enum pour les rôles
create type public.app_role as enum ('super_admin', 'partner', 'shop_owner');

-- Enum pour les types de partenariat
create type public.partnership_type as enum ('commission', 'forfait');

-- Enum pour les statuts
create type public.entity_status as enum ('pending', 'approved', 'active', 'suspended', 'rejected');

-- Table profiles (liée à auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

-- Table user_roles (sécurité)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Function to check if user has a specific role (SECURITY DEFINER)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- User roles policies
create policy "Users can view their own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

create policy "Super admins can view all roles"
on public.user_roles for select
to authenticated
using (public.has_role(auth.uid(), 'super_admin'));

create policy "Super admins can manage roles"
on public.user_roles for all
to authenticated
using (public.has_role(auth.uid(), 'super_admin'));

-- Table partenaires
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  partnership_type partnership_type not null,
  -- Pour type commission (5-15%)
  base_commission_rate decimal default 0.05,
  current_commission_rate decimal default 0.05,
  -- Pour type forfait
  forfait_amount decimal,
  forfait_start_date date,
  forfait_end_date date,
  forfait_notes text,
  -- Zone de couverture
  region text,
  departments text[] default '{}',
  arrondissements text[] default '{}',
  intercommunautaire boolean default false,
  -- Statistiques
  shops_recruited integer default 0,
  total_commission_earned decimal default 0,
  -- Status
  status entity_status default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on partners
alter table public.partners enable row level security;

-- Partners policies
create policy "Users can view their own partner profile"
on public.partners for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update their own partner profile"
on public.partners for update
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own partner profile"
on public.partners for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Super admins can view all partners"
on public.partners for select
to authenticated
using (public.has_role(auth.uid(), 'super_admin'));

create policy "Super admins can manage partners"
on public.partners for all
to authenticated
using (public.has_role(auth.uid(), 'super_admin'));

-- Table boutiques
create table public.shops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  partner_id uuid references public.partners(id),
  slug text unique not null,
  name text not null,
  description text,
  category text,
  logo_url text,
  is_vip boolean default false,
  subscription_type text default 'base',
  subscription_amount decimal default 5000,
  subscription_expires_at timestamp with time zone,
  -- Options
  has_seo boolean default false,
  has_whatsapp boolean default false,
  has_social boolean default false,
  -- Contact
  contact_phone text,
  contact_whatsapp text,
  contact_email text,
  contact_address text,
  -- Social
  social_facebook text,
  social_instagram text,
  social_tiktok text,
  social_youtube text,
  -- Location
  region text,
  city text,
  -- Status
  status entity_status default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on shops
alter table public.shops enable row level security;

-- Shops policies
create policy "Anyone can view active shops"
on public.shops for select
using (status = 'active');

create policy "Users can view their own shops"
on public.shops for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update their own shops"
on public.shops for update
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own shops"
on public.shops for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Partners can view shops they recruited"
on public.shops for select
to authenticated
using (partner_id in (select id from public.partners where user_id = auth.uid()));

create policy "Partners can insert shops for clients"
on public.shops for insert
to authenticated
with check (
  partner_id in (select id from public.partners where user_id = auth.uid() and status = 'approved')
);

create policy "Super admins can manage all shops"
on public.shops for all
to authenticated
using (public.has_role(auth.uid(), 'super_admin'));

-- Table produits
create table public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  description text,
  price decimal not null,
  image_url text,
  category text,
  is_promo boolean default false,
  promo_price decimal,
  sort_order integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on products
alter table public.products enable row level security;

-- Products policies
create policy "Anyone can view products of active shops"
on public.products for select
using (shop_id in (select id from public.shops where status = 'active'));

create policy "Shop owners can manage their products"
on public.products for all
to authenticated
using (shop_id in (select id from public.shops where user_id = auth.uid()));

create policy "Super admins can manage all products"
on public.products for all
to authenticated
using (public.has_role(auth.uid(), 'super_admin'));

-- Table services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  description text,
  price decimal not null,
  duration text,
  sort_order integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on services
alter table public.services enable row level security;

-- Services policies
create policy "Anyone can view services of active shops"
on public.services for select
using (shop_id in (select id from public.shops where status = 'active'));

create policy "Shop owners can manage their services"
on public.services for all
to authenticated
using (shop_id in (select id from public.shops where user_id = auth.uid()));

create policy "Super admins can manage all services"
on public.services for all
to authenticated
using (public.has_role(auth.uid(), 'super_admin'));

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers for updated_at
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_partners_updated_at before update on public.partners
  for each row execute procedure public.update_updated_at_column();

create trigger update_shops_updated_at before update on public.shops
  for each row execute procedure public.update_updated_at_column();

create trigger update_products_updated_at before update on public.products
  for each row execute procedure public.update_updated_at_column();

create trigger update_services_updated_at before update on public.services
  for each row execute procedure public.update_updated_at_column();