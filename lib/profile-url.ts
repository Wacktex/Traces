/** Canonical public profile URL for copy/share/QR. */
export function getProfileUrl(username: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://traces.app').replace(/\/+$/, '');
  return `${base}/${username}`;
}
