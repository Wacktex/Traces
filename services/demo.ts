import { createSupabaseAdminClient } from '@/lib/supabase-admin';

const DEMO_USERS = [
  {
    clerk_id: 'user_demo_alex',
    username: 'alexmonroe',
    bio: 'designer. night owl. trying to be honest.',
  },
  {
    clerk_id: 'user_demo_morgan',
    username: 'morganlee',
    bio: 'always in transit.',
  },
  {
    clerk_id: 'user_demo_river',
    username: 'river',
    bio: 'ask me anything except that.',
  },
] as const;

/** Ensures built-in demo profiles exist (dev/demo links on the landing page). */
export async function ensureDemoProfile(username: string): Promise<boolean> {
  const demo = DEMO_USERS.find((u) => u.username === username);
  if (!demo) return false;

  const db = createSupabaseAdminClient();
  const { data: existing } = await db
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existing) return true;

  const { error } = await db.from('users').insert({
    clerk_id: demo.clerk_id,
    username: demo.username,
    bio: demo.bio,
    is_onboarded: true,
  });

  if (error) {
    console.error('[ensureDemoProfile]', error.message);
    return false;
  }

  return true;
}
