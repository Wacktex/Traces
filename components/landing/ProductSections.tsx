'use client';

import { BtnGhostLink } from '@/components/shared';

const mockSurface: React.CSSProperties = {
  background: 'var(--glass)',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-sm)',
  backdropFilter: 'blur(16px)',
};

function MockPhone({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="demo-mock-phone" style={{
      ...mockSurface,
      borderRadius: 22,
      padding: '12px 10px 14px',
      border: '1px solid var(--glass-border-strong)',
      boxShadow: '0 24px 48px rgba(0,0,0,0.35), inset 0 1px 0 var(--glass-highlight)',
      maxWidth: 280,
      width: '100%',
      margin: '0 auto',
    }}>
      {label && (
        <p className="landing-eyebrow" style={{ marginBottom: 10, textAlign: 'center' }}>{label}</p>
      )}
      <div style={{
        background: 'var(--bg2)',
        borderRadius: 14,
        padding: 12,
        minHeight: 120,
      }}>
        {children}
      </div>
    </div>
  );
}

function StepArrow() {
  return (
    <div className="demo-step-arrow" aria-hidden style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--accent-cream)',
      opacity: 0.45,
      fontSize: 20,
      padding: '4px 0',
    }}>
      ↓
    </div>
  );
}

const DEMO_STEPS = [
  {
    n: '1',
    title: 'Open their link',
    mock: (
      <MockPhone label="traces.app/maya">
        <p style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--text)', textAlign: 'center', marginBottom: 6 }}>maya</p>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
          Leave a trace — no account needed.
        </p>
      </MockPhone>
    ),
  },
  {
    n: '2',
    title: 'Pick a category',
    mock: (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[
          { icon: '◐', label: 'Confession' },
          { icon: '♫', label: 'Song' },
          { icon: '△', label: 'Midnight' },
          { icon: '◎', label: 'First look' },
        ].map(c => (
          <div key={c.label} style={{
            ...mockSurface,
            padding: '10px 8px',
            borderRadius: 12,
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 14, display: 'block', marginBottom: 4, color: 'var(--accent-olive-light)' }}>{c.icon}</span>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text)' }}>{c.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    n: '3',
    title: 'Write the trace',
    mock: (
      <div style={{ ...mockSurface, padding: 12, borderRadius: 12 }}>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--subtle)', textTransform: 'uppercase', marginBottom: 8 }}>Confession · Ghost</p>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--text)', lineHeight: 1.55 }}>
          I never told you how much that night meant to me.
        </p>
      </div>
    ),
  },
  {
    n: '4',
    title: 'Choose delivery',
    mock: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { label: 'Arrive now', on: true },
          { label: 'In 7 days', on: false },
          { label: 'Open when needed', on: false },
        ].map(d => (
          <div key={d.label} style={{
            ...mockSurface,
            padding: '9px 12px',
            borderRadius: 100,
            border: d.on ? '1px solid var(--accent-olive-border)' : '1px solid var(--glass-border)',
            background: d.on ? 'var(--accent-olive-glass)' : 'transparent',
          }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: d.on ? 'var(--accent-cream)' : 'var(--muted)' }}>{d.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    n: '5',
    title: 'They receive it',
    mock: (
      <div style={{ ...mockSurface, padding: 14, borderRadius: 14, borderLeft: '3px solid var(--accent-olive-border)' }}>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--accent-olive-light)', textTransform: 'uppercase', marginBottom: 6 }}>New trace</p>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>
          Someone left you a confession.
        </p>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Delivered · Anonymous</p>
      </div>
    ),
  },
];

const FEATURE_MOCKUPS = [
  {
    title: 'Traces in your inbox',
    desc: 'New messages land on your dashboard — unopened until you are ready.',
    mock: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ ...mockSurface, padding: 14, borderRadius: 16 }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--accent-cream)', letterSpacing: '0.1em' }}>◐ CONFESSION · unopened</span>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--text)', marginTop: 8, lineHeight: 1.5 }}>
            I should have said this sooner.
          </p>
        </div>
        <div style={{ ...mockSurface, padding: 14, borderRadius: 16, opacity: 0.7 }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>♫ SONG · opened</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Comfort capsule',
    desc: 'A trace they open only on difficult days — you choose the words, they choose the moment.',
    mock: (
      <div style={{
        ...mockSurface,
        padding: 18,
        borderRadius: 18,
        background: 'var(--accent-navy-glass)',
        border: '1px solid rgba(45,74,62,0.35)',
      }}>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--accent-olive-light)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Comfort capsule</p>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--text)', lineHeight: 1.55, marginBottom: 12 }}>
          For the days when everything feels heavy.
        </p>
        <span style={{
          display: 'inline-block',
          fontFamily: 'var(--sans)',
          fontSize: 12,
          padding: '8px 16px',
          borderRadius: 100,
          border: '1px solid var(--accent-olive-border)',
          color: 'var(--accent-cream)',
        }}>Open when needed</span>
      </div>
    ),
  },
  {
    title: 'Scheduled delivery',
    desc: 'Send now, tomorrow, after finals, or on a date you pick.',
    mock: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ ...mockSurface, padding: '10px 14px', borderRadius: 12, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text)' }}>After graduation</span>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--accent-cream)' }}>Jun 12</span>
        </div>
        <div style={{ ...mockSurface, padding: '10px 14px', borderRadius: 12, opacity: 0.65 }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)' }}>In 7 days</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Anonymous modes',
    desc: 'Ghost, Shadow, Echo, or Signal — control how much someone can guess.',
    mock: (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[
          { id: 'Ghost', desc: 'Fully anonymous' },
          { id: 'Echo', desc: 'Small clue' },
        ].map(m => (
          <div key={m.id} style={{ ...mockSurface, padding: 12, borderRadius: 12 }}>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text)', marginBottom: 4 }}>{m.id}</p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)' }}>{m.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Your dashboard',
    desc: 'One calm place for every trace, capsule, and notification.',
    mock: (
      <div>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--text)', marginBottom: 10 }}>Good evening, maya.</p>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>2 traces wait · 1 sealed capsule</p>
        <div style={{ ...mockSurface, height: 36, borderRadius: 10, marginBottom: 6 }} />
        <div style={{ ...mockSurface, height: 36, borderRadius: 10 }} />
      </div>
    ),
  },
];

export function WhatIsTraces() {
  return (
    <section className="landing-section landing-what">
      <p className="landing-eyebrow">What is Traces?</p>
      <h2 className="landing-heading">
        Intentional messages,<br />
        <em>left anonymously.</em>
      </h2>
      <p className="landing-body landing-body--center">
        Traces lets people leave thoughtful anonymous messages — confessions, reflections,
        song reminders, first impressions, and time capsules — through your personal link.
        No group chat noise. No public feed. Just words meant for you.
      </p>
      <p className="landing-body landing-body--center landing-body--muted">
        Share one link in your bio or with close friends. Visitors pick a category, write honestly,
        choose when it arrives, and you open everything from a private dashboard.
      </p>
    </section>
  );
}

export function DemoWalkthrough() {
  return (
    <section className="landing-section landing-demo">
      <p className="landing-eyebrow">See the flow</p>
      <h2 className="landing-heading">From link to inbox</h2>
      <p className="landing-body landing-body--center" style={{ marginBottom: 40 }}>
        Five steps. No account for the person leaving a trace.
      </p>
      <div className="demo-steps">
        {DEMO_STEPS.map((step, i) => (
          <div key={step.n} className="demo-step">
            <div className="demo-step-header">
              <span className="demo-step-num">{step.n}</span>
              <h3 className="demo-step-title">{step.title}</h3>
            </div>
            <div className="demo-step-mock">{step.mock}</div>
            {i < DEMO_STEPS.length - 1 && <StepArrow />}
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowTracesWorksVisual() {
  return (
    <section className="landing-section landing-visual-how">
      <p className="landing-eyebrow">How Traces works</p>
      <h2 className="landing-heading">Built for real moments</h2>
      <p className="landing-body landing-body--center" style={{ marginBottom: 48 }}>
        Receive, schedule, stay anonymous, and keep everything in one place.
      </p>
      <div className="visual-how-grid">
        {FEATURE_MOCKUPS.map(f => (
          <article key={f.title} className="visual-how-card glass-card">
            <div className="visual-how-mock">{f.mock}</div>
            <h3 className="visual-how-title">{f.title}</h3>
            <p className="visual-how-desc">{f.desc}</p>
          </article>
        ))}
      </div>
      <div className="landing-cta-row">
        <BtnGhostLink href="/sign-up">Create your profile</BtnGhostLink>
      </div>
    </section>
  );
}
