-- ============================================================
-- ละมุน — Phase 3.5: caregiver invites by email (token flow, PRD §5a)
-- Lets an owner invite someone who doesn't have an account yet:
-- create a token → email a link → invitee signs up/in → accepts → linked.
-- ============================================================

create table if not exists public.caregiver_invites (
  id                  uuid primary key default gen_random_uuid(),
  baby_id             uuid not null references public.babies (id) on delete cascade,
  invited_by_user_id  uuid not null references public.users (id),
  email               text not null,
  token               text not null unique,
  status              text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  created_at          timestamptz not null default now(),
  expires_at          timestamptz not null,
  accepted_by_user_id uuid references public.users (id)
);
create index if not exists invites_token_idx on public.caregiver_invites (token);
create index if not exists invites_baby_status_idx on public.caregiver_invites (baby_id, status);

alter table public.caregiver_invites enable row level security;

-- Owner manages invites for their baby. (Invitee never reads this table directly —
-- acceptance goes through the SECURITY DEFINER RPC below.)
drop policy if exists invites_owner_all on public.caregiver_invites;
create policy invites_owner_all on public.caregiver_invites for all
  using (public.is_owner(baby_id)) with check (public.is_owner(baby_id));

-- Create an invite. Returns the token on success, or a care.error.* key on failure.
create or replace function public.create_caregiver_invite(p_baby uuid, p_email text)
returns text language plpgsql security definer set search_path = public as $$
declare
  tok text;
  n int;
  em text := lower(trim(p_email));
begin
  if not public.is_owner(p_baby) then return 'care.error.notOwner'; end if;
  -- cap counts current caregivers + still-pending invites
  select (select count(*) from public.baby_caregivers where baby_id = p_baby)
       + (select count(*) from public.caregiver_invites where baby_id = p_baby and status = 'pending')
    into n;
  if n >= 10 then return 'care.error.full'; end if;
  if exists (
    select 1 from public.baby_caregivers bc join public.users u on u.id = bc.user_id
    where bc.baby_id = p_baby and u.email = em
  ) then return 'care.error.already'; end if;
  -- reuse an existing pending invite for the same email (idempotent re-send)
  select token into tok from public.caregiver_invites
    where baby_id = p_baby and email = em and status = 'pending' and expires_at > now() limit 1;
  if tok is not null then return tok; end if;
  tok := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into public.caregiver_invites (baby_id, invited_by_user_id, email, token, expires_at)
  values (p_baby, auth.uid(), em, tok, now() + interval '14 days');
  return tok;
end;
$$;

-- Accept an invite as the current user. Returns baby_id on success, or a care.error.* key.
create or replace function public.accept_caregiver_invite(p_token text)
returns text language plpgsql security definer set search_path = public as $$
declare
  inv public.caregiver_invites;
  n int;
begin
  if auth.uid() is null then return 'care.error.generic'; end if;
  select * into inv from public.caregiver_invites where token = p_token;
  if inv.id is null then return 'care.error.invalidInvite'; end if;
  if inv.status <> 'pending' or inv.expires_at < now() then return 'care.error.invalidInvite'; end if;
  -- already a caregiver? mark accepted idempotently.
  if exists (select 1 from public.baby_caregivers where baby_id = inv.baby_id and user_id = auth.uid()) then
    update public.caregiver_invites set status = 'accepted', accepted_by_user_id = auth.uid() where id = inv.id;
    return inv.baby_id::text;
  end if;
  select count(*) into n from public.baby_caregivers where baby_id = inv.baby_id;
  if n >= 10 then return 'care.error.full'; end if;
  insert into public.baby_caregivers (baby_id, user_id, role) values (inv.baby_id, auth.uid(), 'caregiver');
  update public.caregiver_invites set status = 'accepted', accepted_by_user_id = auth.uid() where id = inv.id;
  return inv.baby_id::text;
end;
$$;

-- Owner revokes a pending invite.
create or replace function public.revoke_caregiver_invite(p_invite uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.caregiver_invites set status = 'revoked'
  where id = p_invite and public.is_owner(baby_id) and status = 'pending';
end;
$$;
