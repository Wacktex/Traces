// ================================================================
// TRACES — Time Capsule Unlock Job
// jobs/unlock-capsules.ts
//
// Pure business logic — no HTTP concerns.
// Called by: app/api/cron/unlock-capsules/route.ts
// Schedule:  Vercel Cron every hour ("0 * * * *")
// ================================================================

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { createNotification }        from '@/services/notifications';

export interface UnlockResult {
  unlocked: number;
  errors:   number;
}

export async function runUnlockCapsules(): Promise<UnlockResult> {
  const db = createSupabaseAdminClient();
  let unlocked = 0;
  let errors   = 0;

  // All date-based capsules past their unlock time, not yet unlocked
  const { data: dueCapsules, error } = await db
    .from('time_capsules')
    .select(`
      id,
      trace_id,
      unlock_condition,
      traces!inner (
        id,
        receiver_id,
        status,
        category
      )
    `)
    .is('unlocked_at', null)
    .lte('unlock_date', new Date().toISOString())
    .not('unlock_date', 'is', null)
    .eq('traces.status', 'scheduled');

  if (error) {
    console.error('[unlock-capsules] fetch error:', error);
    return { unlocked: 0, errors: 1 };
  }

  for (const capsule of dueCapsules ?? []) {
    try {
      const trace = Array.isArray(capsule.traces) ? capsule.traces[0] : capsule.traces as any;
      if (!trace) continue;

      await db
        .from('traces')
        .update({ status: 'delivered' })
        .eq('id', capsule.trace_id);

      await db
        .from('time_capsules')
        .update({ unlocked_at: new Date().toISOString() })
        .eq('id', capsule.id);

      await createNotification({
        userId:  trace.receiver_id,
        type:    trace.category === 'song_reminder' ? 'song_received' : 'capsule_unlocked',
        payload: { traceId: trace.id, capsuleId: capsule.id },
      });

      unlocked++;
    } catch (err) {
      console.error('[unlock-capsules] error on capsule', capsule.id, err);
      errors++;
    }
  }

  console.log(`[unlock-capsules] unlocked=${unlocked} errors=${errors}`);
  return { unlocked, errors };
}
