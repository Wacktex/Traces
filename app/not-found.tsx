import Link from 'next/link';
import { Grain } from '@/components/shared';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0B0C',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <Grain />
      <p
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 32,
          fontWeight: 300,
          color: '#f0ece4',
          marginBottom: 12,
        }}
      >
        This profile doesn&apos;t exist yet.
      </p>
      <p
        style={{
          fontFamily: 'var(--sans)',
          fontSize: 13,
          color: '#7a7672',
          maxWidth: 400,
          lineHeight: 1.65,
          marginBottom: 28,
        }}
      >
        The link may be wrong, or this person hasn&apos;t set up Traces yet.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            background: '#f0ece4',
            color: '#0B0B0C',
            borderRadius: 100,
            padding: '12px 28px',
            fontFamily: 'var(--sans)',
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          Go home
        </Link>
        <Link
          href="/sign-up"
          style={{
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 100,
            padding: '12px 28px',
            color: '#f0ece4',
            fontFamily: 'var(--sans)',
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          Create your profile
        </Link>
      </div>
    </div>
  );
}
