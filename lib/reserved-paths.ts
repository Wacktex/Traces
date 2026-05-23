/** App routes that must not be treated as public profile usernames. */
export const RESERVED_PATHS = new Set([
  'sign-in',
  'sign-up',
  'dashboard',
  'settings',
  'onboarding',
  'traces',
  'api',
  'auth',
  'profile',
  'privacy',
  'terms',
  '_next',
]);

export function isReservedPath(segment: string): boolean {
  return RESERVED_PATHS.has(segment.toLowerCase());
}
