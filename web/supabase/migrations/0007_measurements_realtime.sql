-- ============================================================
-- #15 — Growth chart real-time re-plot.
-- The WHO percentile chart re-plots when a peer adds/edits/deletes a
-- measurement. Measurements live in their own table (not `activity`), so they
-- need their own slot in the realtime publication. The client handler only
-- reacts to the *event* (then re-fetches the list) — it never reads the payload
-- row — so the default replica identity (primary key) is sufficient.
-- Idempotent: safe to re-run.
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'measurements'
  ) then
    alter publication supabase_realtime add table public.measurements;
  end if;
end $$;
