// ================================================================
// TRACES — Trace Service
// services/traces.ts
// ================================================================

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { runModerationPipeline } from './moderation';
import { createNotification } from './notifications';
import { deliveryRequiresDate, resolveDelivery } from '@/lib/delivery';
import { normalizeEmotionalTone } from '@/lib/emotional-tones';
import { withNormalizedCapsules } from '@/lib/time-capsules';
import type {
  CreateTraceRequest,
  CreateTraceResponse,
  DashboardSummary,
  TraceWithCapsule,
  TraceStatus,
  SealedCapsuleItem,
} from '@/types';

// ─── Create Trace ──────────────────────────────────────────────────────────────
export async function createTrace(
  request: CreateTraceRequest,
  fingerprint: string,
  isAuthenticated: boolean
): Promise<CreateTraceResponse> {
  const db = createSupabaseAdminClient();

  if (!request.content?.trim() && !request.songUrl?.trim()) {
    return { success: false, error: 'Write something before leaving a trace.' };
  }

  // 1. Resolve receiver
  const { data: receiver, error: receiverError } = await db
    .from('users')
    .select('id')
    .eq('username', request.receiverUsername)
    .single();

  if (receiverError || !receiver) {
    return { success: false, error: 'Profile not found.' };
  }

  // 2. Moderation pipeline
  const modResult = await runModerationPipeline({
    content: request.content,
    fingerprint,
    receiverId: receiver.id,
    isAuthenticated,
  });

  if (!modResult.approved && !modResult.shadowBan) {
    if (modResult.rateLimited) {
      const msg =
        modResult.reason === 'receiver_cap'
          ? 'You have reached the limit for this profile today.'
          : 'Too many traces. Try again later.';
      return { success: false, error: msg, rateLimited: true };
    }
    return { success: false, error: 'Unable to deliver this trace.' };
  }

  if (deliveryRequiresDate(request.deliveryMode)) {
    const dateIso =
      request.deliveryMode === 'custom'
        ? request.customDate
        : request.milestoneDate;
    if (!dateIso) {
      return { success: false, error: 'Choose a date for this delivery option.' };
    }
  }

  // 3. Determine status and timing
  const delivery = resolveDelivery(request.deliveryMode, {
    customDate: request.customDate,
    milestoneDate: request.milestoneDate,
  });

  if (delivery.isTimed && deliveryRequiresDate(request.deliveryMode) && !delivery.scheduledTime) {
    return { success: false, error: 'Choose a valid unlock date.' };
  }

  const scheduledTime = delivery.scheduledTime;
  const isTimed = delivery.isTimed;

  let status: TraceStatus;
  if (modResult.shadowBan) {
    status = 'shadow_banned';
  } else if (isTimed) {
    status = 'scheduled';
  } else if (modResult.toxicityScore >= 0.5) {
    status = 'pending'; // Manual review
  } else {
    status = 'delivered';
  }

  const emotionalTone = normalizeEmotionalTone(request.emotionalTone);

  // 4. Insert trace
  const { data: trace, error: traceError } = await db
    .from('traces')
    .insert({
      receiver_id: receiver.id,
      content: request.content,
      category: request.category,
      reveal_type: request.revealType,
      status,
      scheduled_time: scheduledTime?.toISOString() ?? null,
      sender_fingerprint: fingerprint,
      toxicity_score: modResult.toxicityScore,
      song_url: request.songUrl ?? null,
      song_note: request.songNote ?? null,
      clue: request.clue ?? null,
      emotional_tone: emotionalTone,
    })
    .select('id, emotional_tone')
    .single();

  if (traceError || !trace) {
    if (traceError?.message?.includes('emotional_tone')) {
      console.error('[trace_create] Missing emotional_tone column — apply supabase/migrations/002_phase2_schema.sql');
    } else {
      console.error('[trace_create]', traceError);
    }
    return { success: false, error: 'Something went wrong.' };
  }

  // 5. Create capsule record for timed/conditioned traces
  if (isTimed && delivery.capsuleCondition) {
    await db.from('time_capsules').insert({
      trace_id: trace.id,
      unlock_date: delivery.unlockDate ?? scheduledTime?.toISOString() ?? null,
      unlock_condition: delivery.capsuleCondition,
    });
  }

  // 6. Notify receiver (only for immediately delivered traces)
  if (status === 'delivered') {
    await createNotification({
      userId: receiver.id,
      type: request.category === 'song_reminder' ? 'song_received' : 'trace_received',
      payload: { traceId: trace.id, category: request.category },
    });
  }

  return { success: true, traceId: trace.id };
}

// ─── Get Dashboard Summary ─────────────────────────────────────────────────────
export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const db = createSupabaseAdminClient();

  // Fetch all delivered traces with capsule info
  const { data: traces } = await db
    .from('traces')
    .select(`
      *,
      time_capsules (*)
    `)
    .eq('receiver_id', userId)
    .in('status', ['delivered', 'scheduled'])
    .order('created_at', { ascending: false })
    .limit(20);

  const allTraces = (traces as TraceWithCapsule[]) ?? [];
  const delivered = allTraces.filter(t => t.status === 'delivered');
  const scheduled = allTraces.filter(t => t.status === 'scheduled');

  const deliveredIds = delivered.map(t => t.id);
  const { data: views } = deliveredIds.length
    ? await db
        .from('trace_views')
        .select('trace_id')
        .in('trace_id', deliveredIds)
        .eq('viewer_id', userId)
    : { data: [] };

  const viewedSet = new Set((views ?? []).map(v => v.trace_id));
  const unopenedCount = delivered.filter(t => !viewedSet.has(t.id)).length;
  const hasSongTrace = delivered.some(t => t.category === 'song_reminder');

  const sealedCapsules: SealedCapsuleItem[] = scheduled.flatMap(trace => {
    const normalized = withNormalizedCapsules(trace);
    const caps = normalized.time_capsules.filter(c => !c.unlocked_at);
    return caps.map(capsule => ({ capsule, trace: normalized }));
  });

  return {
    unopenedCount,
    capsuleCount: sealedCapsules.length,
    hasSongTrace,
    latestTraces: delivered.slice(0, 8).map(t => ({
      ...withNormalizedCapsules(t),
      isViewed: viewedSet.has(t.id),
    })),
    sealedCapsules,
  };
}

// ─── Get Single Trace ──────────────────────────────────────────────────────────
export async function hasViewedTrace(traceId: string, viewerId: string): Promise<boolean> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from('trace_views')
    .select('id')
    .eq('trace_id', traceId)
    .eq('viewer_id', viewerId)
    .maybeSingle();
  return !!data;
}

export async function getTrace(
  traceId: string,
  viewerId: string,
  options?: { recordView?: boolean }
): Promise<TraceWithCapsule | null> {
  const db = createSupabaseAdminClient();

  const { data: trace } = await db
    .from('traces')
    .select(`*, time_capsules (*)`)
    .eq('id', traceId)
    .eq('receiver_id', viewerId)
    .single();

  if (!trace) return null;

  if (options?.recordView !== false) {
    const already = await hasViewedTrace(traceId, viewerId);
    if (!already) {
      await db.from('trace_views').insert({
        trace_id: traceId,
        viewer_id: viewerId,
      });
    }
  }

  return withNormalizedCapsules(trace as TraceWithCapsule);
}

export async function recordTraceView(
  traceId: string,
  viewerId: string
): Promise<{ success: boolean; error?: string }> {
  const db = createSupabaseAdminClient();
  const already = await hasViewedTrace(traceId, viewerId);
  if (already) return { success: true };

  const { error } = await db.from('trace_views').insert({
    trace_id: traceId,
    viewer_id: viewerId,
  });

  if (error) {
    console.error('[recordTraceView]', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ─── Report Trace ──────────────────────────────────────────────────────────────
export async function reportTrace(params: {
  traceId: string;
  reporterId: string;
  reason: string;
  detail?: string;
}) {
  const db = createSupabaseAdminClient();

  const { error } = await db.from('reports').insert({
    trace_id: params.traceId,
    reporter_id: params.reporterId,
    reason: params.reason as any,
    detail: params.detail,
  });

  if (error) throw new Error('Report failed');

  // Check report threshold — if 3+ reports on this trace, auto-remove
  const { count } = await db
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('trace_id', params.traceId)
    .eq('status', 'open');

  if ((count ?? 0) >= 3) {
    await db
      .from('traces')
      .update({ status: 'removed' })
      .eq('id', params.traceId);
  }
}
