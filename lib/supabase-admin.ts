import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseUrl } from './supabase-url';

let adminClient: SupabaseClient | null = null;

/** Service-role client for server-only writes (webhooks, actions, cron). */
export function createSupabaseAdminClient(): SupabaseClient {
  if (!adminClient) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    }
    adminClient = createClient(getSupabaseUrl(), key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}
