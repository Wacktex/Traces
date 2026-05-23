// ================================================================
// TRACES — User Sync Service
// services/users.ts
//
// Syncs Clerk identity into our Supabase users table.
// Called from:
//   - Clerk webhook (user.created, user.updated)
//   - Middleware on first-visit detection
// ================================================================

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { isReservedPath } from '@/lib/reserved-paths';
import { isReservedUsername } from '@/lib/reserved-usernames';
import type { User, PublicProfile } from '@/types';

const PG_UNIQUE_VIOLATION = '23505';

// ─── Sync Clerk user into DB ───────────────────────────────────────────────────
export async function syncClerkUser(params: {
  clerkId: string;
  email?: string;
  imageUrl?: string;
}): Promise<{ user: User; isNew: boolean }> {
  const db = createSupabaseAdminClient();

  // Check if user already exists
  const { data: existing } = await db
    .from('users')
    .select('*')
    .eq('clerk_id', params.clerkId)
    .maybeSingle();

  if (existing) {
    // Update image if changed
    if (params.imageUrl && params.imageUrl !== existing.profile_image) {
      await db
        .from('users')
        .update({ profile_image: params.imageUrl })
        .eq('clerk_id', params.clerkId);
    }
    return { user: existing, isNew: false };
  }

  // Generate username from email or clerk id
  const baseUsername = params.email
    ? params.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    : `user_${params.clerkId.slice(-8)}`;

  let candidate = await findAvailableUsername(db, baseUsername);
  let attempt = 0;
  while (attempt < 5) {
    const { data: newUser, error } = await db
      .from('users')
      .insert({
        clerk_id: params.clerkId,
        username: candidate,
        profile_image: params.imageUrl ?? null,
        is_onboarded: false,
      })
      .select('*')
      .single();

    if (!error && newUser) {
      return { user: newUser, isNew: true };
    }

    if (error?.code === PG_UNIQUE_VIOLATION) {
      attempt++;
      candidate = await findAvailableUsername(db, `${baseUsername}${attempt}`);
      continue;
    }

    throw new Error(`Failed to create user: ${error?.message}`);
  }

  throw new Error('Failed to create user: could not allocate username');
}

// ─── Find available username ───────────────────────────────────────────────────
async function findAvailableUsername(db: any, base: string): Promise<string> {
  let candidate = base.slice(0, 20); // max 20 chars
  let suffix = 0;

  while (true) {
    const { data } = await db
      .from('users')
      .select('id')
      .eq('username', candidate)
      .maybeSingle();

    if (!data) return candidate; // available

    suffix++;
    candidate = `${base.slice(0, 18)}${suffix}`;
  }
}

// ─── Update profile ────────────────────────────────────────────────────────────
export async function updateProfile(params: {
  clerkId: string;
  username?: string;
  bio?: string;
}): Promise<{ success: boolean; error?: string }> {
  const db = createSupabaseAdminClient();

  // Username uniqueness check
  if (params.username) {
    if (isReservedPath(params.username) || isReservedUsername(params.username)) {
      return { success: false, error: 'That username is not available.' };
    }

    const { data: conflict } = await db
      .from('users')
      .select('id, clerk_id')
      .eq('username', params.username)
      .maybeSingle();

    if (conflict && conflict.clerk_id !== params.clerkId) {
      return { success: false, error: 'That username is already taken.' };
    }

    // Validate format
    if (!/^[a-z0-9_]{2,20}$/.test(params.username)) {
      return { success: false, error: 'Username must be 2–20 chars: lowercase, numbers, underscores.' };
    }
  }

  const updates: Record<string, string | boolean> = {};
  if (params.username) updates.username = params.username;
  if (params.bio !== undefined) updates.bio = params.bio;
  updates.is_onboarded = true;

  const { error } = await db
    .from('users')
    .update(updates)
    .eq('clerk_id', params.clerkId);

  if (error?.code === PG_UNIQUE_VIOLATION) {
    return { success: false, error: 'That username is already taken.' };
  }
  if (error) return { success: false, error: 'Update failed.' };
  return { success: true };
}

/** Public lookup — does not create demo users. */
export async function userExistsByUsername(username: string): Promise<boolean> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  return !!data;
}

// ─── Get public profile ────────────────────────────────────────────────────────
export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from('users')
    .select('username, bio, profile_image, theme')
    .eq('username', username)
    .maybeSingle();

  return data;
}

// ─── Get internal user by clerk ID ────────────────────────────────────────────
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .maybeSingle();
  return data;
}
