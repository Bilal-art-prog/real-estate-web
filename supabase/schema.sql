-- ══════════════════════════════════════════════════════════════════════
--  Bilal Estate — Supabase / PostgreSQL schema (zero-server option)
--  Run in: Supabase Studio → SQL Editor → New query → paste → Run
-- ══════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── properties ────────────────────────────────────────────────────────
create table if not exists public.properties (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  style         text,
  signature     text,
  materials     jsonb default '[]'::jsonb,
  mood          text,
  society       text not null,
  sector        text,
  city          text not null default 'Islamabad',
  purpose       text not null check (purpose in ('buy','rent','commercial','plot')),
  type          text not null,
  price         bigint not null,
  monthly       boolean default false,
  beds          int default 0,
  baths         int default 0,
  parking       int default 0,
  area          int not null,              -- covered, sq ft
  plot_area     int,                       -- sq ft
  marla         numeric(6,2),
  status        text default 'Available',
  featured      boolean default false,
  premium       boolean default false,
  year          int,
  possession    text,
  furnished     boolean default false,
  lat           numeric(9,6),
  lng           numeric(9,6),
  images        jsonb default '[]'::jsonb,
  poster        text,
  visual_status text default 'concept' check (visual_status in ('concept','verified')),
  description   text,
  highlights    jsonb default '[]'::jsonb,
  amenities     jsonb default '[]'::jsonb,
  floorplan     jsonb default '[]'::jsonb,
  agent_id      uuid,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists properties_purpose_idx on public.properties (purpose);
create index if not exists properties_city_idx    on public.properties (city, society);
create index if not exists properties_price_idx   on public.properties (price desc);

-- ── leads (every contact form / booking modal / quick enquiry) ────────
create table if not exists public.leads (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  phone          text not null,
  email          text,
  interest       text,
  budget         text,
  message        text,
  property_id    uuid references public.properties(id) on delete set null,
  property_title text,
  source         text default 'website',     -- contact_section | booking_modal | property_detail
  status         text default 'new' check (status in ('new','contacted','closed')),
  ip             text,
  user_agent     text,
  created_at     timestamptz default now()
);
create index if not exists leads_status_idx on public.leads (status, created_at desc);

-- ── analytics events (whatsapp_click, call_click, page_view, …) ───────
create table if not exists public.events (
  id             bigint generated always as identity primary key,
  type           text not null,
  page           text,
  placement      text,
  property_id    text,
  property_title text,
  at             timestamptz default now()
);
create index if not exists events_type_idx on public.events (type, at desc);

-- ── content ───────────────────────────────────────────────────────────
create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title      text not null,
  excerpt    text,
  category   text,
  body       jsonb default '[]'::jsonb,
  cover      text,
  author     text default 'Bilal Estate',
  published  boolean default false,
  posted_at  timestamptz default now()
);

create table if not exists public.testimonials (
  id         uuid primary key default gen_random_uuid(),
  quote      text not null,
  name       text,
  meta       text,
  approved   boolean default false,
  sort       int default 0,
  created_at timestamptz default now()
);

create table if not exists public.agents (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text,
  languages  jsonb default '[]'::jsonb,
  phone      text,
  photo      text,
  bio        text,
  speciality text,
  is_owner   boolean default false,
  sort       int default 0
);

create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  url         text not null,
  alt         text,
  sort        int default 0,
  created_at  timestamptz default now()
);

-- ── updated_at trigger ────────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists properties_touch on public.properties;
create trigger properties_touch before update on public.properties
  for each row execute function public.touch_updated_at();

-- ══════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY — this is what keeps a browser-only app safe.
--  anon key = public. It may READ properties/posts and INSERT leads/events.
--  It may NEVER read leads, or write properties. Those need the service key,
--  which stays on a server / edge function / your admin session.
-- ══════════════════════════════════════════════════════════════════════
alter table public.properties    enable row level security;
alter table public.posts         enable row level security;
alter table public.testimonials  enable row level security;
alter table public.agents        enable row level security;
alter table public.leads         enable row level security;
alter table public.events        enable row level security;
alter table public.media         enable row level security;

create policy "public read properties"   on public.properties   for select using (true);
create policy "public read media"        on public.media        for select using (true);
create policy "public read posts"        on public.posts        for select using (published = true);
create policy "public read testimonials" on public.testimonials for select using (approved = true);
create policy "public read agents"       on public.agents       for select using (true);

create policy "public insert leads"  on public.leads  for insert with check (true);
create policy "public insert events" on public.events for insert with check (true);

-- Admin writes: create an authenticated admin user in Supabase Auth, then
-- replace the placeholder below with their uid (or use a custom 'admin' role
-- claim in the JWT).
-- create policy "admin manages properties" on public.properties
--   for all using (auth.uid() in (select id from public.admin_users))
--   with check (auth.uid() in (select id from public.admin_users));

-- ── spam control: reject honeypot-filled submissions at the DB level too ──
alter table public.leads add column if not exists website text;
create or replace function public.reject_honeypot() returns trigger as $$
begin
  if coalesce(new.website, '') <> '' then
    raise exception 'spam';
  end if
  new.website = null;
  return new;
end; $$ language plpgsql;
drop trigger if exists leads_honeypot on public.leads;
create trigger leads_honeypot before insert on public.leads
  for each row execute function public.reject_honeypot();

-- ── notify by email on every new lead (enable after adding your address) ──
-- insert into supabase_functions.migrations (version) values ('1');  -- if needed
-- Create an Edge Function `notify-lead` and attach it with a DB webhook:
--   supabase_functions.http_request(...) → https://<ref>.functions.supabase.co/notify-lead
-- The function should call Resend/Brevo and, optionally, the WhatsApp Cloud API.
