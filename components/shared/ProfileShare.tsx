'use client';

import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { getProfileUrl } from '@/lib/profile-url';

interface Props {
  username: string;
  compact?: boolean;
}

export function ProfileShare({ username, compact = false }: Props) {
  const profileUrl = getProfileUrl(username);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!showQr) return;
    let cancelled = false;
    QRCode.toDataURL(profileUrl, {
      width: 200,
      margin: 2,
      color: { dark: '#f0ece4', light: '#0B0B0C' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [showQr, profileUrl]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }, [profileUrl]);

  const shareProfile = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username} on Traces`,
          text: 'Leave an anonymous trace',
          url: profileUrl,
        });
        return;
      } catch {
        /* user cancelled or unsupported */
      }
    }
    await copyLink();
  }, [username, profileUrl, copyLink]);

  const btn: React.CSSProperties = {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 100,
    padding: compact ? '8px 16px' : '9px 20px',
    cursor: 'pointer',
    color: '#9a9490',
    fontFamily: 'var(--sans)',
    fontSize: 11.5,
    letterSpacing: '0.08em',
    transition: 'all 0.2s',
  };

  return (
    <div
      style={{
        padding: compact ? 0 : '20px 24px',
        background: compact ? 'transparent' : 'rgba(255,255,255,0.018)',
        border: compact ? 'none' : '1px solid rgba(255,255,255,0.05)',
        borderRadius: compact ? 0 : 16,
      }}
    >
      {!compact && (
        <>
          <p
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 11,
              letterSpacing: '0.14em',
              color: '#6b6866',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Share your profile
          </p>
          <p
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 13,
              color: '#7a7672',
              marginBottom: 14,
              wordBreak: 'break-all',
            }}
          >
            {profileUrl.replace(/^https?:\/\//, '')}
          </p>
        </>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={copyLink} style={btn}>
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <button type="button" onClick={shareProfile} style={btn}>
          Share
        </button>
        <button
          type="button"
          onClick={() => setShowQr((v) => !v)}
          style={btn}
        >
          {showQr ? 'Hide QR' : 'QR code'}
        </button>
      </div>

      {showQr && qrDataUrl && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 12,
            display: 'inline-block',
            animation: 'fadeUp 0.3s ease both',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt={`QR code for ${username}`} width={200} height={200} />
        </div>
      )}
    </div>
  );
}
