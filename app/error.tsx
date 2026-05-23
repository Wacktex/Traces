'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0B0C',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--sans)',
          fontSize: 10,
          letterSpacing: '0.2em',
          color: '#6b6866',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        Something went wrong
      </p>
      <h1
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 28,
          fontWeight: 300,
          color: '#f0ece4',
          marginBottom: 12,
        }}
      >
        We hit a snag.
      </h1>
      <p
        style={{
          fontFamily: 'var(--sans)',
          fontSize: 13,
          color: '#7a7672',
          maxWidth: 420,
          lineHeight: 1.6,
          marginBottom: 28,
        }}
      >
        {error.message || 'An unexpected error occurred. Try again, or return home.'}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="button"
          onClick={reset}
          style={{
            background: '#f0ece4',
            color: '#0B0B0C',
            border: 'none',
            borderRadius: 100,
            padding: '12px 28px',
            cursor: 'pointer',
            fontFamily: 'var(--sans)',
            fontSize: 13,
          }}
        >
          Try again
        </button>
        <a
          href="/"
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
          Go home
        </a>
      </div>
    </div>
  );
}
