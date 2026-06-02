-- ============================================================
-- ละมุน — Phase 3: growth measurements (weight + height)
-- Separate from activity (different shape + cadence). WHO curves
-- are rendered client-side; this stores the raw points.
-- ============================================================

create table if not exists public.measurements (
  id                uuid primary key default gen_random_uuid(),
  baby_id           uuid not null references public.babies (id) on delete cascade,
  kind              text not null check (kind in ('weight', 'height')),
  value             numeric not null,                 -- weight kg / height cm (metric, PRD v0.3)
  measured_at       timestamptz not null default now(),
  logged_by_user_id uuid not null references public.users (id),
  created_at        timestamptz not null default now()
);

create index if not exists measurements_baby_idx on public.measurements (baby_id, kind, measured_at);

alter table public.measurements enable row level security;

drop policy if exists measurements_select on public.measurements;
create policy measurements_select on public.measurements for select
  using (public.is_caregiver(baby_id));

drop policy if exists measurements_insert on public.measurements;
create policy measurements_insert on public.measurements for insert
  with check (public.is_caregiver(baby_id) and logged_by_user_id = auth.uid());

drop policy if exists measurements_delete on public.measurements;
create policy measurements_delete on public.measurements for delete
  using (public.is_caregiver(baby_id));
