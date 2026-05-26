// app/traces/[id]/page.tsx
import type { Metadata }     from 'next';
import { auth }              from '@clerk/nextjs/server';
import { redirect, notFound} from 'next/navigation';
import { getUserByClerkId }   from '@/services/users';
import { getTrace, hasViewedTrace } from '@/services/traces';
import { TraceReaderClient } from '@/components/traces/TraceReaderClient';
import { Grain }             from '@/components/shared';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'A trace' };

interface Props {
  params: { id: string };
}

export default async function TracePage({ params }: Props) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await getUserByClerkId(clerkId);
  if (!user) redirect('/sign-in');

  const trace = await getTrace(params.id, user.id, { recordView: false });
  if (!trace) notFound();

  if (trace.status !== 'delivered') notFound();

  const isViewed = await hasViewedTrace(params.id, user.id);

  return (
    <div className="trace-reader-shell" style={{ minHeight: '100vh', background: '#0B0B0C', position: 'relative' }}>
      <Grain />
      <TraceReaderClient trace={trace} username={user.username} initiallyViewed={isViewed} />
    </div>
  );
}
