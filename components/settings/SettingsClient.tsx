'use client';
// ================================================================
// TRACES — SettingsClient
// components/settings/SettingsClient.tsx
// ================================================================

import { useState, useRef }        from 'react';
import Link                        from 'next/link';
import { useClerk }                from '@clerk/nextjs';
import { AmbientBg, BtnPrimary, ProfileShare } from '@/components/shared';
import { actionUpdateProfile }     from '@/actions';
import type { User }               from '@/types';

interface Props { user: User }

export function SettingsClient({ user }: Props) {
  const { signOut } = useClerk();
  const [username, setUsername] = useState(user.username);
  const [bio,      setBio]      = useState(user.bio ?? '');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');
  const [checking, setChecking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
    setUsername(clean);
    if (clean === user.username) {
      setError('');
      return;
    }
    if (clean.length < 2) return;
    clearTimeout(debounceRef.current);
    setChecking(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username-check?username=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (!data.available) {
          setError(data.reason === 'reserved' ? 'That username is not available.' : 'That username is already taken.');
        } else {
          setError('');
        }
      } catch { /* server validates on save */ }
      setChecking(false);
    }, 500);
  };

  const handleSave = async () => {
    if (error || checking) return;
    setSaving(true);
    setError('');
    setSaved(false);
    const result = await actionUpdateProfile({ username, bio });
    if (!result.success) {
      setError(result.error ?? 'Update failed.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  const label: React.CSSProperties = {
    fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.18em',
    color: '#6b6866', textTransform: 'uppercase', display: 'block', marginBottom: 8,
  };

  const inputBase: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
    padding: '13px 16px', color: '#f0ece4',
    fontFamily: 'var(--sans)', fontSize: 13, outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', padding: '80px 20px 60px', position: 'relative' }}>
      <AmbientBg />

      <Link href="/dashboard" style={{
        position: 'fixed', top: 24, left: 24, zIndex: 50,
        color: '#6b6866', fontFamily: 'var(--sans)', fontSize: 12,
        letterSpacing: '0.08em', textDecoration: 'none', transition: 'color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#f0ece4')}
      onMouseLeave={e => (e.currentTarget.style.color = '#6b6866')}
      >← dashboard</Link>

      <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease both' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 300, color: '#f0ece4', marginBottom: 40 }}>
          Settings
        </h1>

        {/* Profile section */}
        <div style={{ marginBottom: 32, padding: '24px', background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20 }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.14em', color: '#6b6866', textTransform: 'uppercase', marginBottom: 20 }}>Profile</p>

          <div style={{ marginBottom: 16 }}>
            <label style={label}>Username</label>
            <input
              value={username}
              onChange={e => handleUsernameChange(e.target.value)}
              style={inputBase}
              onFocus={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.18)')}
              onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={label}>Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={120}
              rows={2}
              style={{ ...inputBase, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, resize: 'none', borderRadius: 12 }}
              onFocus={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.18)')}
              onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
            <p style={{ fontFamily: 'var(--sans)', fontSize: 10, color: '#3a3836', textAlign: 'right', marginTop: 4 }}>{bio.length}/120</p>
          </div>

          {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#a05050', marginBottom: 12 }}>{error}</p>}
          {saved && <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#3a6b50', marginBottom: 12, animation: 'fadeIn 0.3s ease both' }}>Saved.</p>}

          <BtnPrimary onClick={handleSave} disabled={saving || checking || !!error} style={{ padding: '10px 24px' }}>
            {saving ? 'Saving…' : checking ? 'Checking…' : 'Save changes'}
          </BtnPrimary>
        </div>

        <div style={{ marginBottom: 32 }}>
          <ProfileShare username={user.username} />
        </div>

        {/* Danger zone */}
        <div style={{ padding: '20px 24px', background: 'rgba(61,31,36,0.15)', border: '1px solid rgba(61,31,36,0.35)', borderRadius: 16 }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.14em', color: '#7a4040', textTransform: 'uppercase', marginBottom: 12 }}>Account</p>
          <button onClick={() => signOut()} style={{
            background: 'none', border: '1px solid rgba(160,80,80,0.3)', borderRadius: 100,
            padding: '8px 18px', cursor: 'pointer', color: '#9a6060',
            fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '0.08em', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(160,80,80,0.6)'; (e.currentTarget as HTMLElement).style.color = '#c08080'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(160,80,80,0.3)'; (e.currentTarget as HTMLElement).style.color = '#9a6060'; }}
          >Sign out</button>
        </div>
      </div>
    </div>
  );
}
