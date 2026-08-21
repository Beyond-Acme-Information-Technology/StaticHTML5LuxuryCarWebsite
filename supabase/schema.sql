-- Optional. Run in the Supabase SQL editor so the staff inbox survives Vercel deploys.
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
