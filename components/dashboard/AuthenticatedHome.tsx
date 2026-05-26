import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId, syncClerkUser } from '@/services/users';
import { getDashboardSummary } from '@/services/traces';
import { getNotifications } from '@/services/notifications';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { Grain } from '@/components/shared';

/** Server-fetched dashboard experience for signed-in, onboarded users at `/`. */
export async function AuthenticatedHome() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  let user = await getUserByClerkId(clerkId);
  if (!user) {
    await syncClerkUser({ clerkId });
    user = await getUserByClerkId(clerkId);
  }
  if (!user) redirect('/onboarding');
  if (!user.is_onboarded) redirect('/onboarding');

  const [summary, notifications] = await Promise.all([
    getDashboardSummary(user.id),
    getNotifications(user.id),
  ]);

  return (
    <div className="dashboard-shell" style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <Grain />
      <DashboardClient user={user} summary={summary} initialNotifications={notifications} />
    </div>
  );
}
