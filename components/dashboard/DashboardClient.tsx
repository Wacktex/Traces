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
import { AmbientBg, ProfileShare }          from '@/components/shared';
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
    <div className="capsule-card" style={{
      background: 'var(--accent-navy-glass)', border: '1px solid rgba(45,74,62,0.4)',
      borderRadius: 20, padding: '22px',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 15, color: '#4a6080' }}>⧖</span>
        <span style={{ fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '0.16em', color: '#4a6080', textTransform: 'uppercase' }}>
          {comfort ? 'Comfort Capsule' : 'Time Capsule'}
        </span>
      </div>
      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: '#9ab0c8', marginBottom: 6 }}>
        Not everything arrives immediately.
      </p>
      <p style={{ fontFamily: 'var(--sans)', fontSize: 11.5, color: '#4a6080', marginBottom: comfort ? 14 : 0 }}>
        {labelText}
      </p>
      {comfort && (
        <button onClick={handleUnlock} disabled={unlocking} style={{
          background: 'none', border: '1px solid rgba(74,96,128,0.5)', borderRadius: 100,
          padding: '7px 16px', cursor: 'pointer', color: '#6a8ab0',
          fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.08em',
          opacity: unlocking ? 0.5 : 1, transition: 'all 0.2s',
        }}>
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
    <div className="notif-pill" style={{
      padding:    '12px 16px',
      background: 'var(--accent-olive-glass)',
      border:     '1px solid var(--accent-olive-border)',
      borderRadius: 12,
      animation:  'fadeIn 0.4s ease both',
    }}>
      <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', color: 'var(--accent-cream)', marginBottom: 2 }}>{copy.summary}</p>
      {copy.body && <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{copy.body}</p>}
    </div>
  );
}

// ── Trace card ────────────────────────────────────────────────────
function TraceCard({ trace }: { trace: TraceWithCapsule }) {
  const cat = CATEGORIES.find(c => c.id === trace.category);
  const locked = !trace.isViewed;

  return (
    <Link href={`/traces/${trace.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="trace-card" style={{
        background:  'var(--glass)',
        border:      '1px solid var(--glass-border)',
        borderRadius: 20,
        padding:     '20px 22px',
        cursor:      'pointer',
        transition:  'all 0.3s',
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.borderColor = 'rgba(255,255,255,0.14)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.borderColor = 'rgba(255,255,255,0.08)'; }}
      onClick={() => track('trace_opened', { category: trace.category })}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '0.14em', color: '#6b6866', textTransform: 'uppercase' }}>
            {cat?.icon} {cat?.label}
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Unread dot */}
            {locked && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8bfaa' }} />}
            <span style={{ fontFamily: 'var(--sans)', fontSize: 9.5, color: '#4a4846', letterSpacing: '0.08em' }}>
              {locked ? 'unopened' : 'opened'}
            </span>
          </div>
        </div>

        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14.5, color: '#9a9490', lineHeight: 1.55, marginBottom: 14 }}>
          {locked
            ? 'Someone left something for you. Open to read it.'
            : trace.clue
            ? `"${trace.clue}"`
            : 'You have opened this trace.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100,
            padding: '6px 16px', color: '#9a9490',
            fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.08em', display: 'inline-block',
          }}>{locked ? 'open trace' : 'read again'}</span>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 10, color: '#3a3836' }}>
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
      <span className="nav-brand" style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 300, letterSpacing: '0.14em', color: 'var(--text)' }}>traces</span>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center', position: 'relative' }}>
        {/* Notification indicator — subtle, no count */}
        {hasNew && (
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8bfaa', animation: 'pulse 2s ease infinite' }} />
        )}

        {/* Share link */}
        <Link href={`/${username}`} style={{
          fontFamily: 'var(--sans)', fontSize: 11, color: '#6b6866',
          textDecoration: 'none', letterSpacing: '0.08em', transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#f0ece4')}
        onMouseLeave={e => (e.currentTarget.style.color = '#6b6866')}
        >my profile</Link>

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

  return (
    <>
      <DashboardNav username={user.username} hasNew={hasNew} />

      <div className="dashboard-page" style={{ maxWidth: 640, margin: '0 auto', padding: '88px 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* Greeting */}
        <div style={{ marginBottom: 40, animation: 'fadeUp 0.5s ease both' }}>
          <h1 className="dash-greeting" style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 300, color: 'var(--text)', marginBottom: 10 }}>
            {greeting}, {user.username}.
          </h1>
          <div className="dash-stat" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', fontFamily: 'var(--sans)', fontSize: 'var(--text-md)', color: 'var(--muted)' }}>
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
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: '#4a4846' }}>You're all caught up.</span>
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
            <p className="dash-section-label" style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', letterSpacing: '0.2em', color: 'var(--subtle)', textTransform: 'uppercase', marginBottom: 14 }}>
              Waiting for you
            </p>
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
            <p className="dash-section-label" style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', letterSpacing: '0.2em', color: 'var(--subtle)', textTransform: 'uppercase', marginBottom: 14 }}>
              Sealed for later
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sealedCapsules.map(({ capsule }) => (
                <CapsuleCard key={capsule.id} capsule={capsule} />
              ))}
            </div>
          </div>
        )}

        {deliveredTraces.length >= 3 && (
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => setShowInsights(true)} style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100,
              padding: '9px 20px', cursor: 'pointer', color: '#9a9490',
              fontFamily: 'var(--sans)', fontSize: 11.5, letterSpacing: '0.08em', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0ece4'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9a9490'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >Reflect on your traces</button>
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          <ProfileShare username={user.username} />
        </div>

        {/* Empty state */}
        {deliveredTraces.length === 0 && sealedCapsules.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', animation: 'fadeUp 0.5s ease both' }}>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: '#4a4846', marginBottom: 12 }}>
              Nothing here yet.
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#3a3836', marginBottom: 8, lineHeight: 1.6 }}>
              Share your profile link. Traces and sealed capsules will show up here.
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 11.5, color: '#2a2826', marginBottom: 24 }}>
              No pressure to check often — they arrive when they are meant to.
            </p>
            <ProfileShare username={user.username} compact />
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
