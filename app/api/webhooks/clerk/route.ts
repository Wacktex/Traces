// app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse }     from 'next/server';
import { Webhook }                       from 'svix';
import { syncClerkUser }                 from '@/services/users';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body    = await req.text();
  const svixId  = req.headers.get('svix-id')        ?? '';
  const svixTs  = req.headers.get('svix-timestamp') ?? '';
  const svixSig = req.headers.get('svix-signature') ?? '';

  let event: any;
  try {
    event = new Webhook(WEBHOOK_SECRET).verify(body, {
      'svix-id':        svixId,
      'svix-timestamp': svixTs,
      'svix-signature': svixSig,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { type, data } = event;

  switch (type) {
    case 'user.created':
      await syncClerkUser({
        clerkId:  data.id,
        email:    data.email_addresses?.[0]?.email_address,
        imageUrl: data.image_url,
      });
      break;

    case 'user.updated':
      await syncClerkUser({ clerkId: data.id, imageUrl: data.image_url });
      break;

    case 'user.deleted': {
      const db = createSupabaseAdminClient();
      // cast to any to avoid strict table typings when updating deleted user fields
      await db.from('users').update({
        bio: null,
        profile_image: null,
        username: `deleted_${(data.id as string).slice(-8)}`,
      }).eq('clerk_id', data.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
