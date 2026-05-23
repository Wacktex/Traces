import type { NotificationType } from '@/types';

/** Human-readable notification copy (safe for client components). */
export function notificationCopy(type: NotificationType): {
  summary: string;
  body: string;
} {
  switch (type) {
    case 'trace_received':
      return {
        summary: 'Something new is waiting.',
        body: 'Open it when you are ready.',
      };
    case 'capsule_unlocked':
      return {
        summary: 'A sealed trace is ready.',
        body: 'Something timed or held back has arrived.',
      };
    case 'reveal_request':
      return {
        summary: 'Someone wants to be known.',
        body: 'The person who left a trace is asking to reveal themselves.',
      };
    case 'song_received':
      return {
        summary: 'Someone left a song.',
        body: 'A song trace arrived.',
      };
    case 'system':
      return {
        summary: 'A note from Traces.',
        body: '',
      };
  }
}
