import type { TraceCategory } from '@/types';

export interface CategoryGroup {
  id: string;
  label: string;
  description: string;
  categories: TraceCategory[];
}

/** Phase 2 category groupings for the profile picker. */
export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'first_impressions',
    label: 'First impressions',
    description: 'What you noticed, assumed, or would never say out loud.',
    categories: ['first_impression', 'one_word', 'assumption', 'something_id_never_say'],
  },
  {
    id: 'moments',
    label: 'Moments',
    description: 'Memories, late-night thoughts, and things held back.',
    categories: ['memory', 'midnight_thought', 'confession'],
  },
  {
    id: 'affirmation',
    label: 'Affirmation',
    description: 'Kindness and music that fits them.',
    categories: ['compliment', 'song_reminder'],
  },
  {
    id: 'open',
    label: 'Open',
    description: 'No template — say it your way.',
    categories: ['freeform'],
  },
];
