'use client';
// ================================================================
// TRACES — OnboardingForm
// components/onboarding/OnboardingForm.tsx
// ================================================================

import { useState, useRef }          from 'react';
import { AmbientBg, BtnPrimary }     from '@/components/shared';
import { actionCompleteOnboarding }  from '@/actions';

interface Props {
  defaultUsername: string;
}

export function OnboardingForm({ defaultUsername }: Props) {
  const [username, setUsername]   = useState(defaultUsername ?? '');
  const [bio,      setBio]        = useState('');
  const [error,    setError]      = useState('');
  const [checking, setChecking]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const isValidFormat = /^[a-z0-9_]{2,20}$/.test(username);

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
    setUsername(clean);
    setError('');

    if (clean.length < 2) return;
    if (!/^[a-z0-9_]{2,20}$/.test(clean)) {
      setError('Lowercase letters, numbers, underscores. 2–20 characters.');
      return;
    }

    // Debounced availability check
    clearTimeout(debounceRef.current);
    setChecking(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/username-check?username=${clean}`);
        const data = await res.json();
        if (!data.available) {
          setError(
            data.reason === 'reserved' || data.reason === 'invalid_format'
              ? 'That username is not available.'
              : 'That username is already taken.'
          );
        }
      } catch {
        // Non-blocking — let server action handle final validation
      }
      setChecking(false);
    }, 500);
  };

  const handleSubmit = async () => {
    if (!isValidFormat || error || checking) return;
    setSubmitting(true);
    setError('');
    const result = await actionCompleteOnboarding({ username, bio: bio || undefined });
    if (result && !result.success) {
      setError(result.error ?? 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <AmbientBg />
      <div style={{ maxWidth: 440, width: '100%', position: 'relative', zIndex: 1, animation: 'fadeUp 0.6s ease both' }}>

        {/* Header */}
        <p style={{ fontFamily: 'var(--sans)', fontSize: 10.5, letterSpacing: '0.2em', color: '#6b6866', textTransform: 'uppercase', marginBottom: 10 }}>
          Welcome to Traces
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 300, color: '#f0ece4', marginBottom: 8, lineHeight: 1.2 }}>
          Choose your name<br />in the dark.
        </h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#7a7672', marginBottom: 40, lineHeight: 1.65 }}>
          This becomes your URL. Share it wherever you want people to find you.
        </p>

        {/* Username */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.18em', color: '#6b6866', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Username
          </label>
          <div style={{ position: 'relative' }}>
            <span className="onboarding-username-prefix" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--sans)', fontSize: 13, color: '#4a4846', pointerEvents: 'none' }}>
              traces.app/
            </span>
            <input
              className="onboarding-username-input"
              value={username}
              onChange={e => handleUsernameChange(e.target.value)}
              placeholder="yourname"
              autoComplete="off"
              spellCheck={false}
              style={{
                width: '100%',
                background:    'rgba(255,255,255,0.03)',
                border:        `1px solid ${error ? 'rgba(160,80,80,0.5)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius:  14,
                padding:       '14px 14px 14px 108px',
                color:         '#f0ece4',
                fontFamily:    'var(--sans)',
                fontSize:      14,
                outline:       'none',
                transition:    'border-color 0.2s',
                boxSizing:     'border-box',
              }}
              onFocus={e  => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.18)'; }}
              onBlur={e   => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
            {checking && (
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--sans)', fontSize: 10, color: '#6b6866' }}>
                checking…
              </span>
            )}
            {!checking && !error && username.length >= 2 && (
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#3a6b50', fontSize: 14 }}>✓</span>
            )}
          </div>
          {error && (
            <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#a05050', marginTop: 6, animation: 'fadeIn 0.2s ease both' }}>
              {error}
            </p>
          )}
        </div>

        {/* Bio */}
        <div style={{ marginBottom: 36 }}>
          <label style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.18em', color: '#6b6866', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Bio <span style={{ color: '#3a3836' }}>(optional)</span>
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="A line or two about yourself…"
            rows={2}
            maxLength={120}
            style={{
              width:      '100%',
              background: 'rgba(255,255,255,0.025)',
              border:     '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              padding:    '12px 14px',
              color:      '#f0ece4',
              fontFamily: 'var(--serif)',
              fontStyle:  'italic',
              fontSize:   15,
              resize:     'none',
              outline:    'none',
              transition: 'border-color 0.2s',
              boxSizing:  'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.16)')}
            onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
          />
          <p style={{ fontFamily: 'var(--sans)', fontSize: 10, color: '#3a3836', textAlign: 'right', marginTop: 4 }}>
            {bio.length}/120
          </p>
        </div>

        <BtnPrimary
          onClick={handleSubmit}
          disabled={!isValidFormat || !!error || submitting || checking}
          style={{ width: '100%', padding: '14px', fontSize: 14 }}
        >
          {submitting ? 'Setting up…' : 'Continue to Traces'}
        </BtnPrimary>
      </div>
    </div>
  );
}
