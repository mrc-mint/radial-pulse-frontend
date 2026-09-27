import {
  tokens,
  type SeverityTone,
  type StatusTone,
  type TextStyle,
} from '@radial-pulse/design-tokens';
import type { TextStyle as RNTextStyle } from 'react-native';

/**
 * Native reads the token object directly (no CSS). The platform system font
 * is used, so `font.family` is intentionally not applied.
 */
export const t = tokens;

export function text(style: TextStyle): RNTextStyle {
  const s = tokens.text[style];
  return {
    fontSize: s.size,
    lineHeight: s.lineHeight,
    fontWeight: String(s.weight) as RNTextStyle['fontWeight'],
    letterSpacing: s.tracking,
  };
}

export function weight(value: number): RNTextStyle['fontWeight'] {
  return String(value) as RNTextStyle['fontWeight'];
}

export const statusColors = (tone: StatusTone) => tokens.color.status[tone];
export const severityColors = (tone: SeverityTone) => tokens.color.severity[tone];

/** Small text glyphs for the primitives' own affordances (no SVG dependency). */
export const glyph = {
  chevronDown: '⌄',
  chevronRight: '›',
  chevronLeft: '‹',
  close: '✕',
  check: '✓',
  up: '↑',
  down: '↓',
  flat: '–',
} as const;
