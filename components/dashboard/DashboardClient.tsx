'use client';
// ================================================================
// TRACES — DashboardClient
// components/dashboard/DashboardClient.tsx
//
// Wired to:
//   - getDashboardSummary (server-fetched, passed as prop)
//   - useNotifications (Supabase Realtime subscription)
//   - actionMarkNotificationsRead
//   - actionUnlockBadDayCapsule
//   - actionBlockSender
//   - PostHog analytics
// ================================================================

import { useState, useEffect }              from 'react';
import Link                                 from 'next/link';
import { useRouter }                        from 'next/navigation';
import { useClerk }                         from '@clerk/nextjs';
import { AmbientBg, ProfileShare, BrandLink } from '@/components/shared';
import { LeaveTraceTrigger } from '@/components/landing/LeaveTraceModal';
import { AIInsightPanel }                   from '@/components/dashboard/AIInsightPanel';
import { actionMarkNotificationsRead, actionUnlockComfortCapsule } from '@/actions';
import { formatCapsuleLabel, isComfortCapsule } from '@/lib/delivery';
import { useNotifications }                 from '@/hooks/useNotifications';
import { track, identifyUser }              from '@/lib/analytics';
import { notificationCopy }                 from '@/lib/notification-copy';
import type { User, DashboardSummary, Notification, TraceWithCapsule } from '@/types';
import { CATEGORIES }                       from '@/components/profile';

// ── Capsule card ──────────────────────────────────────────────────
function CapsuleCard({ capsule }: { capsule: { id: string; unlock_condition: string; unlock_date: string | null } }) {
  const [unlocking, setUnlocking] = useState(false);
  const comfort = isComfortCapsule(capsule.unlock_condition);

  const handleUnlock = async () => {
    if (!comfort) return;
    setUnlocking(true);
    await actionUnlockComfortCapsule(capsule.id);
    setUnlocking(false);
  };

  const labelText = formatCapsuleLabel(capsule.unlock_condition, capsule.unlock_date);

  return (
    <div className="capsule-card dash-card dash-card--capsule">
      <div className="dash-card__meta">
        <span className="dash-card__icon" aria-hidden>⧖</span>
        <span className="dash-card__label">
          {comfort ? 'Comfort Capsule' : 'Time Capsule'}
        </span>
      </div>
      <p className="dash-card__teaser">
        Not everything arrives immediately.
      </p>
      <p className="dash-card__sub">{labelText}</p>
      {comfort && (
        <button type="button" onClick={handleUnlock} disabled={unlocking} className="dash-pill-btn dash-pill-btn--navy">
          {unlocking ? 'Opening…' : 'Open when needed'}
        </button>
      )}
    </div>
  );
}

// ── Notification pill ─────────────────────────────────────────────
function NotifPill({ notif }: { notif: Notification }) {
  const copy = notificationCopy(notif.type);
  return (
    <div className="notif-pill dash-notif">
      <p className="dash-notif__title">{copy.summary}</p>
      {copy.body && <p className="dash-notif__body">{copy.body}</p>}
    </div>
  );
}

// ── Trace card ────────────────────────────────────────────────────
function TraceCard({ trace }: { trace: TraceWithCapsule }) {
  const cat = CATEGORIES.find(c => c.id === trace.category);
  const locked = !trace.isViewed;

  return (
    <Link href={`/traces/${trace.id}`} className="trace-card-link">
      <div className={`trace-card dash-card dash-card--trace${locked ? ' dash-card--unread' : ''}`}>
        <div className="dash-card__meta">
          <span className="dash-card__label">
            {cat?.icon} {cat?.label}
          </span>
          <div className="dash-card__status">
            {locked && <span className="dash-card__dot" aria-hidden />}
            <span>{locked ? 'unopened' : 'opened'}</span>
          </div>
        </div>

        <p className="dash-card__teaser dash-card__teaser--trace">
          {locked
            ? 'Someone left something for you. Open to read it.'
            : trace.clue
            ? `"${trace.clue}"`
            : 'You have opened this trace.'}
        </p>

        <div className="dash-card__footer">
          <span className="dash-pill-btn">{locked ? 'open trace' : 'read again'}</span>
          <span className="dash-card__date">
            {new Date(trace.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── DashboardNav ──────────────────────────────────────────────────
function DashboardNav({ username, hasNew }: { username: string; hasNew: boolean }) {
  const { signOut } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="dashboard-nav" style={{
      position:       'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding:        '16px 28px',
      display:        'flex', alignItems: 'center', justifyContent: 'space-between',
      background:     'rgba(11,11,12,0.85)', backdropFilter: 'blur(12px)',
      borderBottom:   '1px solid rgba(255,255,255,0.05)',
    }}>
      <BrandLink style={{ fontSize: 20 }} />

      <div className="dashboard-nav__actions" style={{ position: 'relative' }}>
        {hasNew && (
          <div className="dashboard-nav__notif" aria-hidden />
        )}

        <LeaveTraceTrigger variant="nav" />

        <Link href={`/${username}`} className="dashboard-nav__profile">
          my profile
        </Link>

        {/* Avatar / menu */}
        <button onClick={() => setMenuOpen(v => !v)} style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(44,74,62,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--serif)', fontSize: 15, color: '#c8bfaa',
          cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          {username[0].toUpperCase()}
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute', top: 44, right: 0, zIndex: 100,
            background: '#141416', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '8px',
            minWidth: 160, animation: 'fadeUp 0.2s ease both',
          }}>
            <Link href="/settings" style={{ display: 'block', padding: '8px 14px', color: '#9a9490', fontFamily: 'var(--sans)', fontSize: 12, textDecoration: 'none', borderRadius: 8, transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >Settings</Link>
            <button onClick={() => signOut()} style={{
              display: 'block', width: '100%', padding: '8px 14px',
              color: '#7a7672', fontFamily: 'var(--sans)', fontSize: 12,
              background: 'none', border: 'none', cursor: 'pointer',
              textAlign: 'left', borderRadius: 8, transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >Sign out</button>
          </div>
        )}
      </div>
    </nav>
  );
}

// ── DashboardClient ───────────────────────────────────────────────
interface Props {
  user:                 User;
  summary:              DashboardSummary;
  initialNotifications: Notification[];
}

export function DashboardClient({ user, summary, initialNotifications }: Props) {
  const [showInsights, setShowInsights] = useState(false);
  const { notifications, hasNew, setHasNew } = useNotifications(user.id);
  const allNotifs = [...notifications, ...initialNotifications.filter(n => !notifications.some(nn => nn.id === n.id))];

  // Analytics identify
  useEffect(() => {
    identifyUser(user.clerk_id, { username: user.username });
    track('dashboard_viewed', { unopened_count: summary.unopenedCount });
  }, []);

  // Mark notifications read when dashboard opens
  useEffect(() => {
    if (hasNew) {
      actionMarkNotificationsRead().then(() => setHasNew(false));
    }
  }, [hasNew]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const deliveredTraces = summary.latestTraces;
  const sealedCapsules  = summary.sealedCapsules;
  const isEmpty = deliveredTraces.length === 0 && sealedCapsules.length === 0;

  return (
    <>
      <DashboardNav username={user.username} hasNew={hasNew} />

      <AmbientBg />
      <div className="dashboard-page">

        {/* Greeting */}
        <div className="dash-hero animate-fade-up">
          <h1 className="dash-greeting type-display">
            {greeting}, {user.username}.
          </h1>
          <div className="dash-stat">
            {summary.unopenedCount > 0 && (
              <span>{summary.unopenedCount} {summary.unopenedCount === 1 ? 'trace waits' : 'traces wait'}</span>
            )}
            {summary.unopenedCount > 0 && summary.capsuleCount > 0 && <span style={{ color: '#3a3836' }}>·</span>}
            {summary.capsuleCount > 0 && (
              <span>{summary.capsuleCount} sealed {summary.capsuleCount === 1 ? 'capsule' : 'capsules'}</span>
            )}
            {summary.hasSongTrace && (
              <><span style={{ color: '#3a3836' }}>·</span><span style={{ color: '#c8bfaa' }}>Someone left a song.</span></>
            )}
            {summary.unopenedCount === 0 && summary.capsuleCount === 0 && (
              <span className="dash-stat__calm">You&apos;re all caught up.</span>
            )}
          </div>
        </div>

        {/* New notifications */}
        {allNotifs.filter(n => !n.read).length > 0 && (
          <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allNotifs.filter(n => !n.read).slice(0, 3).map(n => (
              <NotifPill key={n.id} notif={n} />
            ))}
          </div>
        )}

        {/* Traces */}
        {deliveredTraces.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <p className="dash-section-label type-eyebrow">Waiting for you</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {deliveredTraces.map((trace, i) => (
                <div key={trace.id} style={{ animation: `fadeUp 0.5s ease ${i * 0.07}s both` }}>
                  <TraceCard trace={trace} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sealed / scheduled */}
        {sealedCapsules.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <p className="dash-section-label type-eyebrow">Sealed for later</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sealedCapsules.map(({ capsule }) => (
                <CapsuleCard key={capsule.id} capsule={capsule} />
              ))}
            </div>
          </div>
        )}

        {deliveredTraces.length >= 3 && (
          <div style={{ marginBottom: 16 }}>
            <button type="button" onClick={() => setShowInsights(true)} className="dash-pill-btn dash-pill-btn--ghost dash-insights-btn">
              Reflect on your traces
            </button>
          </div>
        )}

        {!isEmpty && (
          <div style={{ marginBottom: 28 }}>
            <ProfileShare username={user.username} />
          </div>
        )}

        {isEmpty && (
          <div className="dash-empty dash-empty--growth animate-fade-up">
            <span className="dash-empty__glyph" aria-hidden>✦</span>
            <p className="dash-empty__title">Your inbox is ready for its first trace.</p>
            <p className="dash-empty__body">
              Drop your link where your people already are — bio, close friends, a story sticker.
              Anonymous confessions, songs, and capsules show up here when they leave one.
            </p>
            <ol className="dash-empty__steps">
              <li><strong>Copy</strong> your Traces link below</li>
              <li><strong>Paste</strong> in Instagram, WhatsApp, or your bio</li>
              <li><strong>Wait</strong> — they write, you open when ready</li>
            </ol>
            <ProfileShare username={user.username} variant="growth" />
            <p className="dash-empty__hint">
              No feed. No pressure. Just words meant for you.
            </p>
          </div>
        )}
      </div>

      {/* AI Insights panel */}
      {showInsights && (
        <AIInsightPanel traces={deliveredTraces} onClose={() => setShowInsights(false)} />
      )}
    </>
  );
}
