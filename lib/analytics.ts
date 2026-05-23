// ================================================================
// TRACES — Analytics (PostHog)
// lib/analytics.ts
// ================================================================

import posthog from 'posthog-js';

let initialized = false;

function posthogKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || key.includes('...')) return undefined;
  return key;
}

export function initPostHog() {
  if (initialized || typeof window === 'undefined') return;
  const key = posthogKey();
  if (!key) return;

  try {
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: false,
      disable_session_recording: false,
    });
    initialized = true;
  } catch {
    // Analytics must never break the app
  }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !initialized) return;
  try {
    posthog.identify(userId, traits);
  } catch {
    /* noop */
  }
}

type TraceEvent =
  | { event: 'profile_viewed'; props: { username: string } }
  | { event: 'trace_compose_started'; props: { category: string } }
  | { event: 'trace_submitted'; props: { category: string; reveal_type: string; delivery_mode: string } }
  | { event: 'trace_opened'; props: { category: string } }
  | { event: 'capsule_unlocked'; props: { condition: string } }
  | { event: 'dashboard_viewed'; props: { unopened_count: number } }
  | { event: 'song_trace_viewed'; props: Record<string, never> }
  | { event: 'report_submitted'; props: { reason: string } }
  | { event: 'onboarding_completed'; props: Record<string, never> };

export function track<T extends TraceEvent>(
  event: T['event'],
  props: T extends { event: infer E } ? (T & { event: E })['props'] : never
) {
  if (typeof window === 'undefined' || !initialized) return;
  try {
    posthog.capture(event, props);
  } catch {
    /* noop */
  }
}
