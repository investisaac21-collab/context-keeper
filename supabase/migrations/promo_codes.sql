-- Promo codes table
create table if not exists promo_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  description text,
  plan text not null default 'pro',
  discount_pct integer default 100,
  max_uses integer default 10,
  current_uses integer default 0,
  expires_at timestamptz,
  active boolean default true,
  created_at timestamptz default now()
);

-- Insert initial promo codes
insert into promo_codes (code, description, plan, discount_pct, max_uses) values
  ('KEEPER2025', 'Código fundadores — 1 mes Pro gratis', 'pro', 100, 50),
  ('ISAACPRO', 'Código personal Isaac — Pro gratis', 'pro', 100, 5),
  ('BETAFRIEND', 'Código amigo beta — Pro gratis', 'pro', 100, 10),
  ('LAUNCH50', 'Lanzamiento — 50% descuento Pro', 'pro', 50, 100)
on conflict (code) do nothing;

-- RLS
alter table promo_codes enable row level security;
create policy "Anyone can read active promo codes" on promo_codes for select using (active = true);

-- Tabla para registrar usos de promo codes
create table if not exists promo_uses (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  user_id uuid references auth.users(id),
  used_at timestamptz default now()
);
alter table promo_uses enable row level security;
create policy "Users can see own uses" on promo_uses for select using (auth.uid() = user_id);
create policy "Users can insert own uses" on promo_uses for insert with check (auth.uid() = user_id);