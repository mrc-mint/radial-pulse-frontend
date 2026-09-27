import {
  nativeFontFamily,
  tokens,
  type SeverityTone,
  type StatusTone,
  type TextStyle,
} from '@radial-pulse/design-tokens';
import type { TextStyle as RNTextStyle } from 'react-native';

/**
 * Native reads the token object directly (no CSS). Text uses Inter through
 * `nativeFontFamily`; the app loads those faces before rendering (until they
 * load, or if they fail, the platform font is used).
 */
export const t = tokens;

type FontWeight = keyof typeof nativeFontFamily;

/** Inter at a token weight: the face for that weight plus the matching weight. */
export function font(value: FontWeight): Pick<RNTextStyle, 'fontFamily' | 'fontWeight'> {
  return {
    fontFamily: nativeFontFamily[value],
    fontWeight: String(value) as RNTextStyle['fontWeight'],
  };
}

export function text(style: TextStyle): RNTextStyle {
  const s = tokens.text[style];
  return {
    fontSize: s.size,
    lineHeight: s.lineHeight,
    ...font(s.weight),
    letterSpacing: s.tracking,
  };
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
