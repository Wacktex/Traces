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
      background:     scrolled ? 'rgba(11,11,12,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom:   scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
      transition:     'all 0.4s',
    }}>
      <span style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 300, letterSpacing: '0.15em', color: '#f0ece4' }}>traces</span>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <BtnGhostLink href="/sign-in" style={{ padding: '8px 20px', fontSize: 12 }}>
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
      background:     'rgba(255,255,255,0.032)',
      border:         '1px solid rgba(255,255,255,0.07)',
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
      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13.5, color: '#f0ece4', lineHeight: 1.55, marginBottom: 6 }}>{text}</p>
      <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#6b6866', letterSpacing: '0.1em' }}>{author}</span>
    </div>
  );
}

// ── LandingHero.tsx ───────────────────────────────────────────────
export function LandingHero({ ctas }: { ctas?: React.ReactNode }) {
  return (
    <section className="landing-hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '80px 24px 60px', overflow: 'hidden' }}>
      <AmbientBg />
      <FloatingCard text="You seem quieter when things aren't okay." author="— Ghost" delay={0}   className="landing-floating-card" style={{ top: '22%', left: '5%' }} />
      <FloatingCard text="This song made me think of you."            author="— Echo"  delay={1.2} style={{ top: '15%', right: '8%' }} />
      <FloatingCard text="You act strong for everyone else."           author="— Shadow" delay={0.6} style={{ bottom: '28%', right: '6%' }} />

      <div style={{ textAlign: 'center', maxWidth: 680, position: 'relative', zIndex: 2, animation: 'fadeUp 1s ease both' }}>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.22em', color: '#6b6866', textTransform: 'uppercase', marginBottom: 28 }}>Anonymous traces ·</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: 300, lineHeight: 1.15, color: '#f0ece4', marginBottom: 22 }}>
          Some things are<br /><em style={{ fontStyle: 'italic', color: '#c8bfaa' }}>easier left unsaid.</em>
        </h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14.5, color: '#7a7672', lineHeight: 1.75, fontWeight: 300, marginBottom: 36 }}>
          Anonymous thoughts, memories, and moments—<br />left for the people who deserve to hear them.
        </p>
        {ctas}
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
      <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.22em', color: '#6b6866', textTransform: 'uppercase', textAlign: 'center', marginBottom: 48 }}>How it works</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {STEPS.map(s => (
          <div key={s.n}
            style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, transition: 'all 0.3s', cursor: 'default' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
          >
            <span style={{ fontFamily: 'var(--serif)', fontSize: 38, color: '#3a3836', display: 'block', marginBottom: 16 }}>{s.n}</span>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 18, color: '#f0ece4', marginBottom: 8, fontWeight: 400 }}>{s.title}</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#7a7672', lineHeight: 1.65 }}>{s.desc}</p>
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
      <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.22em', color: '#6b6866', textTransform: 'uppercase', textAlign: 'center', marginBottom: 48 }}>What you can leave</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
        {FEATURES.map(f => (
          <div key={f.title}
            style={{ padding: '24px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 18, transition: 'all 0.3s', cursor: 'default' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.055)'; }}
          >
            <span style={{ fontSize: 18, display: 'block', marginBottom: 14, color: '#6b6866' }}>{f.icon}</span>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 16, color: '#f0ece4', marginBottom: 6, fontWeight: 400 }}>{f.title}</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color: '#6b6866', lineHeight: 1.65 }}>{f.desc}</p>
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
