'use client';

import Link from 'next/link';
import { type ButtonHTMLAttributes, type CSSProperties } from 'react';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface BtnLinkProps {
  href: string;
  children: React.ReactNode;
  style?: CSSProperties;
  className?: string;
}

const primaryStyles: CSSProperties = {
  background: '#f0ece4',
  color: '#0B0B0C',
  border: 'none',
  borderRadius: 100,
  padding: '12px 28px',
  cursor: 'pointer',
  fontFamily: 'var(--sans)',
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: '0.04em',
  transition: 'opacity 0.2s, transform 0.2s',
  textDecoration: 'none',
  display: 'inline-block',
  textAlign: 'center',
  boxSizing: 'border-box',
};

const ghostStyles: CSSProperties = {
  background: 'none',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 100,
  padding: '12px 28px',
  cursor: 'pointer',
  fontFamily: 'var(--sans)',
  fontSize: 13,
  color: '#f0ece4',
  letterSpacing: '0.04em',
  transition: 'border-color 0.2s, transform 0.2s',
  textDecoration: 'none',
  display: 'inline-block',
  textAlign: 'center',
  boxSizing: 'border-box',
};

export function BtnPrimary({ children, disabled, style, ...props }: BtnProps) {
  return (
    <button
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

export function BtnGhost({ children, style, ...props }: BtnProps) {
  return (
    <button
      style={{ ...ghostStyles, ...style }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.22)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnLink({ href, children, style }: BtnLinkProps) {
  return (
    <Link
      href={href}
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

export function BtnGhostLink({ href, children, style }: BtnLinkProps) {
  return (
    <Link
      href={href}
      style={{ ...ghostStyles, ...style }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.22)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
      }}
    >
      {children}
    </Link>
  );
}
