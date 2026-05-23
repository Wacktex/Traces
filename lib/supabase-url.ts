/** Normalize Supabase project URL (strip REST path if pasted from dashboard). */
export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  return raw.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
}
