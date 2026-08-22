-- Run in the Supabase SQL editor so the staff inbox survives Vercel deploys.
-- Service role bypasses RLS. No anon policies, so the public API cannot read leads.
-- Until this exists, leads still go out by email and are saved locally in data/leads.json.

create table if not exists leads (
  id uuid primary key,
  created_at timestamptz not null default now(),
  type text not null default 'contact',
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'closed')),
  name text,
  email text,
  phone text,
  subject text,
  message text,
  meta jsonb default '{}'::jsonb
);

create index if not exists leads_created_at_idx on leads (created_at desc);

alter table leads enable row level security;

revoke all on table leads from anon, authenticated;
grant all on table leads to service_role;

create index if not exists leads_email_idx on leads (lower(email));

create table if not exists client_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists client_otps_email_idx on client_otps (email, created_at desc);

create table if not exists client_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  email text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists client_sessions_token_idx on client_sessions (token_hash);

alter table client_otps enable row level security;
alter table client_sessions enable row level security;

revoke all on table client_otps from anon, authenticated;
revoke all on table client_sessions from anon, authenticated;
grant all on table client_otps to service_role;
grant all on table client_sessions to service_role;

create table if not exists client_profiles (
  email text primary key,
  name text,
  phone text,
  notes text,
  updated_at timestamptz not null default now()
);

alter table client_profiles enable row level security;
revoke all on table client_profiles from anon, authenticated;
grant all on table client_profiles to service_role;

alter table leads drop constraint if exists leads_status_check;
alter table leads add constraint leads_status_check
  check (status in ('new', 'contacted', 'accepted', 'confirmed', 'cancelled', 'closed'));

create table if not exists pricing_rates (
  country text not null,
  ride_category text not null,
  currency text not null default 'usd',
  base_cents int not null,
  per_mile_cents int not null,
  per_stop_cents int not null,
  wait_per_minute_cents int not null,
  updated_at timestamptz not null default now(),
  primary key (country, ride_category)
);

alter table pricing_rates enable row level security;
revoke all on table pricing_rates from anon, authenticated;
grant all on table pricing_rates to service_role;

insert into pricing_rates (country, ride_category, currency, base_cents, per_mile_cents, per_stop_cents, wait_per_minute_cents)
values
  ('US', 'regular', 'usd', 4500, 450, 1500, 150),
  ('US', 'medical_non_urgent', 'usd', 6500, 525, 2000, 200),
  ('US', 'patient_equipment', 'usd', 8500, 650, 2500, 250)
on conflict (country, ride_category) do nothing;
