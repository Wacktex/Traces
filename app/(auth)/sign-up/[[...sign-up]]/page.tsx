import { SignUp } from '@clerk/nextjs';
import { Grain } from '@/components/shared';

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0B0C',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <Grain />
      <p
        style={{
          fontFamily: 'var(--serif)',
          fontSize: '1.5rem',
          fontWeight: 300,
          letterSpacing: '0.15em',
          color: '#f0ece4',
          marginBottom: '2rem',
        }}
      >
        traces
      </p>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/onboarding"
        appearance={{
          variables: {
            colorBackground: '#141416',
            colorText: '#f0ece4',
            colorTextSecondary: '#7a7672',
            colorPrimary: '#f0ece4',
            colorInputBackground: 'rgba(255,255,255,0.04)',
            colorInputText: '#f0ece4',
            colorDanger: '#a05050',
            borderRadius: '16px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          elements: {
            card: { boxShadow: 'none', border: '1px solid rgba(255,255,255,0.07)', background: '#141416' },
            headerTitle: { fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: '1.5rem' },
            headerSubtitle: { color: '#7a7672' },
            formButtonPrimary: { background: '#f0ece4', color: '#0B0B0C', fontWeight: 500 },
            footerActionLink: { color: '#c8bfaa' },
          },
        }}
      />
    </div>
  );
}
