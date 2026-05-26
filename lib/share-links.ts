import { getAppUrl } from '@/lib/app-url';
import { getProfileUrl } from '@/lib/profile-url';

export function profileShareMessage(username: string): string {
  const host = getAppUrl().replace(/^https?:\/\//, '');
  return `Leave me an anonymous trace — thoughtful, private, no account needed.\n${host}/${username}`;
}

export function profileShareTitle(username: string): string {
  return `${username} on Traces`;
}

export type ShareChannel = 'copy' | 'native' | 'whatsapp' | 'telegram' | 'instagram';

export function shareChannelUrl(
  channel: Exclude<ShareChannel, 'copy' | 'native' | 'instagram'>,
  profileUrl: string,
  message: string
): string {
  const encodedUrl = encodeURIComponent(profileUrl);
  const encodedText = encodeURIComponent(message);

  switch (channel) {
    case 'whatsapp':
      return `https://wa.me/?text=${encodedText}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    default:
      return profileUrl;
  }
}

/** Instagram has no reliable web URL scheme for link sharing — open app or copy. */
export function instagramShareHint(): string {
  return 'Copy your link, then paste it in your Instagram bio or Story link sticker.';
}
