// app/api/username-check/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isReservedPath } from '@/lib/reserved-paths';
import { isReservedUsername } from '@/lib/reserved-usernames';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username') ?? '';

  if (!/^[a-z0-9_]{2,20}$/.test(username)) {
    return NextResponse.json({ available: false, reason: 'invalid_format' });
  }

  if (isReservedPath(username) || isReservedUsername(username)) {
    return NextResponse.json({ available: false, reason: 'reserved' });
  }

  const db = createSupabaseAdminClient();
  const { data } = await db
    .from('users')
    .select('id, clerk_id')
    .eq('username', username)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ available: true });
  }

  const { userId: clerkId } = auth();
  if (clerkId && data.clerk_id === clerkId) {
    return NextResponse.json({ available: true });
  }

  return NextResponse.json({ available: false, reason: 'taken' });
}
