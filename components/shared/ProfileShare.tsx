'use client';

import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { getProfileUrl } from '@/lib/profile-url';
import {
  instagramShareHint,
  profileShareMessage,
  profileShareTitle,
  shareChannelUrl,
} from '@/lib/share-links';
import { track } from '@/lib/analytics';

interface Props {
  username: string;
  compact?: boolean;
  variant?: 'default' | 'growth';
}

export function ProfileShare({ username, compact = false, variant = 'default' }: Props) {
  const profileUrl = getProfileUrl(username);
  const shareMessage = profileShareMessage(username);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

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
      setHint(null);
      track('profile_link_copied', { username });
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }, [profileUrl, username]);

  const copyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setHint('Message copied — paste into any chat.');
      track('profile_message_copied', { username });
    } catch {
      setHint('Could not copy. Try again.');
    }
  }, [shareMessage, username]);

  const nativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profileShareTitle(username),
          text: shareMessage,
          url: profileUrl,
        });
        track('profile_shared', { channel: 'native', username });
        return;
      } catch {
        /* cancelled */
      }
    }
    await copyLink();
  }, [username, profileUrl, shareMessage, copyLink]);

  const openChannel = useCallback(
    (channel: 'whatsapp' | 'telegram') => {
      const url = shareChannelUrl(channel, profileUrl, shareMessage);
      window.open(url, '_blank', 'noopener,noreferrer');
      track('profile_shared', { channel, username });
    },
    [profileUrl, shareMessage, username]
  );

  const instagramHint = useCallback(async () => {
    await copyLink();
    setHint(instagramShareHint());
    track('profile_shared', { channel: 'instagram', username });
  }, [copyLink, username]);

  const isGrowth = variant === 'growth';

  return (
    <div className={`profile-share${isGrowth ? ' profile-share--growth' : ''}${compact ? ' profile-share--compact' : ''}`}>
      {!compact && (
        <>
          <p className="profile-share__eyebrow type-eyebrow">
            {isGrowth ? 'Grow your inbox' : 'Share your profile'}
          </p>
          <p className="profile-share__headline">
            {isGrowth
              ? 'Your link is how people find you.'
              : 'One link for bio, close friends, and DMs.'}
          </p>
          <p className="profile-share__url">{profileUrl.replace(/^https?:\/\//, '')}</p>
        </>
      )}

      <div className="profile-share__actions">
        <button type="button" className="profile-share__btn profile-share__btn--primary" onClick={copyLink}>
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <button type="button" className="profile-share__btn" onClick={nativeShare}>
          Share…
        </button>
        <button type="button" className="profile-share__btn" onClick={copyMessage}>
          Copy message
        </button>
        <button type="button" className="profile-share__btn" onClick={() => openChannel('whatsapp')}>
          WhatsApp
        </button>
        <button type="button" className="profile-share__btn" onClick={() => openChannel('telegram')}>
          Telegram
        </button>
        <button type="button" className="profile-share__btn" onClick={instagramHint}>
          Instagram
        </button>
        <button type="button" className="profile-share__btn" onClick={() => setShowQr((v) => !v)}>
          {showQr ? 'Hide QR' : 'QR code'}
        </button>
      </div>

      {hint && <p className="profile-share__hint">{hint}</p>}

      {showQr && qrDataUrl && (
        <div className="profile-share__qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt={`QR code for ${username}`} width={200} height={200} />
        </div>
      )}
    </div>
  );
}
