import { Grain } from '@/components/shared';
import {
  LandingNav,
  LandingHero,
  HowItWorks,
  FeatureGrid,
  LandingFooter,
} from '@/components/landing';
import { WhatIsTraces, DemoWalkthrough, HowTracesWorksVisual } from '@/components/landing/ProductSections';
import { LandingHeroCTAs } from '@/components/landing/LandingHeroCTAs';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Grain />
      <LandingNav />
      <LandingHero ctas={<LandingHeroCTAs />} />
      <WhatIsTraces />
      <DemoWalkthrough />
      <HowTracesWorksVisual />
      <HowItWorks />
      <FeatureGrid />
      <LandingFooter />
    </main>
  );
}
