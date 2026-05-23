-- ================================================================
-- TRACES — Production Schema
-- Migration: 001_initial_schema.sql
-- ================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── USERS ────────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id            uuid primary key default uuid_generate_v4(),
  clerk_id      text unique not null,
  username      text unique not null,
  bio           text,
  profile_image text,
  theme         text default 'default',
  is_onboarded  boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index idx_users_clerk_id   on public.users(clerk_id);
create index idx_users_username   on public.users(username);

-- ─── TRACES ───────────────────────────────────────────────────────────────────
create type trace_category as enum (
  'first_impression',
  'one_word',
  'midnight_thought',
  'something_id_never_say',
  'memory',
  'assumption',
  'compliment',
  'song_reminder',
  'confession',
  'freeform'
);

create type reveal_type as enum ('ghost', 'shadow', 'echo', 'signal');

create type trace_status as enum (
  'pending',       -- in moderation queue
  'delivered',     -- visible to receiver
  'scheduled',     -- awaiting timed delivery
  'shadow_banned', -- hidden from receiver
  'removed'        -- removed post-report
);

create table if not exists public.traces (
  id                 uuid primary key default uuid_generate_v4(),
  receiver_id        uuid not null references public.users(id) on delete cascade,
  content            text not null,
  category           trace_category not null,
  reveal_type        reveal_type not null default 'ghost',
  status             trace_status not null default 'pending',
  scheduled_time     timestamptz,
  sender_fingerprint text,      -- hashed IP+UA, never stored raw
  toxicity_score     float,     -- 0.0–1.0 from moderation service
  song_url           text,      -- spotify link if song trace
  song_note          text,      -- optional note with song
  clue               text,      -- optional clue for echo/shadow modes
  created_at         timestamptz default now()
);

create index idx_traces_receiver_id    on public.traces(receiver_id);
create index idx_traces_status         on public.traces(status);
create index idx_traces_scheduled_time on public.traces(scheduled_time) where status = 'scheduled';
create index idx_traces_fingerprint    on public.traces(sender_fingerprint);

-- ─── TIME CAPSULES ────────────────────────────────────────────────────────────
create type capsule_condition as enum (
  'date',
  'graduation',
  'finals',
  'bad_day',
  'manual',
  'custom'
);

create table if not exists public.time_capsules (
  id               uuid primary key default uuid_generate_v4(),
  trace_id         uuid unique not null references public.traces(id) on delete cascade,
  unlock_date      timestamptz,
  unlock_condition capsule_condition not null default 'date',
  unlocked_at      timestamptz,
  created_at       timestamptz default now()
);

create index idx_capsules_unlock_date on public.time_capsules(unlock_date) where unlocked_at is null;
create index idx_capsules_trace_id    on public.time_capsules(trace_id);

-- ─── REVEAL REQUESTS ──────────────────────────────────────────────────────────
create type reveal_status as enum ('pending', 'accepted', 'declined', 'expired');

create table if not exists public.reveal_requests (
  id                uuid primary key default uuid_generate_v4(),
  trace_id          uuid not null references public.traces(id) on delete cascade,
  receiver_id       uuid not null references public.users(id) on delete cascade,
  sender_fingerprint text,
  status            reveal_status default 'pending',
  responded_at      timestamptz,
  created_at        timestamptz default now()
);

create index idx_reveal_requests_trace_id    on public.reveal_requests(trace_id);
create index idx_reveal_requests_receiver_id on public.reveal_requests(receiver_id);

-- ─── REPORTS ──────────────────────────────────────────────────────────────────
create type report_reason as enum (
  'harassment',
  'hate_speech',
  'sexual_content',
  'spam',
  'self_harm',
  'other'
);

create type report_status as enum ('open', 'reviewed', 'actioned', 'dismissed');

create table if not exists public.reports (
  id          uuid primary key default uuid_generate_v4(),
  trace_id    uuid not null references public.traces(id) on delete cascade,
  reporter_id uuid references public.users(id) on delete set null,
  reason      report_reason not null,
  detail      text,
  status      report_status default 'open',
  reviewed_at timestamptz,
  created_at  timestamptz default now()
);

create index idx_reports_trace_id on public.reports(trace_id);
create index idx_reports_status   on public.reports(status);

-- ─── BLOCKS ───────────────────────────────────────────────────────────────────
create table if not exists public.blocks (
  id          uuid primary key default uuid_generate_v4(),
  blocker_id  uuid not null references public.users(id) on delete cascade,
  -- blocked is a fingerprint hash (anonymous sender) or user id
  blocked_fingerprint text,
  blocked_user_id     uuid references public.users(id) on delete cascade,
  created_at  timestamptz default now(),
  constraint blocks_must_have_target check (
    blocked_fingerprint is not null or blocked_user_id is not null
  )
);

create index idx_blocks_blocker_id on public.blocks(blocker_id);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
create type notification_type as enum (
  'trace_received',
  'capsule_unlocked',
  'reveal_request',
  'song_received',
  'system'
);

create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  type       notification_type not null,
  payload    jsonb default '{}',
  read       boolean default false,
  created_at timestamptz default now()
);

create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_unread  on public.notifications(user_id) where read = false;

-- ─── TRACE VIEWS ──────────────────────────────────────────────────────────────
create table if not exists public.trace_views (
  id         uuid primary key default uuid_generate_v4(),
  trace_id   uuid not null references public.traces(id) on delete cascade,
  viewer_id  uuid references public.users(id) on delete set null,
  viewed_at  timestamptz default now()
);

create index idx_trace_views_trace_id  on public.trace_views(trace_id);

-- ─── RATE LIMIT LOG ───────────────────────────────────────────────────────────
-- Used by the anonymous submission rate limiter
create table if not exists public.rate_limit_log (
  id          uuid primary key default uuid_generate_v4(),
  fingerprint text not null,
  action      text not null,
  created_at  timestamptz default now()
);

create index idx_rate_limit_fingerprint on public.rate_limit_log(fingerprint, action, created_at);

-- ─── SHADOW BANS ──────────────────────────────────────────────────────────────
create table if not exists public.shadow_bans (
  id          uuid primary key default uuid_generate_v4(),
  fingerprint text unique not null,
  reason      text,
  expires_at  timestamptz,
  created_at  timestamptz default now()
);

create index idx_shadow_bans_fingerprint on public.shadow_bans(fingerprint);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ================================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================================

alter table public.users           enable row level security;
alter table public.traces          enable row level security;
alter table public.time_capsules   enable row level security;
alter table public.reveal_requests enable row level security;
alter table public.reports         enable row level security;
alter table public.blocks          enable row level security;
alter table public.notifications   enable row level security;
alter table public.trace_views     enable row level security;
alter table public.rate_limit_log  enable row level security;
alter table public.shadow_bans     enable row level security;

-- Helper: get clerk user id from JWT
create or replace function public.requesting_user_id()
returns text as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ language sql stable;

-- Helper: get internal user id from clerk id
create or replace function public.requesting_internal_id()
returns uuid as $$
  select id from public.users where clerk_id = public.requesting_user_id();
$$ language sql stable;

-- ── USERS ────────────────────────────────────────────────────────────────────
-- Public profiles are readable by all
create policy "users_read_public" on public.users
  for select using (true);

-- Users can only update their own row
create policy "users_update_own" on public.users
  for update using (clerk_id = public.requesting_user_id());

-- Insert handled by server action (service role)
create policy "users_insert_service" on public.users
  for insert with check (true);

-- ── TRACES ───────────────────────────────────────────────────────────────────
-- Receivers can see their delivered traces
create policy "traces_receiver_read" on public.traces
  for select using (
    receiver_id = public.requesting_internal_id()
    and status = 'delivered'
  );

-- Anonymous insert allowed (no auth check), enforced at API layer
create policy "traces_anon_insert" on public.traces
  for insert with check (true);

-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
create policy "notifications_own" on public.notifications
  for all using (user_id = public.requesting_internal_id());

-- ── BLOCKS ────────────────────────────────────────────────────────────────────
create policy "blocks_own" on public.blocks
  for all using (blocker_id = public.requesting_internal_id());

-- ── REPORTS ───────────────────────────────────────────────────────────────────
create policy "reports_insert" on public.reports
  for insert with check (true);

create policy "reports_own_read" on public.reports
  for select using (reporter_id = public.requesting_internal_id());

-- ── RATE LIMIT LOG ───────────────────────────────────────────────────────────
-- Service role only (no user policies)
create policy "rate_limit_service_only" on public.rate_limit_log
  for all using (false);

-- ── SHADOW BANS ──────────────────────────────────────────────────────────────
create policy "shadow_bans_service_only" on public.shadow_bans
  for all using (false);

-- ── TRACE VIEWS ──────────────────────────────────────────────────────────────
create policy "trace_views_insert" on public.trace_views
  for insert with check (true);

create policy "trace_views_receiver_read" on public.trace_views
  for select using (
    exists (
      select 1 from public.traces t
      where t.id = trace_id
      and t.receiver_id = public.requesting_internal_id()
    )
  );

-- ================================================================
-- STORAGE BUCKETS (run via Supabase dashboard or CLI)
-- ================================================================
-- supabase storage create avatars --public
-- supabase storage create song-thumbnails --public
-- supabase storage create memory-wall --public
