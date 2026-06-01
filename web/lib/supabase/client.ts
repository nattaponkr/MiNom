// Browser Supabase client (singleton). Session is persisted in localStorage —
// a deliberate choice for a mobile-web SPA: same auth path in demo and real
// modes, no SSR cookie plumbing needed to prove the Phase 2 architecture.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Demo mode = no backend configured. The app falls back to a local store.
export const SUPABASE_CONFIGURED = Boolean(URL && ANON);

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!SUPABASE_CONFIGURED) {
    throw new Error("Supabase is not configured (running in demo mode).");
  }
  if (!_client) {
    _client = createClient(URL!, ANON!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      realtime: { params: { eventsPerSecond: 5 } },
    });
  }
  return _client;
}
