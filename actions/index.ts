// ================================================================
// TRACES — Server Actions
// actions/index.ts
//
// All mutations go through Server Actions.
// API routes exist only for webhook endpoints.
// ================================================================

'use server';

import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createTrace, reportTrace, recordTraceView } from '@/services/traces';
import { updateProfile, getUserByClerkId } from '@/services/users';
import { markAllRead } from '@/services/notifications';
import { buildFingerprint } from '@/services/moderation';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { CreateTraceRequest } from '@/types';

async function getClerkId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

// ─── Helper: get request fingerprint ──────────────────────────────────────────
async function getFingerprint(): Promise<string> {
  const headersList = headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown';
  const ua = headersList.get('user-agent') ?? 'unknown';
  return buildFingerprint(ip, ua);
}

// ─── Create Trace ──────────────────────────────────────────────────────────────
export async function actionCreateTrace(
  request: CreateTraceRequest
): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> {
  const clerkId = await getClerkId();
  const fingerprint = await getFingerprint();

  const result = await createTrace(request, fingerprint, !!clerkId);
  return result;
}

// ─── Report Trace ──────────────────────────────────────────────────────────────
export async function actionReportTrace(params: {
  traceId: string;
  reason: string;
  detail?: string;
}) {
  const clerkId = await getClerkId();
  if (!clerkId) throw new Error('Unauthorized');

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error('User not found');

  await reportTrace({ ...params, reporterId: user.id });
  revalidatePath('/');
  revalidatePath('/dashboard');
}

// ─── Update Profile ────────────────────────────────────────────────────────────
export async function actionUpdateProfile(params: {
  username?: string;
  bio?: string;
}): Promise<{ success: boolean; error?: string }> {
  const clerkId = await getClerkId();
  if (!clerkId) return { success: false, error: 'Unauthorized' };

  const result = await updateProfile({ clerkId, ...params });

  if (result.success) {
    revalidatePath('/');
  revalidatePath('/dashboard');
    revalidatePath('/settings');
    if (params.username) revalidatePath(`/${params.username}`);
  }

  return result;
}

// ─── Mark Notifications Read ───────────────────────────────────────────────────
export async function actionMarkNotificationsRead() {
  const clerkId = await getClerkId();
  if (!clerkId) return;

  const user = await getUserByClerkId(clerkId);
  if (!user) return;

  await markAllRead(user.id);
  revalidatePath('/');
  revalidatePath('/dashboard');
}

// ─── Block Sender ──────────────────────────────────────────────────────────────
export async function actionBlockSender(traceId: string) {
  const clerkId = await getClerkId();
  if (!clerkId) throw new Error('Unauthorized');

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error('User not found');

  const db = createSupabaseAdminClient();

  // Get sender fingerprint from trace
  const { data: trace } = await db
    .from('traces')
    .select('sender_fingerprint, receiver_id')
    .eq('id', traceId)
    .eq('receiver_id', user.id)
    .single();

  const traceRow = trace as { sender_fingerprint: string | null; receiver_id: string } | null;
  if (!traceRow?.sender_fingerprint) return;

  await db.from('blocks').insert({
    blocker_id: user.id,
    blocked_fingerprint: traceRow.sender_fingerprint,
  });

  revalidatePath('/');
  revalidatePath('/dashboard');
}

// ─── Open trace (record view after lock screen) ─────────────────────────────────
export async function actionOpenTrace(
  traceId: string
): Promise<{ success: boolean; error?: string }> {
  const clerkId = await getClerkId();
  if (!clerkId) return { success: false, error: 'Please sign in again.' };

  const user = await getUserByClerkId(clerkId);
  if (!user) return { success: false, error: 'Account not found.' };

  const db = createSupabaseAdminClient();
  const { data: trace } = await db
    .from('traces')
    .select('id')
    .eq('id', traceId)
    .eq('receiver_id', user.id)
    .eq('status', 'delivered')
    .single();

  if (!trace) return { success: false, error: 'This trace is not available.' };

  const recorded = await recordTraceView(traceId, user.id);
  if (!recorded.success) {
    return { success: false, error: recorded.error ?? 'Could not open trace.' };
  }

  revalidatePath(`/traces/${traceId}`);
  revalidatePath('/');
  revalidatePath('/dashboard');
  return { success: true };
}

// ─── Comfort capsule unlock (manual / legacy bad_day) ─────────────────────────
export async function actionUnlockComfortCapsule(capsuleId: string) {
  const clerkId = await getClerkId();
  if (!clerkId) throw new Error('Unauthorized');

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error('User not found');

  const db = createSupabaseAdminClient();

  const { data: capsule } = await db
    .from('time_capsules')
    .select('id, trace_id, unlock_condition, traces!inner(receiver_id)')
    .eq('id', capsuleId)
    .in('unlock_condition', ['manual', 'bad_day'])
    .single();

  if (!capsule) throw new Error('Capsule not found');

  const capsuleRow = capsule as { id: string; trace_id: string; traces: { receiver_id: string } | { receiver_id: string }[] };
  const traceRow = capsuleRow.traces;
  const trace = Array.isArray(traceRow) ? traceRow[0] : traceRow;
  if (!trace || trace.receiver_id !== user.id) throw new Error('Unauthorized');

  // Unlock
  await db
    .from('time_capsules')
    .update({ unlocked_at: new Date().toISOString() })
    .eq('id', capsuleId);

  await db
    .from('traces')
    .update({ status: 'delivered' })
    .eq('id', capsuleRow.trace_id);

  revalidatePath('/');
  revalidatePath('/dashboard');
}

/** @deprecated use actionUnlockComfortCapsule */
export async function actionUnlockBadDayCapsule(capsuleId: string) {
  return actionUnlockComfortCapsule(capsuleId);
}

// ─── Onboarding complete redirect ─────────────────────────────────────────────
export async function actionCompleteOnboarding(params: {
  username: string;
  bio?: string;
}): Promise<{ success: boolean; error?: string }> {
  const clerkId = await getClerkId();
  if (!clerkId) return { success: false, error: 'Please sign in to continue.' };

  const result = await updateProfile({ clerkId, ...params });
  if (!result.success) return result;

  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath('/onboarding');
  revalidatePath(`/${params.username}`);
  redirect('/');
}
