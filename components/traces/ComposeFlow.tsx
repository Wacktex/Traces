'use client';
// ================================================================
// TRACES — ComposeFlow
// components/traces/ComposeFlow.tsx
//
// Multi-step trace creation:
//   Step 0 — Category (if not pre-selected)
//   Step 1 — Write content
//   Step 2 — Reveal, tone, delivery
//   Step 3 — Preview
//   Step 4 — Confirmation
// ================================================================

import { useState, useCallback } from 'react';
import { AmbientBg, BackBtn, BtnPrimary, SongCard, Spinner } from '@/components/shared';
import { CategoryGrid, CATEGORIES, type CategoryId }         from '@/components/profile';
import { actionCreateTrace }                                  from '@/actions';
import { track }                                              from '@/lib/analytics';
import {
  DELIVERY_OPTIONS,
  DELIVERY_SECTION_LABELS,
  deliveryRequiresDate,
  type DeliverySection,
} from '@/lib/delivery';
import { EMOTIONAL_TONES } from '@/lib/emotional-tones';
import { getSubmitSuccessCopy } from '@/lib/success-copy';
import type { PublicProfile, RevealType, DeliveryMode, EmotionalTone } from '@/types';

// ── Reveal mode config ────────────────────────────────────────────
const REVEAL_MODES: { id: RevealType; label: string; desc: string }[] = [
  { id: 'ghost',  label: 'Ghost',  desc: 'Fully anonymous' },
  { id: 'shadow', label: 'Shadow', desc: 'Same city hint' },
  { id: 'echo',   label: 'Echo',   desc: 'Small clue' },
  { id: 'signal', label: 'Signal', desc: 'Reveal request' },
];

const DELIVERY_SECTIONS: DeliverySection[] = ['now', 'soon', 'milestone', 'comfort', 'date'];

const dateInputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 12,
  padding: '10px 14px',
  color: '#f0ece4',
  fontFamily: 'var(--sans)',
  fontSize: 13,
  outline: 'none',
  colorScheme: 'dark',
};

// ── Section label ─────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.18em', color: '#6b6866', textTransform: 'uppercase', marginBottom: 12 }}>
      {children}
    </p>
  );
}

// ── Step 1 — Write ────────────────────────────────────────────────
function StepWrite({
  category, content, setContent, songUrl, setSongUrl, onContinue, onBack, profile,
}: {
  category: CategoryId; content: string; setContent: (v: string) => void;
  songUrl: string; setSongUrl: (v: string) => void;
  onContinue: () => void; onBack: () => void; profile: PublicProfile;
}) {
  const cat      = CATEGORIES.find(c => c.id === category)!;
  const isSong   = category === 'song_reminder';
  const canContinue = content.trim().length > 0 || (isSong && songUrl.trim().length > 0);

  return (
    <div className="compose-flow" style={{ minHeight: '100vh', background: '#0B0B0C', padding: '64px 20px 40px', position: 'relative' }}>
      <AmbientBg />
      <BackBtn onClick={onBack} />
      <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease both' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em', color: '#6b6866', textTransform: 'uppercase', marginBottom: 8 }}>
            {cat.icon} {cat.label}
          </p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 300, color: '#f0ece4' }}>
            Leave a trace for {profile.username}
          </h2>
        </div>

        {/* Spotify URL (song traces) */}
        {isSong && (
          <div style={{ marginBottom: 14 }}>
            <SectionLabel>Spotify link</SectionLabel>
            <input
              type="url"
              value={songUrl}
              onChange={e => setSongUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/…"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
                padding: '13px 16px', color: '#f0ece4',
                fontFamily: 'var(--sans)', fontSize: 13, outline: 'none',
                transition: 'border-color 0.2s', boxSizing: 'border-box',
              }}
              onFocus={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.18)')}
              onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
            {songUrl && (
              <div style={{ marginTop: 10 }}>
                <SongCard title="Spotify Track" artist="Open in Spotify" albumArt={null} spotifyUrl={songUrl} note={null} />
              </div>
            )}
          </div>
        )}

        {/* Content textarea */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={isSong ? '"This reminded me of you." (optional note)' : cat.placeholder}
          rows={6}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
            padding: '18px', color: '#f0ece4',
            fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 300, lineHeight: 1.7,
            resize: 'none', outline: 'none', transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.16)')}
          onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
        />

        <div style={{ marginTop: 24 }}>
          <BtnPrimary onClick={onContinue} disabled={!canContinue} style={{ padding: '12px 32px' }}>
            Continue
          </BtnPrimary>
        </div>
      </div>
    </div>
  );
}

// ── Step 2 — Options ──────────────────────────────────────────────
function StepOptions({
  revealMode, setRevealMode,
  emotionalTone, setEmotionalTone,
  deliveryMode, setDeliveryMode,
  clue, setClue,
  customDate, setCustomDate,
  milestoneDate, setMilestoneDate,
  onContinue, onBack,
  optionsError,
}: {
  revealMode: RevealType;      setRevealMode: (v: RevealType) => void;
  emotionalTone: EmotionalTone; setEmotionalTone: (v: EmotionalTone) => void;
  deliveryMode: DeliveryMode;  setDeliveryMode: (v: DeliveryMode) => void;
  clue: string;                setClue: (v: string) => void;
  customDate: string;          setCustomDate: (v: string) => void;
  milestoneDate: string;       setMilestoneDate: (v: string) => void;
  onContinue: () => void;      onBack: () => void;
  optionsError: string;
}) {
  const needsMilestoneDate = deliveryMode.startsWith('milestone_');
  return (
    <div className="compose-flow" style={{ minHeight: '100vh', background: '#0B0B0C', padding: '64px 20px 40px', position: 'relative' }}>
      <AmbientBg />
      <BackBtn onClick={onBack} />
      <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease both' }}>

        {/* Reveal mode */}
        <div style={{ marginBottom: 32 }}>
          <SectionLabel>How anonymous?</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {REVEAL_MODES.map(mode => (
              <button key={mode.id} onClick={() => setRevealMode(mode.id)} style={{
                background:    revealMode === mode.id ? 'rgba(200,191,170,0.07)' : 'rgba(255,255,255,0.025)',
                border:        `1px solid ${revealMode === mode.id ? 'rgba(200,191,170,0.35)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius:  14, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                transition:    'all 0.2s',
              }}>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#f0ece4', fontWeight: 500, marginBottom: 3 }}>{mode.label}</p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#6b6866' }}>{mode.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Clue field for echo / shadow */}
        {(revealMode === 'echo' || revealMode === 'shadow') && (
          <div style={{ marginBottom: 28, animation: 'fadeUp 0.3s ease both' }}>
            <SectionLabel>Leave a clue (optional)</SectionLabel>
            <input
              value={clue}
              onChange={e => setClue(e.target.value)}
              placeholder={revealMode === 'shadow' ? 'Someone from your city…' : 'Someone from your Tuesday class…'}
              maxLength={120}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12,
                padding: '12px 14px', color: '#f0ece4',
                fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15,
                outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.16)')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
            />
          </div>
        )}

        {/* Emotional tone */}
        <div style={{ marginBottom: 32 }}>
          <SectionLabel>Emotional tone</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EMOTIONAL_TONES.map(t => (
              <button key={t.id} onClick={() => setEmotionalTone(t.id)} style={{
                background: emotionalTone === t.id ? 'rgba(200,191,170,0.08)' : 'none',
                border: `1px solid ${emotionalTone === t.id ? 'rgba(200,191,170,0.3)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 100, padding: '7px 14px', cursor: 'pointer',
                fontFamily: 'var(--sans)', fontSize: 12,
                color: emotionalTone === t.id ? '#f0ece4' : '#7a7672',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Delivery */}
        <div style={{ marginBottom: 32 }}>
          <SectionLabel>When should it arrive?</SectionLabel>
          {DELIVERY_SECTIONS.map(section => {
            const options = DELIVERY_OPTIONS.filter(o => o.section === section);
            if (!options.length) return null;
            return (
              <div key={section} style={{ marginBottom: 18 }}>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 10, color: '#4a4846', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {DELIVERY_SECTION_LABELS[section]}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {options.map(mode => (
                    <button key={mode.id} onClick={() => setDeliveryMode(mode.id)} style={{
                      background: deliveryMode === mode.id ? 'rgba(255,255,255,0.07)' : 'none',
                      border: `1px solid ${deliveryMode === mode.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 100, padding: '8px 16px', cursor: 'pointer',
                      fontFamily: 'var(--sans)', fontSize: 12,
                      color: deliveryMode === mode.id ? '#f0ece4' : '#7a7672',
                    }}>{mode.label}</button>
                  ))}
                </div>
                {options.some(o => o.id === deliveryMode && o.hint) && (
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#5a5856', marginTop: 8 }}>
                    {options.find(o => o.id === deliveryMode)?.hint}
                  </p>
                )}
              </div>
            );
          })}

          {needsMilestoneDate && (
            <div style={{ marginTop: 8, animation: 'fadeUp 0.3s ease both' }}>
              <SectionLabel>Unlock date</SectionLabel>
              <input
                type="date"
                value={milestoneDate}
                onChange={e => setMilestoneDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={dateInputStyle}
              />
            </div>
          )}

          {deliveryMode === 'custom' && (
            <div style={{ marginTop: 8, animation: 'fadeUp 0.3s ease both' }}>
              <SectionLabel>Arrival date</SectionLabel>
              <input
                type="date"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={dateInputStyle}
              />
            </div>
          )}
        </div>

        {optionsError && (
          <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#a05050', marginBottom: 16 }}>
            {optionsError}
          </p>
        )}

        <BtnPrimary onClick={onContinue} style={{ width: '100%', padding: '14px' }}>
          Preview trace
        </BtnPrimary>
      </div>
    </div>
  );
}

// ── Step 3 — Preview ──────────────────────────────────────────────
function StepPreview({
  category, content, songUrl, revealMode, emotionalTone, deliveryMode,
  customDate, milestoneDate, onSubmit, onBack, submitting, error,
}: {
  category: CategoryId; content: string; songUrl: string;
  revealMode: RevealType; emotionalTone: EmotionalTone; deliveryMode: DeliveryMode;
  customDate: string; milestoneDate: string;
  onSubmit: () => void; onBack: () => void; submitting: boolean; error: string;
}) {
  const cat = CATEGORIES.find(c => c.id === category)!;
  const deliveryLabel = DELIVERY_OPTIONS.find(o => o.id === deliveryMode)?.label ?? deliveryMode;
  const toneLabel = EMOTIONAL_TONES.find(t => t.id === emotionalTone)?.label ?? emotionalTone;
  const dateLabel =
    deliveryMode === 'custom'
      ? customDate
      : deliveryMode.startsWith('milestone_')
      ? milestoneDate
      : null;

  return (
    <div className="compose-flow" style={{ minHeight: '100vh', background: '#0B0B0C', padding: '64px 20px 40px', position: 'relative' }}>
      <AmbientBg />
      <BackBtn onClick={onBack} />
      <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease both' }}>
        <SectionLabel>Preview</SectionLabel>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 300, color: '#f0ece4', marginBottom: 24 }}>
          Ready to leave this trace?
        </h2>

        <div style={{
          background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '20px', marginBottom: 24,
        }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.16em', color: '#6b6866', textTransform: 'uppercase', marginBottom: 12 }}>
            {cat.icon} {cat.label}
          </p>
          {songUrl && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#7a7672', marginBottom: 10 }}>Song link included</p>}
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: '#d8d4cc', lineHeight: 1.65, marginBottom: 16 }}>
            {content.trim() || (category === 'song_reminder' ? 'A song for you.' : '…')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--sans)', fontSize: 11.5, color: '#6b6866' }}>
            <span>Reveal: {REVEAL_MODES.find(m => m.id === revealMode)?.label}</span>
            <span>Tone: {toneLabel}</span>
            <span>Delivery: {deliveryLabel}{dateLabel ? ` · ${dateLabel}` : ''}</span>
          </div>
        </div>

        {error && (
          <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#a05050', marginBottom: 16 }}>{error}</p>
        )}

        <BtnPrimary onClick={onSubmit} disabled={submitting} style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          {submitting ? <><Spinner size={14} /> Leaving trace…</> : 'Leave trace'}
        </BtnPrimary>
      </div>
    </div>
  );
}

// ── Step 4 — Confirmation ─────────────────────────────────────────
function StepDone({
  title, body, onAnother, onBack,
}: { title: string; body: string; onAnother: () => void; onBack: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <AmbientBg />
      <div style={{ textAlign: 'center', maxWidth: 400, animation: 'fadeUp 0.6s ease both', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 44, color: '#6b6866', marginBottom: 24, animation: 'pulse 2.5s ease infinite' }}>◌</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 300, color: '#f0ece4', marginBottom: 14 }}>
          {title}
        </h2>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: '#7a7672', lineHeight: 1.75, marginBottom: 36 }}>
          {body}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <BtnPrimary onClick={onAnother} style={{ padding: '12px 28px' }}>Leave another</BtnPrimary>
          <button onClick={onBack} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100,
            padding: '12px 28px', cursor: 'pointer', color: '#f0ece4',
            fontFamily: 'var(--sans)', fontSize: 13, letterSpacing: '0.04em',
          }}>Back to profile</button>
        </div>
      </div>
    </div>
  );
}

// ── ComposeFlow ───────────────────────────────────────────────────
interface ComposeFlowProps {
  profile:         PublicProfile;
  initialCategory: CategoryId;
  onBack:          () => void;
  onSubmitted?:    () => void;
}

export function ComposeFlow({ profile, initialCategory, onBack, onSubmitted }: ComposeFlowProps) {
  const [step,           setStep]           = useState<1 | 2 | 3 | 4>(1);
  const [category,       setCategory]       = useState<CategoryId>(initialCategory);
  const [content,        setContent]        = useState('');
  const [songUrl,        setSongUrl]        = useState('');
  const [revealMode,     setRevealMode]     = useState<RevealType>('ghost');
  const [emotionalTone,  setEmotionalTone]  = useState<EmotionalTone>('neutral');
  const [deliveryMode,   setDeliveryMode]   = useState<DeliveryMode>('now');
  const [clue,           setClue]           = useState('');
  const [customDate,     setCustomDate]     = useState('');
  const [milestoneDate,  setMilestoneDate]  = useState('');
  const [submitting,     setSubmitting]     = useState(false);
  const [error,          setError]          = useState('');
  const [optionsError,   setOptionsError]   = useState('');
  const [successCopy,    setSuccessCopy]    = useState({ title: '', body: '' });

  const validateOptions = useCallback(() => {
    if (deliveryRequiresDate(deliveryMode)) {
      const d = deliveryMode === 'custom' ? customDate : milestoneDate;
      if (!d) {
        setOptionsError('Choose a date for this delivery option.');
        return false;
      }
    }
    setOptionsError('');
    return true;
  }, [deliveryMode, customDate, milestoneDate]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError('');

    try {
      const result = await actionCreateTrace({
        receiverUsername: profile.username,
        content: content.trim() || (category === 'song_reminder' ? 'A song for you.' : ''),
        category,
        revealType:   revealMode,
        deliveryMode,
        customDate: deliveryMode === 'custom' ? customDate : undefined,
        milestoneDate: deliveryMode.startsWith('milestone_') ? milestoneDate : undefined,
        emotionalTone: emotionalTone !== 'neutral' ? emotionalTone : undefined,
        clue:         clue || undefined,
        songUrl:      songUrl.trim() || undefined,
        songNote:     category === 'song_reminder' && content.trim() ? content.trim() : undefined,
      });

      if (!result.success) {
        setError(result.rateLimited
          ? 'Too many traces recently. Try again in an hour.'
          : result.error ?? 'Something went wrong.');
        setSubmitting(false);
        return;
      }

      track('trace_submitted', { category, reveal_type: revealMode, delivery_mode: deliveryMode });
      setSuccessCopy(getSubmitSuccessCopy(deliveryMode, category));
      setStep(4);
      onSubmitted?.();
    } catch {
      setError('Something went wrong. Your trace wasn\'t lost — try again.');
    }

    setSubmitting(false);
  }, [content, songUrl, category, revealMode, emotionalTone, deliveryMode, clue, customDate, milestoneDate, profile.username, onSubmitted]);

  const handleAnother = () => {
    setStep(1);
    setContent('');
    setSongUrl('');
    setRevealMode('ghost');
    setEmotionalTone('neutral');
    setDeliveryMode('now');
    setClue('');
    setCustomDate('');
    setMilestoneDate('');
    setError('');
    setOptionsError('');
  };

  if (step === 1) return (
    <StepWrite
      category={category}
      content={content}
      setContent={setContent}
      songUrl={songUrl}
      setSongUrl={setSongUrl}
      onContinue={() => setStep(2)}
      onBack={onBack}
      profile={profile}
    />
  );

  if (step === 2) return (
    <StepOptions
      revealMode={revealMode}         setRevealMode={setRevealMode}
      emotionalTone={emotionalTone}   setEmotionalTone={setEmotionalTone}
      deliveryMode={deliveryMode}     setDeliveryMode={setDeliveryMode}
      clue={clue}                     setClue={setClue}
      customDate={customDate}         setCustomDate={setCustomDate}
      milestoneDate={milestoneDate}   setMilestoneDate={setMilestoneDate}
      onContinue={() => { if (validateOptions()) setStep(3); }}
      onBack={() => setStep(1)}
      optionsError={optionsError}
    />
  );

  if (step === 3) return (
    <StepPreview
      category={category}
      content={content}
      songUrl={songUrl}
      revealMode={revealMode}
      emotionalTone={emotionalTone}
      deliveryMode={deliveryMode}
      customDate={customDate}
      milestoneDate={milestoneDate}
      onSubmit={handleSubmit}
      onBack={() => setStep(2)}
      submitting={submitting}
      error={error}
    />
  );

  if (step === 4) return (
    <StepDone
      title={successCopy.title}
      body={successCopy.body}
      onAnother={handleAnother}
      onBack={onBack}
    />
  );

  return null;
}
