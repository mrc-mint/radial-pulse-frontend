import type { AvatarTone } from '@radial-pulse/design-tokens';
import { NOT_AVAILABLE_LABEL } from '@radial-pulse/utils';

/**
 * Presentation helpers shared by the web and native implementations.
 * Formatting only: nothing here derives a domain value.
 */

/** "Dr. Rahul Mehta" → "RM"; "Smile Dental Care" → "SC". */
export function getInitials(name: string): string {
  const words = name
    .replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const second = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : (words[0]?.[1] ?? '');
  return (first + second).toUpperCase() || '?';
}

const AVATAR_TONES: readonly AvatarTone[] = ['blue', 'violet', 'teal', 'amber', 'rose', 'navy'];

/** Stable colour per name, so a person keeps the same avatar everywhere. */
export function avatarToneFor(name: string): AvatarTone {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length] ?? 'blue';
}

/** Missing metric values read "Not Available", never 0. */
export function formatMetricValue(
  value: string | number | null | undefined,
  locale?: string,
): string {
  if (value === null || value === undefined || value === '') return NOT_AVAILABLE_LABEL;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toLocaleString(locale) : NOT_AVAILABLE_LABEL;
  }
  return value;
}

/** ISO timestamp → "12 Sep(t) 2024, 10:30" (en-GB). Returns null for invalid input. */
export function formatDateTime(
  iso: string,
  options: { locale?: string; timeZone?: string } = {},
): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(options.locale ?? 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: options.timeZone,
  }).format(date);
}

/** "https://www.smiledentalcare.in/about" → "smiledentalcare.in". */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
