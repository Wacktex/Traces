import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { AnalyticsProvider } from '@/components/shared/AnalyticsProvider';
import { SiteFooter } from '@/components/shared/SiteFooter';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Traces', template: '%s — Traces' },
  description: 'Anonymous thoughts, memories, and moments for the people who deserve to hear them.',
  openGraph: {
    title: 'Traces',
    description: 'Leave a trace, not just a message.',
    images: ['/og.png'],
    siteName: 'Traces',
  },
  twitter: { card: 'summary_large_image' },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://traces.app'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <AnalyticsProvider />
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>{children}</div>
            <SiteFooter />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
