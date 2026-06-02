-- ============================================================
-- ละมุน — Phase 3: caregiver management RPCs (PRD §5a)
-- SECURITY DEFINER so an owner can act on rows RLS would hide
-- (e.g. read a target user by email who isn't yet a caregiver).
-- Each returns an i18n key on failure, or null on success.
-- ============================================================

create or replace function public.is_owner(b uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.baby_caregivers where baby_id = b and user_id = auth.uid() and role = 'owner');
$$;

-- Link an existing user by email. (New-user email invites need an invite-token
-- table + email delivery — Phase 3.x; here we link existing accounts.)
create or replace function public.add_caregiver_by_email(p_baby uuid, p_email text)
returns text language plpgsql security definer set search_path = public as $$
declare
  target uuid;
  n int;
begin
  if not public.is_owner(p_baby) then return 'care.error.notOwner'; end if;
  select count(*) into n from public.baby_caregivers where baby_id = p_baby;
  if n >= 10 then return 'care.error.full'; end if;
  select id into target from public.users where email = lower(p_email);
  if target is null then return 'care.error.noUser'; end if;
  if exists (select 1 from public.baby_caregivers where baby_id = p_baby and user_id = target) then return 'care.error.already'; end if;
  insert into public.baby_caregivers (baby_id, user_id, role) values (p_baby, target, 'caregiver');
  return null;
end;
$$;

-- Owner removes anyone (except the owner); anyone may remove themselves.
create or replace function public.remove_caregiver(p_baby uuid, p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_owner(p_baby) or p_user = auth.uid()) then raise exception 'forbidden'; end if;
  if exists (select 1 from public.baby_caregivers where baby_id = p_baby and user_id = p_user and role = 'owner') then
    raise exception 'cannot remove owner';
  end if;
  delete from public.baby_caregivers where baby_id = p_baby and user_id = p_user;
end;
$$;

-- Owner hands ownership to another caregiver.
create or replace function public.transfer_ownership(p_baby uuid, p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner(p_baby) then raise exception 'forbidden'; end if;
  if not exists (select 1 from public.baby_caregivers where baby_id = p_baby and user_id = p_user) then
    raise exception 'not a caregiver';
  end if;
  update public.baby_caregivers set role = 'caregiver' where baby_id = p_baby and role = 'owner';
  update public.baby_caregivers set role = 'owner' where baby_id = p_baby and user_id = p_user;
  update public.babies set owner_id = p_user where id = p_baby;
end;
$$;
