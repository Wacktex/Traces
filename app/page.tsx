import { Grain } from '@/components/shared';
import {
  LandingNav,
  LandingHero,
  HowItWorks,
  FeatureGrid,
  LandingFooter,
} from '@/components/landing';
import { LandingHeroCTAs } from '@/components/landing/LandingHeroCTAs';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main style={{ background: '#0B0B0C', minHeight: '100vh' }}>
      <Grain />
      <LandingNav />
      <LandingHero ctas={<LandingHeroCTAs />} />
      <HowItWorks />
      <FeatureGrid />
      <LandingFooter />
    </main>
  );
}
