// ================================================================
// TRACES — Moderation Service
// services/moderation.ts
//
// Handles:
//   - Anonymous sender fingerprinting (hashed, never raw)
//   - Rate limiting (5 traces per fingerprint per hour)
//   - Profanity / toxicity scoring
//   - Shadow ban checks
//   - Spam pattern detection
// ================================================================

import { createHash } from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { containsBlockedLink, containsProfanity } from '@/lib/content-policy';
import type { ModerationResult } from '@/types';

// ─── Fingerprinting ────────────────────────────────────────────────────────────
// We never store raw IP. We hash IP + User-Agent + salt to create a
// pseudonymous fingerprint that enables abuse detection without deanonymizing.

const FINGERPRINT_SALT =
  process.env.FINGERPRINT_SALT ?? 'dev-only-set-FINGERPRINT_SALT-in-production';

export function buildFingerprint(ip: string, userAgent: string): string {
  return createHash('sha256')
    .update(`${ip}:${userAgent}:${FINGERPRINT_SALT}`)
    .digest('hex')
    .slice(0, 40); // 40-char hex prefix, sufficient uniqueness
}

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
// Anonymous senders: 5 traces per hour per fingerprint
// Logged-in users: 20 traces per hour

const ANON_HOURLY_LIMIT = 5;
const AUTH_HOURLY_LIMIT = 20;
const ANON_DAILY_LIMIT = 15;
const AUTH_DAILY_LIMIT = 40;
/** Max traces one sender can leave for a single profile per day. */
const PER_RECEIVER_DAILY_LIMIT = 3;

export async function checkRateLimit(
  fingerprint: string,
  isAuthenticated: boolean
): Promise<{ allowed: boolean; remaining: number }> {
  const db = createSupabaseAdminClient();
  const limit = isAuthenticated ? AUTH_HOURLY_LIMIT : ANON_HOURLY_LIMIT;
  const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await db
    .from('rate_limit_log')
    .select('*', { count: 'exact', head: true })
    .eq('fingerprint', fingerprint)
    .eq('action', 'trace_create')
    .gte('created_at', windowStart);

  const used = count ?? 0;
  const allowed = used < limit;

  if (allowed) {
    // Log this attempt
    await db.from('rate_limit_log').insert({
      fingerprint,
      action: 'trace_create',
    });
  }

  return { allowed, remaining: Math.max(0, limit - used - 1) };
}

export async function checkDailySendLimit(
  fingerprint: string,
  isAuthenticated: boolean
): Promise<{ allowed: boolean }> {
  const db = createSupabaseAdminClient();
  const limit = isAuthenticated ? AUTH_DAILY_LIMIT : ANON_DAILY_LIMIT;
  const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await db
    .from('rate_limit_log')
    .select('*', { count: 'exact', head: true })
    .eq('fingerprint', fingerprint)
    .eq('action', 'trace_create')
    .gte('created_at', windowStart);

  return { allowed: (count ?? 0) < limit };
}

export async function checkReceiverDailyLimit(
  fingerprint: string,
  receiverId: string
): Promise<{ allowed: boolean }> {
  const db = createSupabaseAdminClient();
  const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await db
    .from('traces')
    .select('*', { count: 'exact', head: true })
    .eq('sender_fingerprint', fingerprint)
    .eq('receiver_id', receiverId)
    .gte('created_at', windowStart);

  return { allowed: (count ?? 0) < PER_RECEIVER_DAILY_LIMIT };
}

// ─── Shadow Ban Check ──────────────────────────────────────────────────────────
export async function isShadowBanned(fingerprint: string): Promise<boolean> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from('shadow_bans')
    .select('id, expires_at')
    .eq('fingerprint', fingerprint)
    .single();

  if (!data) return false;
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    // Expired ban — remove it
    await db.from('shadow_bans').delete().eq('fingerprint', fingerprint);
    return false;
  }
  return true;
}

// ─── Block Check ──────────────────────────────────────────────────────────────
export async function isBlockedByReceiver(
  receiverId: string,
  fingerprint: string
): Promise<boolean> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from('blocks')
    .select('id')
    .eq('blocker_id', receiverId)
    .eq('blocked_fingerprint', fingerprint)
    .single();

  return !!data;
}

// ─── Toxicity Scoring ─────────────────────────────────────────────────────────
// Primary: Perspective API (Google)
// Fallback: local keyword list if API unavailable

const TOXIC_PATTERNS = [
  /\b(kill|murder|rape|suicide|kys)\b/i,
  /\b(you should die|go die|end yourself)\b/i,
];

const SPAM_PATTERNS = [
  /(.)\1{6,}/,                        // repeated characters
  /(https?:\/\/[^\s]+){2,}/,         // multiple URLs
  /\b(buy now|click here|free money)\b/i,
];

export async function scoreContent(content: string): Promise<{
  toxicityScore: number;
  isSpam: boolean;
  flaggedPatterns: string[];
}> {
  const flaggedPatterns: string[] = [];
  let toxicityScore = 0;
  let isSpam = false;

  if (containsProfanity(content)) {
    flaggedPatterns.push('profanity');
    toxicityScore = Math.max(toxicityScore, 0.82);
  }

  if (containsBlockedLink(content)) {
    flaggedPatterns.push('blocked_link');
    isSpam = true;
    toxicityScore = Math.max(toxicityScore, 0.75);
  }

  // Local pattern check first (fast, no API call)
  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(content)) {
      flaggedPatterns.push('toxic_language');
      toxicityScore = Math.max(toxicityScore, 0.9);
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      flaggedPatterns.push('spam_pattern');
      isSpam = true;
      toxicityScore = Math.max(toxicityScore, 0.7);
    }
  }

  // Perspective API (production) — graceful degradation on failure
  if (process.env.PERSPECTIVE_API_KEY && toxicityScore < 0.5) {
    try {
      const response = await fetch(
        `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.PERSPECTIVE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment: { text: content },
            requestedAttributes: {
              TOXICITY: {},
              SEVERE_TOXICITY: {},
              HARASSMENT: {},
            },
          }),
          signal: AbortSignal.timeout(3000), // 3s timeout
        }
      );

      if (response.ok) {
        const data = await response.json();
        const perspectiveScore =
          data.attributeScores?.TOXICITY?.summaryScore?.value ?? 0;
        toxicityScore = Math.max(toxicityScore, perspectiveScore);
      }
    } catch {
      // Perspective API unavailable — proceed with local score only
    }
  }

  return { toxicityScore, isSpam, flaggedPatterns };
}

// ─── Auto Shadow-Ban Threshold ─────────────────────────────────────────────────
// If a fingerprint has 3+ reports in 7 days, auto shadow-ban for 24h
export async function checkAutoShadowBan(fingerprint: string): Promise<void> {
  const db = createSupabaseAdminClient();
  const windowStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { count } = await db
    .from('traces')
    .select('id', { count: 'exact', head: true })
    .eq('sender_fingerprint', fingerprint)
    .eq('status', 'removed')
    .gte('created_at', windowStart);

  if ((count ?? 0) >= 3) {
    await db.from('shadow_bans').upsert({
      fingerprint,
      reason: 'auto: 3+ removed traces in 7 days',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }
}

// ─── Full Moderation Pipeline ──────────────────────────────────────────────────
export async function runModerationPipeline(params: {
  content: string;
  fingerprint: string;
  receiverId: string;
  isAuthenticated: boolean;
}): Promise<ModerationResult & { rateLimited: boolean }> {
  const { content, fingerprint, receiverId, isAuthenticated } = params;

  // 1. Shadow ban check
  const shadowBanned = await isShadowBanned(fingerprint);
  if (shadowBanned) {
    // Silently accept but mark as shadow_banned — sender doesn't know
    return { approved: true, toxicityScore: 0, shadowBan: true, rateLimited: false };
  }

  // 2. Block check
  const blocked = await isBlockedByReceiver(receiverId, fingerprint);
  if (blocked) {
    return { approved: false, toxicityScore: 0, shadowBan: false, rateLimited: false, reason: 'blocked' };
  }

  // 3. Rate limit check (hourly + daily + per-receiver)
  const { allowed } = await checkRateLimit(fingerprint, isAuthenticated);
  if (!allowed) {
    return { approved: false, toxicityScore: 0, shadowBan: false, rateLimited: true };
  }

  const daily = await checkDailySendLimit(fingerprint, isAuthenticated);
  if (!daily.allowed) {
    return { approved: false, toxicityScore: 0, shadowBan: false, rateLimited: true };
  }

  const perReceiver = await checkReceiverDailyLimit(fingerprint, receiverId);
  if (!perReceiver.allowed) {
    return { approved: false, toxicityScore: 0, shadowBan: false, rateLimited: true, reason: 'receiver_cap' };
  }

  // 4. Content moderation
  const { toxicityScore, isSpam } = await scoreContent(content);

  // Auto-approve clean content
  if (toxicityScore < 0.5 && !isSpam) {
    return { approved: true, toxicityScore, shadowBan: false, rateLimited: false };
  }

  // High toxicity — shadow ban
  if (toxicityScore >= 0.85 || isSpam) {
    return { approved: true, toxicityScore, shadowBan: true, rateLimited: false };
  }

  // Medium — queue for manual moderation review
  return { approved: true, toxicityScore, shadowBan: false, rateLimited: false };
}
