/** Lightweight content policy checks (no external API). */

const PROFANITY = [
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'cunt',
  'nigger',
  'nigga',
  'faggot',
  'retard',
];

/** Blocks raw URLs and common link patterns in trace body. */
const LINK_PATTERN =
  /(?:https?:\/\/|www\.)[^\s]+|\b[a-z0-9-]+\.(?:com|net|org|io|co|me|app|xyz|link|tv)\b/i;

export function containsBlockedLink(text: string): boolean {
  return LINK_PATTERN.test(text);
}

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return PROFANITY.some((word) => {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return re.test(lower);
  });
}
