// app/[username]/page.tsx — Public profile page (ISR)
import type { Metadata }     from 'next';
import { notFound }          from 'next/navigation';
import { isReservedPath }    from '@/lib/reserved-paths';
import { getProfileUrl }     from '@/lib/profile-url';
import { getPublicProfile }  from '@/services/users';
import { ProfilePageClient } from '@/components/profile';
import { Grain }             from '@/components/shared';

export const revalidate = 60;

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getPublicProfile(params.username);
  if (!profile) return { title: 'Not Found' };
  const url = getProfileUrl(profile.username);
  const description = profile.bio ?? `Leave ${profile.username} an anonymous trace.`;
  return {
    title: `${profile.username} — Traces`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `Leave ${profile.username} a trace`,
      description,
      url,
      type: 'profile',
      images: [`/api/og?username=${encodeURIComponent(profile.username)}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Leave ${profile.username} a trace`,
      description,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  if (isReservedPath(params.username)) notFound();

  const profile = await getPublicProfile(params.username);
  if (!profile) notFound();
  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0C', position: 'relative' }}>
      <Grain />
      <ProfilePageClient profile={profile} />
    </div>
  );
}
