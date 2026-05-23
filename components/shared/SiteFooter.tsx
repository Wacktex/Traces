import { LegalFooterLinks } from '@/components/shared/LegalFooterLinks';

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B0B0C',
      }}
    >
      <LegalFooterLinks />
      <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#2a2826' }}>
        © {new Date().getFullYear()} Traces
      </span>
    </footer>
  );
}
