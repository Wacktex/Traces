import type { TimeCapsule } from '@/types';

/** Supabase embeds a 1:1 relation as an object, not an array. */
export function asTimeCapsuleArray(
  raw: TimeCapsule | TimeCapsule[] | null | undefined
): TimeCapsule[] {
  if (raw == null) return [];
  return Array.isArray(raw) ? raw : [raw];
}

export function withNormalizedCapsules<T extends { time_capsules?: TimeCapsule | TimeCapsule[] | null }>(
  trace: T
): T & { time_capsules: TimeCapsule[] } {
  return { ...trace, time_capsules: asTimeCapsuleArray(trace.time_capsules) };
}
