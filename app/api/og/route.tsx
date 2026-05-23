// app/api/og/route.tsx
import { ImageResponse } from 'next/og';
import { getPublicProfile } from '@/services/users';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username') ?? 'traces';
  const profile  = await getPublicProfile(username).catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0B0B0C',
          fontFamily: 'serif',
        }}
      >
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(44,74,62,0.22) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,31,36,0.18) 0%, transparent 70%)', filter: 'blur(50px)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 20, letterSpacing: '0.22em', color: '#6b6866', textTransform: 'uppercase', marginBottom: 20 }}>traces</p>
          <p style={{ fontSize: 58, fontWeight: 300, color: '#f0ece4', marginBottom: 12, textAlign: 'center', maxWidth: 900 }}>
            Leave {username} a trace.
          </p>
          {profile?.bio && (
            <p style={{ fontSize: 24, color: '#7a7672', fontStyle: 'italic', marginTop: 8, maxWidth: 700, textAlign: 'center' }}>
              {profile.bio}
            </p>
          )}
          <div style={{ marginTop: 36, padding: '12px 28px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100 }}>
            <p style={{ fontSize: 18, color: '#c8bfaa', letterSpacing: '0.08em' }}>traces.app/{username}</p>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
