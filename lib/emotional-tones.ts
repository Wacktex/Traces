import type { EmotionalTone } from '@/types';

export const EMOTIONAL_TONE_IDS: readonly EmotionalTone[] = [
  'warm',
  'sincere',
  'playful',
  'gentle',
  'bold',
  'neutral',
] as const;

export const EMOTIONAL_TONES: { id: EmotionalTone; label: string; hint: string }[] = [
  { id: 'warm',    label: 'Warm',    hint: 'Affectionate and close.' },
  { id: 'sincere', label: 'Sincere', hint: 'Direct and honest.' },
  { id: 'playful', label: 'Playful', hint: 'Light, teasing energy.' },
  { id: 'gentle',  label: 'Gentle',  hint: 'Soft and careful.' },
  { id: 'bold',    label: 'Bold',    hint: 'Confident and clear.' },
  { id: 'neutral', label: 'Neutral', hint: 'Let the words speak.' },
];

export function isEmotionalTone(value: unknown): value is EmotionalTone {
  return typeof value === 'string' && (EMOTIONAL_TONE_IDS as readonly string[]).includes(value);
}

/** Validates tone; returns null for neutral / missing / invalid (stored as NULL in DB). */
export function normalizeEmotionalTone(value: unknown): EmotionalTone | null {
  if (!isEmotionalTone(value) || value === 'neutral') return null;
  return value;
}

export function getEmotionalToneLabel(tone: EmotionalTone): string {
  return EMOTIONAL_TONES.find(t => t.id === tone)?.label ?? tone;
}
