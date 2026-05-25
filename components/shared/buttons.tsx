'use client';

import Link from 'next/link';
import { type ButtonHTMLAttributes, type CSSProperties } from 'react';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

interface BtnLinkProps {
  href: string;
  children: React.ReactNode;
  style?: CSSProperties;
  className?: string;
}

const primaryStyles: CSSProperties = {
  background: 'var(--text)',
  color: 'var(--bg)',
  border: 'none',
  borderRadius: 100,
  padding: '14px 28px',
  minHeight: 'var(--touch-min)',
  cursor: 'pointer',
  fontFamily: 'var(--sans)',
  fontSize: 'var(--text-md)',
  fontWeight: 500,
  letterSpacing: '0.04em',
  transition: 'opacity 0.2s, transform 0.2s, box-shadow 0.2s',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  boxSizing: 'border-box',
};

const ghostStyles: CSSProperties = {
  background: 'var(--glass)',
  border: '1px solid var(--glass-border)',
  borderRadius: 100,
  padding: '14px 28px',
  minHeight: 'var(--touch-min)',
  cursor: 'pointer',
  fontFamily: 'var(--sans)',
  fontSize: 'var(--text-md)',
  color: 'var(--text)',
  letterSpacing: '0.04em',
  transition: 'border-color 0.2s, transform 0.2s, background 0.2s',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  boxSizing: 'border-box',
};

export function BtnPrimary({ children, disabled, style, className, ...props }: BtnProps) {
  return (
    <button
      className={className}
      disabled={disabled}
      style={{
        ...primaryStyles,
        background: disabled ? 'rgba(240,236,228,0.22)' : primaryStyles.background,
        color: disabled ? 'rgba(11,11,12,0.4)' : primaryStyles.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLElement).style.opacity = '0.84';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = '1';
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnGhost({ children, style, className, ...props }: BtnProps) {
  return (
    <button
      className={className}
      style={{ ...ghostStyles, ...style }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-olive-border)';
        (e.currentTarget as HTMLElement).style.background = 'var(--accent-olive-glass)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)';
        (e.currentTarget as HTMLElement).style.background = ghostStyles.background as string;
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnLink({ href, children, style, className }: BtnLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      style={{ ...primaryStyles, ...style }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = '0.84';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = '1';
      }}
    >
      {children}
    </Link>
  );
}

export function BtnGhostLink({ href, children, style, className }: BtnLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      style={{ ...ghostStyles, ...style }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-olive-border)';
        (e.currentTarget as HTMLElement).style.background = 'var(--accent-olive-glass)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)';
        (e.currentTarget as HTMLElement).style.background = ghostStyles.background as string;
      }}
    >
      {children}
    </Link>
  );
}
