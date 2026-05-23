// app/dashboard/page.tsx
import type { Metadata }        from 'next';
import { auth }                 from '@clerk/nextjs/server';
import { redirect }             from 'next/navigation';
import { getUserByClerkId, syncClerkUser } from '@/services/users';
import { getDashboardSummary }  from '@/services/traces';
import { getNotifications }     from '@/services/notifications';
import { DashboardClient }      from '@/components/dashboard/DashboardClient';
import { Grain }                from '@/components/shared';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const { userId: clerkId } = auth();
  if (!clerkId) redirect('/sign-in');

  let user = await getUserByClerkId(clerkId);
  if (!user) {
    await syncClerkUser({ clerkId });
    user = await getUserByClerkId(clerkId);
  }
  if (!user) redirect('/onboarding');
  if (!user.is_onboarded)  redirect('/onboarding');

  const [summary, notifications] = await Promise.all([
    getDashboardSummary(user.id),
    getNotifications(user.id),
  ]);

  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0C', position: 'relative' }}>
      <Grain />
      <DashboardClient
        user={user}
        summary={summary}
        initialNotifications={notifications}
      />
    </div>
  );
}
