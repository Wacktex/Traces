'use client';
// ================================================================
// TRACES — AIInsightPanel
// components/dashboard/AIInsightPanel.tsx
//
// Calls Claude to surface how others perceive the user
// based on the themes in their received traces.
// Deliberately tasteful — no personality-test energy.
// ================================================================

import { useState, useEffect }  from 'react';
import { LoadingDots }          from '@/components/shared';
import type { TraceWithCapsule } from '@/types';

interface Props {
  traces:   TraceWithCapsule[];
  onClose:  () => void;
}

export function AIInsightPanel({ traces, onClose }: Props) {
  const [insight,  setInsight]  = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  useEffect(() => {
    if (!traces.length) { setLoading(false); return; }

    const traceTexts = traces
      .map(t => `[${t.category.replace(/_/g, ' ')}] ${t.content}`)
      .join('\n');

    fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a thoughtful, emotionally intelligent reflection assistant for an app called Traces.
People leave anonymous messages for someone. Your job is to surface gentle, honest insights about how others perceive this person based on what was left for them.

Tone rules:
- Speak in second person ("people often see you as…")
- Warm but not saccharine. Honest but not harsh.
- Literary, not clinical. No horoscope language.
- Draw on what's actually there — no fabrication.
- 2–3 sentences of prose, then 3 short thematic phrases on new lines starting with an em dash
- No preamble. Begin directly with the prose insight.
- Total response: under 120 words.`,
        messages: [{
          role:    'user',
          content: `Anonymous traces left for this person:\n\n${traceTexts}\n\nWhat do these reveal about how others see them?`,
        }],
      }),
    })
    .then(r => r.json())
    .then(data => {
      const text = data.content?.find((b: any) => b.type === 'text')?.text ?? '';
      if (!text) throw new Error('empty');
      setInsight(text);
      setLoading(false);
    })
    .catch(() => {
      setError(true);
      setLoading(false);
    });
  }, [traces]);

  return (
    <div
      style={{
        position:        'fixed', inset: 0, zIndex: 200,
        background:      'rgba(11,11,12,0.93)',
        backdropFilter:  'blur(24px)',
        display:         'flex', alignItems: 'center', justifyContent: 'center',
        padding:         24, animation: 'fadeIn 0.3s ease both',
      }}
      onClick={onClose}
    >
      <div
        style={{ maxWidth: 520, width: '100%', animation: 'fadeUp 0.4s ease both', position: 'relative', zIndex: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em', color: '#6b6866', textTransform: 'uppercase', marginBottom: 28 }}>
          How others see you
        </p>

        {loading && (
          <div style={{ paddingBottom: 8 }}>
            <LoadingDots />
          </div>
        )}

        {!loading && error && (
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: '#7a7672', lineHeight: 1.7 }}>
            The traces reveal something worth sitting with.<br />Not all insights arrive at once.
          </p>
        )}

        {!loading && !error && insight && (
          <div style={{ fontFamily: 'var(--serif)', fontSize: 19, color: '#f0ece4', lineHeight: 1.75, fontWeight: 300, whiteSpace: 'pre-line' }}>
            {insight}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop:     40,
            background:    'none',
            border:        '1px solid rgba(255,255,255,0.08)',
            borderRadius:  100,
            padding:       '9px 24px',
            cursor:        'pointer',
            color:         '#6b6866',
            fontFamily:    'var(--sans)',
            fontSize:      12,
            letterSpacing: '0.1em',
            transition:    'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0ece4'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b6866'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          close
        </button>
      </div>
    </div>
  );
}
