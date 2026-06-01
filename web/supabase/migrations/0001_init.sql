-- ============================================================
-- MiNom — Phase 2 schema (Walking Skeleton)
-- Data model per PRD §5a / HANDOFF_dev_01 §4.
-- Built to support N caregivers and all four verbs now, even
-- though only Eat is wired this phase.
-- ============================================================

-- ---------- Tables ----------

-- Mirror of auth.users with the app-facing profile fields.
create table if not exists public.users (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  display_name text not null default 'Caregiver',
  avatar_color text not null default 'oklch(0.58 0.11 60)',
  created_at   timestamptz not null default now()
);

create table if not exists public.babies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  birthdate     date not null,
  photo_url     text,
  sex           text,
  birth_weight  numeric,
  birth_length  numeric,
  owner_id      uuid not null references public.users (id) on delete cascade,
  created_at    timestamptz not null default now()
);

-- baby <-> caregiver, many-to-many (PRD §5a).
create table if not exists public.baby_caregivers (
  baby_id   uuid not null references public.babies (id) on delete cascade,
  user_id   uuid not null references public.users (id) on delete cascade,
  role      text not null default 'caregiver' check (role in ('owner', 'caregiver')),
  joined_at timestamptz not null default now(),
  primary key (baby_id, user_id)
);

create table if not exists public.activity (
  id                 uuid primary key default gen_random_uuid(),
  baby_id            uuid not null references public.babies (id) on delete cascade,
  type               text not null check (type in ('eat', 'sleep', 'diaper')),
  started_at         timestamptz not null default now(),
  ended_at           timestamptz,
  details_json       jsonb not null default '{}'::jsonb,
  logged_by_user_id  uuid not null references public.users (id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists activity_baby_started_idx on public.activity (baby_id, started_at desc);
create index if not exists baby_caregivers_user_idx on public.baby_caregivers (user_id);

-- ---------- Helper functions (SECURITY DEFINER bypasses RLS to avoid
-- policy recursion: babies/activity policies reference baby_caregivers). ----------

create or replace function public.is_caregiver(b uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.baby_caregivers bc
    where bc.baby_id = b and bc.user_id = auth.uid()
  );
$$;

-- Do I share at least one baby with user u? (gates reading a co-caregiver's
-- profile for Timeline attribution — display_name + avatar_color only.)
create or replace function public.shares_baby_with(u uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.baby_caregivers mine
    join public.baby_caregivers theirs on theirs.baby_id = mine.baby_id
    where mine.user_id = auth.uid() and theirs.user_id = u
  );
$$;

-- Atomic baby creation: insert baby + link creator as owner. Returns the baby.
create or replace function public.create_baby(p_name text, p_birthdate date)
returns public.babies
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.babies;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.babies (name, birthdate, owner_id)
  values (p_name, p_birthdate, auth.uid())
  returning * into b;
  insert into public.baby_caregivers (baby_id, user_id, role)
  values (b.id, auth.uid(), 'owner');
  return b;
end;
$$;

-- Keep activity.updated_at fresh on edits.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

drop trigger if exists activity_touch_updated_at on public.activity;
create trigger activity_touch_updated_at
  before update on public.activity
  for each row execute function public.touch_updated_at();

-- Create a public.users profile row whenever an auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, avatar_color)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data ->> 'avatar_color', ''), 'oklch(0.58 0.11 60)')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row-Level Security ----------

alter table public.users enable row level security;
alter table public.babies enable row level security;
alter table public.baby_caregivers enable row level security;
alter table public.activity enable row level security;

-- users: read self + co-caregivers (for attribution); write only self.
drop policy if exists users_select on public.users;
create policy users_select on public.users for select
  using (id = auth.uid() or public.shares_baby_with(id));

drop policy if exists users_insert_self on public.users;
create policy users_insert_self on public.users for insert
  with check (id = auth.uid());

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users for update
  using (id = auth.uid()) with check (id = auth.uid());

-- babies: visible to their caregivers; created with owner_id = me.
drop policy if exists babies_select on public.babies;
create policy babies_select on public.babies for select
  using (public.is_caregiver(id));

drop policy if exists babies_insert on public.babies;
create policy babies_insert on public.babies for insert
  with check (owner_id = auth.uid());

drop policy if exists babies_update on public.babies;
create policy babies_update on public.babies for update
  using (public.is_caregiver(id)) with check (public.is_caregiver(id));

-- baby_caregivers: a caregiver sees the roster for their babies; a user may
-- link themselves (baby creation / invite accept).
drop policy if exists bc_select on public.baby_caregivers;
create policy bc_select on public.baby_caregivers for select
  using (public.is_caregiver(baby_id));

drop policy if exists bc_insert_self on public.baby_caregivers;
create policy bc_insert_self on public.baby_caregivers for insert
  with check (user_id = auth.uid());

-- activity: full CRUD for caregivers of the baby; logger stamped as me.
drop policy if exists activity_select on public.activity;
create policy activity_select on public.activity for select
  using (public.is_caregiver(baby_id));

drop policy if exists activity_insert on public.activity;
create policy activity_insert on public.activity for insert
  with check (public.is_caregiver(baby_id) and logged_by_user_id = auth.uid());

drop policy if exists activity_update on public.activity;
create policy activity_update on public.activity for update
  using (public.is_caregiver(baby_id)) with check (public.is_caregiver(baby_id));

drop policy if exists activity_delete on public.activity;
create policy activity_delete on public.activity for delete
  using (public.is_caregiver(baby_id));

-- ---------- Realtime ----------
-- Stream activity changes to subscribed caregivers (RLS still applies to
-- postgres_changes payloads). Wrapped so re-running the migration is safe.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'activity'
  ) then
    alter publication supabase_realtime add table public.activity;
  end if;
end $$;
