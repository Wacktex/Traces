import type { EmotionalTone } from '@/types';

export const EMOTIONAL_TONES: { id: EmotionalTone; label: string; hint: string }[] = [
  { id: 'warm',    label: 'Warm',    hint: 'Affectionate and close.' },
  { id: 'sincere', label: 'Sincere', hint: 'Direct and honest.' },
  { id: 'playful', label: 'Playful', hint: 'Light, teasing energy.' },
  { id: 'gentle',  label: 'Gentle',  hint: 'Soft and careful.' },
  { id: 'bold',    label: 'Bold',    hint: 'Confident and clear.' },
  { id: 'neutral', label: 'Neutral', hint: 'Let the words speak.' },
];
