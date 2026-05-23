// app/settings/page.tsx
import type { Metadata }       from 'next';
import { auth }                from '@clerk/nextjs/server';
import { redirect }            from 'next/navigation';
import { getUserByClerkId }     from '@/services/users';
import { SettingsClient }      from '@/components/settings/SettingsClient';
import { Grain }               from '@/components/shared/Grain';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const { userId: clerkId } = auth();
  if (!clerkId) redirect('/sign-in');

  const user = await getUserByClerkId(clerkId);
  if (!user) redirect('/onboarding');

  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0C', position: 'relative' }}>
      <Grain />
      <SettingsClient user={user} />
    </div>
  );
}
