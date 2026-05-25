'use client';
// ================================================================
// TRACES — Landing Components
// components/landing/
// ================================================================

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AmbientBg, BtnGhostLink } from '@/components/shared';

// ── LandingNav.tsx ────────────────────────────────────────────────
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className="landing-nav" style={{
      position:       'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding:        '20px 32px',
      display:        'flex', alignItems: 'center', justifyContent: 'space-between',
      background:     scrolled ? 'rgba(11,11,12,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom:   scrolled ? '1px solid var(--glass-border)' : 'none',
      transition:     'all 0.4s',
    }}>
      <span className="nav-brand" style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 300, letterSpacing: '0.15em', color: 'var(--text)' }}>traces</span>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <BtnGhostLink href="/sign-in" className="btn-touch" style={{ padding: '10px 22px' }}>
          sign in
        </BtnGhostLink>
      </div>
    </nav>
  );
}

// ── FloatingCard.tsx ──────────────────────────────────────────────
function FloatingCard({ text, author, delay, style, className }: { text: string; author: string; delay: number; style: React.CSSProperties; className?: string }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);
  const tRef     = useRef(delay * 1000);

  useEffect(() => {
    const animate = () => {
      tRef.current += 16;
      setOffset({
        x: Math.sin(tRef.current / 3200) * 8,
        y: Math.cos(tRef.current / 2600) * 6,
      });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className={className} style={{
      position:       'absolute',
      background:     'var(--glass)',
      border:         '1px solid var(--glass-border)',
      backdropFilter: 'blur(20px)',
      borderRadius:   16,
      padding:        '14px 18px',
      maxWidth:       210,
      zIndex:         2,
      transform:      `translate(${offset.x}px, ${offset.y}px)`,
      transition:     'transform 0.1s linear',
      animation:      'fadeIn 1.2s ease both',
      animationDelay: `${delay}s`,
      ...style,
    }}>
      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.55, marginBottom: 6 }}>{text}</p>
      <span style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', color: 'var(--accent-olive-light)', letterSpacing: '0.1em' }}>{author}</span>
    </div>
  );
}

// ── LandingHero.tsx ───────────────────────────────────────────────
export function LandingHero({ ctas }: { ctas?: React.ReactNode }) {
  return (
    <section className="landing-hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '80px 24px 60px', overflow: 'hidden', background: 'var(--gradient-warm), var(--bg)' }}>
      <AmbientBg />
      <div className="landing-floating-cards" aria-hidden>
        <FloatingCard text="You seem quieter when things aren't okay." author="— Ghost" delay={0} className="landing-floating-card landing-floating-card--tl" style={{ top: '22%', left: '5%' }} />
        <FloatingCard text="This song made me think of you." author="— Echo" delay={1.2} className="landing-floating-card landing-floating-card--tr" style={{ top: '15%', right: '8%' }} />
        <FloatingCard text="You act strong for everyone else." author="— Shadow" delay={0.6} className="landing-floating-card landing-floating-card--br" style={{ bottom: '28%', right: '6%' }} />
      </div>

      <div className="landing-hero-content">
        <p className="landing-eyebrow" style={{ marginBottom: 28 }}>Anonymous traces</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--text-hero)', fontWeight: 300, lineHeight: 1.15, color: 'var(--text)', marginBottom: 22 }}>
          Some things are<br /><em style={{ fontStyle: 'italic', color: 'var(--accent-cream)' }}>easier left unsaid.</em>
        </h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-md)', color: 'var(--muted)', lineHeight: 'var(--leading-relaxed)', fontWeight: 400, marginBottom: 36 }}>
          Share one link. People leave anonymous confessions, reflections, and capsules—you open them when you are ready.
        </p>
        <div className="landing-hero-ctas">{ctas}</div>
      </div>
    </section>
  );
}

// ── HowItWorks.tsx ────────────────────────────────────────────────
const STEPS = [
  { n: '01', title: 'Share your profile',    desc: 'Your link lives in your bio. Clean, simple, unmistakably yours.' },
  { n: '02', title: 'People leave traces',   desc: 'Choose a category, write honestly, set a reveal mode. No account needed.' },
  { n: '03', title: 'Open them when ready',  desc: 'Some arrive now. Some wait for the right moment.' },
];

export function HowItWorks() {
  return (
    <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <p className="landing-eyebrow" style={{ marginBottom: 48 }}>How it works</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {STEPS.map(s => (
          <div key={s.n}
            className="glass-card"
            style={{ padding: '28px 24px', borderRadius: 'var(--radius)', transition: 'all 0.3s', cursor: 'default' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-olive-border)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)'; }}
          >
            <span style={{ fontFamily: 'var(--serif)', fontSize: 38, color: 'var(--accent-olive)', opacity: 0.5, display: 'block', marginBottom: 16 }}>{s.n}</span>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--text-lg)', color: 'var(--text)', marginBottom: 8, fontWeight: 400 }}>{s.title}</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', color: 'var(--muted)', lineHeight: 'var(--leading-normal)' }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── FeatureGrid.tsx ───────────────────────────────────────────────
const FEATURES = [
  { icon: '⧖', title: 'Time Capsules',    desc: 'Schedule for a date you choose — graduation, finals, birthday, or later.' },
  { icon: '♫', title: 'Song Traces',      desc: 'A Spotify link with a note. Music says what words can\'t.' },
  { icon: '◎', title: 'First Impressions',desc: 'The thing you noticed but never said out loud.' },
  { icon: '◐', title: 'Confessions',       desc: 'Honest words, completely anonymous. No context required.' },
  { icon: '◻', title: 'Memory Wall',      desc: 'A visual scrapbook of moments pinned by people who care.' },
  { icon: '△', title: 'Midnight Thoughts',desc: 'The 2am things you\'d never text. Leave them here instead.' },
];

export function FeatureGrid() {
  return (
    <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <p className="landing-eyebrow" style={{ marginBottom: 48 }}>What you can leave</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
        {FEATURES.map(f => (
          <div key={f.title}
            className="glass-card"
            style={{ padding: '24px 20px', borderRadius: 'var(--radius-sm)', transition: 'all 0.3s', cursor: 'default' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-olive-border)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)'; }}
          >
            <span style={{ fontSize: 18, display: 'block', marginBottom: 14, color: 'var(--accent-olive-light)' }}>{f.icon}</span>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--text-lg)', color: 'var(--text)', marginBottom: 6, fontWeight: 400 }}>{f.title}</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', color: 'var(--muted)', lineHeight: 'var(--leading-normal)' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── LandingFooter.tsx ─────────────────────────────────────────────
export function LandingFooter() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '56px 24px', textAlign: 'center' }}>
      <span style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 300, letterSpacing: '0.15em', display: 'block', marginBottom: 10, color: '#f0ece4' }}>traces</span>
      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: '#6b6866', marginBottom: 28 }}>Leave a trace, not just a message.</p>
      <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#2a2826', marginTop: 8 }}>© 2026 Traces</p>
    </footer>
  );
}
