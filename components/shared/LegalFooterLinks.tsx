import Link from 'next/link';
import type { CSSProperties } from 'react';

const linkStyle: CSSProperties = {
  fontFamily: 'var(--sans)',
  fontSize: 11.5,
  color: '#6b6866',
  textDecoration: 'none',
  letterSpacing: '0.08em',
};

export function LegalFooterLinks({ centered = true }: { centered?: boolean }) {
  const links = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ];

  return (
    <nav
      aria-label="Legal"
      style={{
        display: 'flex',
        gap: 20,
        justifyContent: centered ? 'center' : 'flex-start',
        flexWrap: 'wrap',
      }}
    >
      {links.map(l => (
        <Link key={l.href} href={l.href} style={linkStyle}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
