import { isReservedPath } from '@/lib/reserved-paths';
import { isReservedUsername } from '@/lib/reserved-usernames';

/** Parse username from raw input or a Traces profile URL. */
export function parseProfileUsername(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      const segment = url.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
      if (!segment) return null;
      return normalizeUsername(segment);
    }
  } catch {
    return null;
  }

  if (trimmed.includes('/')) {
    const segment = trimmed.replace(/^\/+|\/+$/g, '').split('/').pop();
    if (!segment) return null;
    return normalizeUsername(segment);
  }

  return normalizeUsername(trimmed);
}

function normalizeUsername(value: string): string | null {
  const username = value.toLowerCase().replace(/^@/, '');
  if (!/^[a-z0-9_]{2,20}$/.test(username)) return null;
  if (isReservedPath(username) || isReservedUsername(username)) return null;
  return username;
}
