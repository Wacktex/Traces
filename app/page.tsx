import { auth } from '@clerk/nextjs/server';
import { Grain } from '@/components/shared';
import {
  LandingNav,
  LandingHero,
  HowItWorks,
  FeatureGrid,
  LandingFooter,
} from '@/components/landing';
import { WhatIsTraces, DemoWalkthrough, HowTracesWorksVisual } from '@/components/landing/ProductSections';
import { InteractiveTraceDemo } from '@/components/landing/InteractiveTraceDemo';
import { LandingHeroCTAs } from '@/components/landing/LandingHeroCTAs';
import { AuthenticatedHome } from '@/components/dashboard/AuthenticatedHome';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { userId: clerkId } = await auth();

  if (clerkId) {
    return <AuthenticatedHome />;
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Grain />
      <LandingNav />
      <LandingHero ctas={<LandingHeroCTAs />} />
      <InteractiveTraceDemo />
      <WhatIsTraces />
      <DemoWalkthrough />
      <HowTracesWorksVisual />
      <HowItWorks />
      <FeatureGrid />
      <LandingFooter />
    </main>
  );
}
