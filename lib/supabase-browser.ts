'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseUrl } from './supabase-url';

let browserClient: SupabaseClient | null = null;

/** Browser client for realtime subscriptions and client-side reads. */
export function createSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    browserClient = createBrowserClient(getSupabaseUrl(), key);
  }
  return browserClient;
}
