
-- Enums
create type public.app_role as enum ('admin', 'customer');
create type public.order_status as enum ('Pendiente', 'Enviado', 'Entregado', 'Cancelado');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- USER ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

-- has_role function (security definer to avoid recursion)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- updated_at helper
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- handle_new_user trigger creates profile + customer role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- Policies: profiles
create policy "Users view own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Admins view all profiles" on public.profiles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admins update profiles" on public.profiles
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Policies: user_roles
create policy "Users view own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());
create policy "Admins view all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  family text not null,
  gender text not null default 'Unisex',
  notes_text text,
  top_notes text,
  heart_notes text,
  base_notes text,
  description text,
  price numeric(12,2) not null default 0,
  stock integer not null default 0,
  image_url text,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

create policy "Anyone can view active products" on public.products
  for select to anon, authenticated using (active = true or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage products" on public.products
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.tg_set_updated_at();

-- SITE CONTENT (CMS clave/valor)
create table public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant all on public.site_content to service_role;
alter table public.site_content enable row level security;

create policy "Anyone can read site content" on public.site_content
  for select to anon, authenticated using (true);
create policy "Admins manage site content" on public.site_content
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.tg_set_updated_at();

-- PAYMENT METHODS
create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  enabled boolean not null default true,
  instructions text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.payment_methods to anon, authenticated;
grant insert, update, delete on public.payment_methods to authenticated;
grant all on public.payment_methods to service_role;
alter table public.payment_methods enable row level security;

create policy "Anyone can view enabled payment methods" on public.payment_methods
  for select to anon, authenticated using (enabled = true or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage payment methods" on public.payment_methods
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- SHIPPING OPTIONS
create table public.shipping_options (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.shipping_options to anon, authenticated;
grant insert, update, delete on public.shipping_options to authenticated;
grant all on public.shipping_options to service_role;
alter table public.shipping_options enable row level security;

create policy "Anyone can view enabled shipping" on public.shipping_options
  for select to anon, authenticated using (enabled = true or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage shipping options" on public.shipping_options
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text,
  customer_email text,
  address text,
  payment_method text,
  shipping_option text,
  total numeric(12,2) not null default 0,
  status public.order_status not null default 'Pendiente',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;

create policy "Admins manage orders" on public.orders
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.tg_set_updated_at();

-- ORDER ITEMS
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;

create policy "Admins manage order items" on public.order_items
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
