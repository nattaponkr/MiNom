-- ============================================================
-- ละมุน — Phase 3.5: invite preview (for the accept page UI)
-- Lets the (not-yet-caregiver) invitee read just enough to render the
-- landing page — the invited email + inviter/baby names — for a valid
-- pending token only. SECURITY DEFINER because RLS otherwise hides the row.
-- ============================================================

create or replace function public.invite_preview(p_token text)
returns table(email text, inviter text, baby text)
language sql security definer set search_path = public stable as $$
  select i.email,
         coalesce(u.display_name, 'ครอบครัว') as inviter,
         coalesce(b.name, 'ลูก') as baby
  from public.caregiver_invites i
  left join public.users u on u.id = i.invited_by_user_id
  left join public.babies b on b.id = i.baby_id
  where i.token = p_token and i.status = 'pending' and i.expires_at > now();
$$;
