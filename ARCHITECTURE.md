# Traces — Production Architecture Reference

## Overview

Traces is a premium anonymous messaging platform built on Next.js 14 App Router, Supabase (PostgreSQL), Clerk authentication, and Vercel deployment. The design philosophy: low-pressure, emotionally intelligent, moderation-first.

---

## Folder Structure

```
traces/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx    ← Clerk embedded sign-in
│   │   └── sign-up/[[...sign-up]]/page.tsx    ← Clerk embedded sign-up
│   ├── onboarding/
│   │   └── page.tsx                            ← Username + bio setup
│   ├── dashboard/
│   │   └── page.tsx                            ← Authenticated inbox
│   ├── [username]/
│   │   └── page.tsx                            ← Public profile page
│   ├── traces/[id]/
│   │   └── page.tsx                            ← Full-screen trace reader
│   ├── api/
│   │   ├── webhooks/clerk/route.ts             ← Clerk → Supabase user sync
│   │   └── cron/unlock-capsules/route.ts       ← Hourly capsule unlock job
│   ├── layout.tsx                              ← Root layout + ClerkProvider
│   └── page.tsx                               ← Landing page
│
├── components/
│   ├── ui/                                    ← Shadcn base components
│   ├── traces/
│   │   ├── TraceCard.tsx                      ← Dashboard inbox card
│   │   ├── TraceReader.tsx                    ← Full-screen reader
│   │   ├── TraceCompose.tsx                   ← Multi-step compose flow
│   │   ├── CategoryGrid.tsx                   ← Category selection grid
│   │   ├── RevealModeSelector.tsx             ← Ghost/Shadow/Echo/Signal
│   │   ├── DeliveryModeSelector.tsx           ← Now/Tomorrow/Capsule
│   │   └── SongPreviewCard.tsx               ← Spotify embed card
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx                ← Greeting + summary
│   │   ├── CapsuleCard.tsx                    ← Locked capsule UI
│   │   └── NotificationFeed.tsx               ← Subtle notifications
│   ├── profile/
│   │   ├── ProfileHeader.tsx                  ← Avatar + bio + URL
│   │   └── PublicProfileShell.tsx             ← Profile page wrapper
│   └── shared/
│       ├── Grain.tsx                          ← SVG noise overlay
│       ├── FloatingCard.tsx                   ← Hero animated cards
│       └── AnalyticsProvider.tsx              ← PostHog init wrapper
│
├── hooks/
│   ├── useCurrentUser.ts                      ← Auth + DB user
│   ├── useDashboard.ts                        ← Dashboard data
│   └── useNotifications.ts                    ← Real-time via Supabase
│
├── lib/
│   ├── supabase.ts                            ← Server/client/admin clients
│   └── analytics.ts                           ← PostHog typed events
│
├── actions/
│   └── index.ts                               ← All Server Actions
│
├── services/
│   ├── traces.ts                              ← Trace CRUD
│   ├── moderation.ts                          ← Rate limit, fingerprint, toxicity
│   ├── notifications.ts                       ← Notification create/read
│   └── users.ts                              ← User sync + profile
│
├── types/
│   └── index.ts                               ← All TypeScript types
│
├── utils/
│   └── spotify.ts                             ← Song preview resolution
│
├── jobs/
│   └── unlock-capsules.ts                     ← Capsule unlock cron logic
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql             ← Full schema + RLS
│   └── seed.sql                               ← Dev seed data
│
├── middleware.ts                              ← Clerk auth middleware
├── .env.example                              ← Environment template
├── vercel.json                               ← Cron + deployment config
└── package.json
```

---

## Data Flow

### Anonymous Trace Creation
```
User visits /alexmonroe
  → Selects category → Writes content → Chooses reveal mode + timing
  → actionCreateTrace() server action fires
  → buildFingerprint(ip, userAgent) → SHA-256 hash (never raw)
  → runModerationPipeline()
      ├── isShadowBanned()         → silent accept with shadow_banned status
      ├── isBlockedByReceiver()    → silent reject
      ├── checkRateLimit()         → 5/hour anonymous, 20/hour auth
      └── scoreContent()           → local patterns + Perspective API
  → Insert trace (status = delivered | scheduled | pending | shadow_banned)
  → If scheduled → insert time_capsule record
  → If delivered → createNotification(receiver)
  → Return "Your trace was left." (never exposes moderation outcome)
```

### Capsule Unlock (Cron)
```
Vercel Cron → GET /api/cron/unlock-capsules (every hour)
  → Authenticated via CRON_SECRET header
  → runUnlockCapsules()
      → SELECT capsules WHERE unlock_date <= now AND unlocked_at IS NULL
      → UPDATE traces SET status = 'delivered'
      → UPDATE time_capsules SET unlocked_at = now()
      → createNotification(receiver, 'capsule_unlocked')
```

### Auth Flow
```
User signs up via Clerk
  → Clerk fires user.created webhook → /api/webhooks/clerk
  → syncClerkUser() → INSERT into public.users
  → Auto-generate username from email
  → Redirect to /onboarding
  → User sets username + bio → actionCompleteOnboarding()
  → Redirect to /dashboard
```

---

## Security Architecture

| Layer | Mechanism |
|---|---|
| Auth | Clerk JWT, verified in middleware |
| Anonymous abuse | SHA-256 fingerprint (IP+UA+salt), never raw |
| Rate limiting | 5 traces/hour anon, 20 auth, tracked in rate_limit_log |
| Content | Perspective API + local patterns, toxicity score 0–1 |
| Shadow ban | Auto at 3+ reports in 7 days, silent (sender unaware) |
| Blocking | Per-fingerprint, checked before delivery |
| RLS | Supabase Row Level Security on all tables |
| Webhooks | Svix signature verification on Clerk webhook |
| Crons | CRON_SECRET header auth |
| Data minimization | No raw IPs stored. Traces have no sender FK. |

---

## Notification Philosophy

**Never show badge counts.**

Instead of: *"23 unread messages"*
Use: *"A trace waits."* / *"Someone left a song."* / *"A capsule opened."*

Notification copy is literary, calm, non-anxious. See `services/notifications.ts → notificationCopy()`.

---

## Real-time (Supabase Realtime)

Subscribe in `useNotifications.ts`:

```typescript
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // Update local state — no push notifications, no badges
    setHasNew(true);
  })
  .subscribe();
```

---

## Deployment Checklist

### Supabase
- [ ] Create project
- [ ] Run `001_initial_schema.sql`
- [ ] Run `seed.sql` (dev only)
- [ ] Create storage buckets: `avatars`, `song-thumbnails`
- [ ] Set storage bucket policies (public read for avatars)
- [ ] Enable Realtime on `notifications` table

### Clerk
- [ ] Create application
- [ ] Add webhook endpoint: `https://yourdomain.com/api/webhooks/clerk`
- [ ] Subscribe to: `user.created`, `user.updated`, `user.deleted`
- [ ] Copy webhook secret to `CLERK_WEBHOOK_SECRET`
- [ ] Configure OAuth providers (optional)
- [ ] Set JWT template to include `metadata.isOnboarded`

### Vercel
- [ ] Connect GitHub repo
- [ ] Set all environment variables from `.env.example`
- [ ] Deploy
- [ ] Verify cron job appears in Vercel dashboard
- [ ] Test cron with: `curl -H "x-cron-secret: $CRON_SECRET" https://yourdomain.com/api/cron/unlock-capsules`

### PostHog
- [ ] Create project
- [ ] Copy API key to `NEXT_PUBLIC_POSTHOG_KEY`
- [ ] Create dashboard: Profile views, Trace submissions by category, DAU/WAU

### Perspective API (optional)
- [ ] Enable via Google Cloud Console
- [ ] Add key to `PERSPECTIVE_API_KEY`
- [ ] App degrades gracefully without it

---

## Local Development

```bash
# 1. Clone + install
git clone https://github.com/yourorg/traces
cd traces
npm install

# 2. Copy env
cp .env.example .env.local
# Fill in values

# 3. Start Supabase locally (optional)
npx supabase start
npx supabase db reset   # runs migrations + seed

# 4. Start dev server
npm run dev

# 5. Test cron locally
curl -H "x-cron-secret: your-local-secret" http://localhost:3000/api/cron/unlock-capsules
```

---

## Design ↔ System Mapping

The Phase 1 UI maps to real data as follows:

| UI Element | Data Source |
|---|---|
| Profile page | `users` table via `getPublicProfile(username)` |
| Category grid | Static config + `actionCreateTrace()` |
| Dashboard greeting | `auth()` + `getDashboardSummary(userId)` |
| "3 unopened traces" | `count(trace_views)` diff against delivered traces |
| "Someone left a song" | `hasSongTrace` from dashboard summary |
| Trace card clue | `traces.clue` column |
| Capsule "sealed" badge | `time_capsules.unlocked_at IS NULL` |
| Full-screen reader | `getTrace(traceId, viewerId)` + `trace_views` insert |
| "Your trace was left." | Server action response, not tied to delivery status |
