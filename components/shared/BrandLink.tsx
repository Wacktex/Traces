import Link from 'next/link';

type BrandLinkProps = {
  className?: string;
  style?: React.CSSProperties;
};

/** Clickable Traces wordmark — always routes to `/` (landing or dashboard by auth). */
export function BrandLink({ className = '', style }: BrandLinkProps) {
  return (
    <Link
      href="/"
      className={`nav-brand ${className}`.trim()}
      aria-label="Traces home"
      style={{
        fontFamily: 'var(--serif)',
        fontWeight: 300,
        letterSpacing: '0.15em',
        color: 'var(--text)',
        textDecoration: 'none',
        transition: 'color 0.2s, opacity 0.2s',
        ...style,
      }}
    >
      traces
    </Link>
  );
}
