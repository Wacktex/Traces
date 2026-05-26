'use client';
// ================================================================
// TRACES — TraceReaderClient
// components/traces/TraceReaderClient.tsx
//
// Full-screen immersive trace reader. Wired to real DB record.
// Called from app/traces/[id]/page.tsx (server component).
// ================================================================

import { useState }                          from 'react';
import { useRouter }                         from 'next/navigation';
import { AmbientBg, SongCard }               from '@/components/shared';
import { StoryShare }                        from '@/components/traces/StoryShare';
import { CATEGORIES }                        from '@/components/profile';
import { actionReportTrace, actionBlockSender, actionOpenTrace } from '@/actions';
import { track }                             from '@/lib/analytics';
import { getEmotionalToneLabel, normalizeEmotionalTone } from '@/lib/emotional-tones';
import type { TraceWithCapsule }             from '@/types';

const REVEAL_LABELS: Record<string, string> = {
  ghost:  'Ghost — fully anonymous',
  shadow: 'Shadow — same city',
  echo:   'Echo — a clue was left',
  signal: 'Signal — reveal requested',
};

const REPORT_REASONS = [
  { id: 'harassment',     label: 'Harassment' },
  { id: 'hate_speech',    label: 'Hate speech' },
  { id: 'spam',           label: 'Spam' },
  { id: 'sexual_content', label: 'Sexual content' },
  { id: 'self_harm',      label: 'Self-harm' },
  { id: 'other',          label: 'Other' },
];

interface Props {
  trace:           TraceWithCapsule;
  username:        string;
  initiallyViewed: boolean;
}

export function TraceReaderClient({ trace, initiallyViewed }: Props) {
  const router = useRouter();
  const [opened, setOpened]       = useState(initiallyViewed);
  const [opening, setOpening]     = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showReport,  setShowReport]  = useState(false);
  const [reporting,   setReporting]   = useState(false);
  const [blocking,    setBlocking]    = useState(false);
  const [done,        setDone]        = useState<'reported' | 'blocked' | null>(null);

  const cat = CATEGORIES.find(c => c.id === trace.category);
  const storedTone = normalizeEmotionalTone(trace.emotional_tone);
  const toneLabel = storedTone ? getEmotionalToneLabel(storedTone) : null;

  const handleReport = async (reason: string) => {
    setReporting(true);
    try {
      await actionReportTrace({ traceId: trace.id, reason });
      setDone('reported');
      track('report_submitted', { reason });
    } catch {
      // silent fail — user already did the right thing
    }
    setReporting(false);
  };

  const handleBlock = async () => {
    setBlocking(true);
    try {
      await actionBlockSender(trace.id);
      setDone('blocked');
    } catch {}
    setBlocking(false);
  };

  const formattedDate = new Date(trace.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day:   'numeric',
    year:  'numeric',
  });

  const handleOpen = async () => {
    setOpening(true);
    setOpenError(null);
    const result = await actionOpenTrace(trace.id);
    if (result.success) {
      setOpened(true);
      track('trace_opened', { category: trace.category });
    } else {
      setOpenError(result.error ?? 'Could not open this trace. Try again.');
    }
    setOpening(false);
  };

  // ── Locked (unopened) ─────────────────────────────────────────
  if (!opened) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0B0C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', position: 'relative' }}>
        <AmbientBg />
        <button type="button" onClick={() => router.push('/')} style={{
          position: 'fixed', top: 24, left: 24, zIndex: 50,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6b6866', fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '0.08em',
        }}>← dashboard</button>
        <div style={{ maxWidth: 420, textAlign: 'center', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease both' }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em', color: '#6b6866', textTransform: 'uppercase', marginBottom: 20 }}>
            {cat?.icon} {cat?.label}
          </p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 300, color: '#f0ece4', marginBottom: 12 }}>
            A trace is waiting.
          </h2>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: '#7a7672', lineHeight: 1.7, marginBottom: 32 }}>
            Open it when you are ready. The message stays sealed until you do.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <button type="button" onClick={() => void handleOpen()} disabled={opening} style={{
              background: 'rgba(200,191,170,0.12)', border: '1px solid rgba(200,191,170,0.35)',
              borderRadius: 100, padding: '13px 32px', cursor: 'pointer', color: '#f0ece4',
              fontFamily: 'var(--sans)', fontSize: 13, letterSpacing: '0.06em',
              opacity: opening ? 0.6 : 1,
            }}>
              {opening ? 'Opening…' : 'Open trace'}
            </button>
            {openError && (
              <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#c47070', maxWidth: 320 }}>
                {openError}
              </p>
            )}
            <StoryShare
              categoryLabel={cat?.label ?? 'Trace'}
              categoryIcon={cat?.icon ?? '◌'}
              content=""
              opened={false}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Feedback confirmation state ───────────────────────────────
  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0B0C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <AmbientBg />
        <div style={{ textAlign: 'center', maxWidth: 400, animation: 'fadeUp 0.5s ease both', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 20, color: '#f0ece4', marginBottom: 12 }}>
            {done === 'reported' ? 'Trace reported.' : 'Sender blocked.'}
          </p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#7a7672', marginBottom: 28 }}>
            {done === 'reported'
              ? 'Our team will review it. Thank you for keeping Traces safe.'
              : 'You won\'t receive traces from this sender again.'}
          </p>
          <button onClick={() => router.push('/')} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100,
            padding: '10px 24px', cursor: 'pointer', color: '#f0ece4',
            fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '0.08em',
          }}>Back to dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', position: 'relative' }}>
      <AmbientBg />

      {/* Back */}
      <button onClick={() => router.push('/')} style={{
        position: 'fixed', top: 24, left: 24, zIndex: 50,
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#6b6866', fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '0.08em',
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#f0ece4')}
      onMouseLeave={e => (e.currentTarget.style.color = '#6b6866')}
      >← dashboard</button>

      <div style={{ maxWidth: 560, width: '100%', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease both' }}>

        {/* Category */}
        <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em', color: '#6b6866', textTransform: 'uppercase', marginBottom: 28 }}>
          {cat?.icon} {cat?.label}
        </p>

        {/* Song card */}
        {trace.song_url && (
          <div style={{ marginBottom: 28 }}>
            <SongCard
              title={trace.song_url.includes('spotify') ? 'Spotify Track' : 'Song'}
              artist="Open to listen"
              albumArt={null}
              spotifyUrl={trace.song_url}
              note={trace.song_note ?? undefined}
            />
          </div>
        )}

        {/* Content */}
        <p style={{
          fontFamily: 'var(--serif)',
          fontStyle:  'italic',
          fontSize:   'clamp(1.4rem, 4vw, 1.9rem)',
          fontWeight: 300,
          color:      '#f0ece4',
          lineHeight: 1.6,
          marginBottom: 28,
        }}>
          {trace.content}
        </p>

        {/* Clue */}
        {trace.clue && (
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: '#7a7672', marginBottom: 20, lineHeight: 1.6 }}>
            "{trace.clue}"
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#6b6866', letterSpacing: '0.08em' }}>
            {REVEAL_LABELS[trace.reveal_type] ?? 'Anonymous'}
          </span>
          {toneLabel && (
            <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#6b6866', letterSpacing: '0.08em' }}>
              Tone: {toneLabel}
            </span>
          )}
          <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#4a4846' }}>
            {formattedDate}
          </span>
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <StoryShare
            categoryLabel={cat?.label ?? 'Trace'}
            categoryIcon={cat?.icon ?? '◌'}
            content={trace.content}
            clue={trace.clue}
            opened
          />
          <button onClick={() => router.push('/')} style={{
            background:    'none',
            border:        '1px solid rgba(255,255,255,0.08)',
            borderRadius:  100,
            padding:       '9px 22px',
            cursor:        'pointer',
            color:         '#9a9490',
            fontFamily:    'var(--sans)',
            fontSize:      11.5,
            letterSpacing: '0.1em',
            transition:    'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0ece4'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9a9490'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >close</button>

          <button onClick={() => setShowActions(v => !v)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#4a4846', fontFamily: 'var(--sans)', fontSize: 11,
            letterSpacing: '0.08em', padding: '9px 0', transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#7a7672')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4a4846')}
          >•••</button>
        </div>

        {/* Expanded actions */}
        {showActions && (
          <div style={{
            marginTop: 16, padding: '16px 18px',
            background: 'rgba(255,255,255,0.022)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            animation: 'fadeUp 0.25s ease both',
          }}>
            {!showReport ? (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => setShowReport(true)} style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100,
                  padding: '7px 16px', cursor: 'pointer', color: '#7a7672',
                  fontFamily: 'var(--sans)', fontSize: 11.5, transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0ece4'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#7a7672'; }}
                >Report</button>

                <button onClick={handleBlock} disabled={blocking} style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100,
                  padding: '7px 16px', cursor: 'pointer', color: '#7a7672',
                  fontFamily: 'var(--sans)', fontSize: 11.5, transition: 'all 0.2s',
                  opacity: blocking ? 0.5 : 1,
                }}>Block sender</button>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#9a9490', marginBottom: 12 }}>
                  Why are you reporting this?
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {REPORT_REASONS.map(r => (
                    <button key={r.id} onClick={() => handleReport(r.id)} disabled={reporting} style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 100, padding: '6px 14px', cursor: 'pointer',
                      color: '#9a9490', fontFamily: 'var(--sans)', fontSize: 11,
                      opacity: reporting ? 0.5 : 1, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0ece4'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9a9490'; }}
                    >{r.label}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
