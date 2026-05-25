'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BtnPrimary, BtnGhost } from '@/components/shared';

export function LeaveTraceTrigger({ style, className }: { style?: React.CSSProperties; className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BtnPrimary onClick={() => setOpen(true)} style={style} className={className}>
        Leave a trace
      </BtnPrimary>
      {open && <LeaveTraceModal onClose={() => setOpen(false)} />}
    </>
  );
}

function LeaveTraceModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/user-resolve?q=${encodeURIComponent(input.trim())}`);
      const data = await res.json();
      if (!data.found || !data.username) {
        setError('No profile found with that username. Check the spelling and try again.');
        setLoading(false);
        return;
      }
      router.push(`/${data.username}`);
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-trace-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="leave-trace-modal"
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#141416',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '28px 24px',
          position: 'relative',
          animation: 'fadeUp 0.3s ease both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2
          id="leave-trace-title"
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 24,
            fontWeight: 300,
            color: '#f0ece4',
            marginBottom: 8,
          }}
        >
          Who do you want to leave a trace for?
        </h2>
        <p
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 13,
            color: '#7a7672',
            marginBottom: 20,
            lineHeight: 1.55,
          }}
        >
          Enter their username or paste their Traces profile link.
        </p>
        <input
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setError('');
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') void handleSubmit();
          }}
          placeholder="username or profile link"
          autoFocus
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${error ? 'rgba(160,80,80,0.5)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 14,
            padding: '14px 16px',
            color: '#f0ece4',
            fontFamily: 'var(--sans)',
            fontSize: 14,
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: error ? 8 : 20,
          }}
        />
        {error && (
          <p
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 11,
              color: '#a05050',
              marginBottom: 16,
            }}
          >
            {error}
          </p>
        )}
        <div className="leave-trace-modal-actions" style={{ display: 'flex', gap: 10 }}>
          <BtnPrimary
            onClick={() => void handleSubmit()}
            disabled={!input.trim() || loading}
            style={{ flex: 1, padding: '13px 20px' }}
          >
            {loading ? 'Looking up…' : 'Continue'}
          </BtnPrimary>
          <BtnGhost onClick={onClose} style={{ padding: '13px 20px' }}>
            Cancel
          </BtnGhost>
        </div>
      </div>
    </div>
  );
}
