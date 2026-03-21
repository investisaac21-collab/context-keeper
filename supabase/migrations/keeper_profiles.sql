-- Migration: crear tabla keeper_profiles
-- Ejecutar en Supabase Dashboard > SQL Editor

create table if not exists keeper_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role text,
  tone text,
  rules text[] default '{}',
  extra text,
  emoji text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table keeper_profiles enable row level security;

create policy "Users can view own profiles"
  on keeper_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profiles"
  on keeper_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profiles"
  on keeper_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete own profiles"
  on keeper_profiles for delete
  using (auth.uid() = user_id);
