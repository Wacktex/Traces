import Link from 'next/link';
import { Grain } from '@/components/shared/Grain';

const heading: React.CSSProperties = {
  fontFamily: 'var(--serif)',
  fontSize: 22,
  fontWeight: 400,
  color: '#f0ece4',
  marginTop: 32,
  marginBottom: 10,
};

const body: React.CSSProperties = {
  fontFamily: 'var(--sans)',
  fontSize: 14,
  color: '#7a7672',
  lineHeight: 1.75,
  marginBottom: 12,
};

const list: React.CSSProperties = {
  ...body,
  paddingLeft: 20,
  marginBottom: 16,
};

interface Props {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, updated, children }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0C', position: 'relative' }}>
      <Grain />
      <article
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '80px 24px 48px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 12,
            color: '#6b6866',
            textDecoration: 'none',
            letterSpacing: '0.08em',
          }}
        >
          ← home
        </Link>
        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 36,
            fontWeight: 300,
            color: '#f0ece4',
            marginTop: 24,
            marginBottom: 8,
          }}
        >
          {title}
        </h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#4a4846', marginBottom: 32 }}>
          Last updated: {updated}
        </p>
        <div>{children}</div>
      </article>
    </div>
  );
}

export const legalHeading = heading;
export const legalBody = body;
export const legalList = list;
