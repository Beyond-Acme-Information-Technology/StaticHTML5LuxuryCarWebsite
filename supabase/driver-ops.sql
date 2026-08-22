-- Run in the Supabase SQL editor (once) so chauffeur roster and sessions persist on Vercel.

create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  phone text not null,
  email text,
  vehicle text,
  license_no text,
  pin_hash text not null,
  active boolean default true,
  notes text
);

create table if not exists driver_sessions (
  token_hash text primary key,
  driver_id uuid references drivers(id) on delete cascade,
  created_at timestamptz default now(),
  expires_at timestamptz not null
);

create index if not exists idx_drivers_phone on drivers(phone);
create index if not exists idx_driver_sessions_driver on driver_sessions(driver_id);

alter table drivers enable row level security;
alter table driver_sessions enable row level security;
