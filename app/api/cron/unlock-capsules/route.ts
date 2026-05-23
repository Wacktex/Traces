// app/api/cron/unlock-capsules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runUnlockCapsules }         from '@/jobs/unlock-capsules';

export const maxDuration = 60;
export const dynamic     = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  const authHeader  = req.headers.get('authorization');
  const manualToken = req.headers.get('x-cron-secret');

  const valid =
    authHeader  === `Bearer ${process.env.CRON_SECRET}` ||
    manualToken === process.env.CRON_SECRET;

  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runUnlockCapsules();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[cron/unlock-capsules]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
