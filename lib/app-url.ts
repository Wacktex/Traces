/** Canonical app origin for share links and story CTAs. */
export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'https://traces.app').replace(/\/+$/, '');
}

export function getAppHostLabel(): string {
  return getAppUrl().replace(/^https?:\/\//, '');
}
