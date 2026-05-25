import { auth } from '@clerk/nextjs/server';
import { BtnGhostLink } from '@/components/shared';
import { getUserByClerkId } from '@/services/users';
import { LeaveTraceTrigger } from '@/components/landing/LeaveTraceModal';

export async function LandingHeroCTAs() {
  const { userId } = auth();

  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
      <LeaveTraceTrigger className="btn-touch" />
      {!userId ? (
        <BtnGhostLink href="/sign-up" className="btn-touch">
          Create your profile
        </BtnGhostLink>
      ) : (
        <AuthenticatedSecondaryCta clerkId={userId} />
      )}
    </div>
  );
}

async function AuthenticatedSecondaryCta({ clerkId }: { clerkId: string }) {
  const user = await getUserByClerkId(clerkId);

  if (!user || !user.is_onboarded) {
    return (
      <BtnGhostLink href="/onboarding" className="btn-touch">
        Finish your profile
      </BtnGhostLink>
    );
  }

  return (
    <BtnGhostLink href="/dashboard" className="btn-touch">
      Your dashboard
    </BtnGhostLink>
  );
}
