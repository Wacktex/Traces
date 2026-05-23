import { NextRequest, NextResponse } from 'next/server';
import { parseProfileUsername } from '@/lib/parse-profile-input';
import { userExistsByUsername } from '@/services/users';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('q') ?? req.nextUrl.searchParams.get('username') ?? '';
  const username = parseProfileUsername(raw);

  if (!username) {
    return NextResponse.json({ found: false, reason: 'invalid' });
  }

  const found = await userExistsByUsername(username);
  if (!found) {
    return NextResponse.json({ found: false, reason: 'not_found', username });
  }

  return NextResponse.json({ found: true, username });
}
