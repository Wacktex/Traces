// ================================================================
// TRACES — Notification Service
// services/notifications.ts
//
// Design philosophy: low-pressure, non-addictive.
// We never show badge counts. Language is always calm and literary.
// ================================================================

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { NotificationType } from '@/types';

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  payload?: Record<string, unknown>;
}) {
  const db = createSupabaseAdminClient();
  await db.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    payload: params.payload ?? {},
  });
}

export async function getNotifications(userId: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function markAllRead(userId: string) {
  const db = createSupabaseAdminClient();
  await db
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
}
