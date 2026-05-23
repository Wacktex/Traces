// app/onboarding/page.tsx
import { auth }            from '@clerk/nextjs/server';
import { redirect }        from 'next/navigation';
import { getUserByClerkId, syncClerkUser } from '@/services/users';
import { OnboardingForm }  from '@/components/onboarding/OnboardingForm';
import { Grain }           from '@/components/shared';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in?redirect_url=/onboarding');

  let user = await getUserByClerkId(clerkId);
  if (!user) {
    await syncClerkUser({ clerkId });
    user = await getUserByClerkId(clerkId);
  }
  if (user?.is_onboarded) redirect('/dashboard');

  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0C', position: 'relative' }}>
      <Grain />
      <OnboardingForm defaultUsername={user?.username ?? ''} />
    </div>
  );
}
