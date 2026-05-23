'use client';

import Link from 'next/link';

export function BackBtn({ href, onClick }: { href?: string; onClick?: () => void }) {
  const s: React.CSSProperties = {
    position: 'fixed',
    top: 24,
    left: 24,
    zIndex: 50,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b6866',
    fontFamily: 'var(--sans)',
    fontSize: 12,
    letterSpacing: '0.08em',
    transition: 'color 0.2s',
    textDecoration: 'none',
  };

  if (href) {
    return (
      <Link
        href={href}
        style={s}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#f0ece4')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6b6866')}
      >
        ← back
      </Link>
    );
  }

  return (
    <button
      style={s}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#f0ece4')}
      onMouseLeave={(e) => (e.currentTarget.style.color = '#6b6866')}
    >
      ← back
    </button>
  );
}
