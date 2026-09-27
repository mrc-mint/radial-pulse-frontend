/**
 * Radial Pulse design tokens — the single source of truth (architecture §2).
 *
 *   - native reads this object directly
 *   - web reads CSS variables generated from it (`pnpm --filter
 *     @radial-pulse/design-tokens generate`), which must never be hand-edited
 *
 * This file must stay dependency-free: the generator runs it with Node's
 * built-in type stripping.
 *
 * Colour roles:
 *   palette  – raw scales. Components never use these directly.
 *   color    – semantic roles (surface, text, border, action, status, severity).
 *
 * `status` and `severity` are VISUAL tones, not domain values. Assessment
 * status and finding severity values come from the API contract; the app maps
 * each contract value to a tone in one place (docs/responsibilities.md).
 */

const palette = {
  white: '#ffffff',
  navy: {
    950: '#07122b',
    900: '#0b1b3f',
    800: '#122a5c',
    700: '#1b3a7a',
  },
  blue: {
    50: '#eef3ff',
    100: '#dce6ff',
    200: '#bccfff',
    300: '#8eadfb',
    400: '#5b86f5',
    500: '#3366ee',
    600: '#2152d6',
    700: '#1b43af',
    800: '#1b398a',
  },
  slate: {
    25: '#fbfcfe',
    50: '#f5f7fb',
    100: '#eef1f6',
    200: '#e3e8ef',
    300: '#cdd5e0',
    400: '#98a3b6',
    500: '#697586',
    600: '#4b5565',
    700: '#364152',
    800: '#202939',
    900: '#121926',
  },
  green: {
    50: '#ecfdf3',
    100: '#d1fadf',
    200: '#a6f4c5',
    500: '#12b76a',
    600: '#039855',
    700: '#027a48',
  },
  amber: {
    50: '#fffaeb',
    100: '#fef0c7',
    200: '#fedf89',
    500: '#f79009',
    600: '#dc6803',
    700: '#b54708',
  },
  orange: {
    50: '#fff4ed',
    100: '#ffe6d5',
    200: '#ffd6ae',
    500: '#fb6514',
    600: '#ec4a0a',
    700: '#c4320a',
  },
  red: {
    50: '#fef3f2',
    100: '#fee4e2',
    200: '#fecdca',
    500: '#f04438',
    600: '#d92d20',
    700: '#b42318',
  },
  violet: { 50: '#f4f3ff', 100: '#ebe9fe', 500: '#7a5af8', 700: '#5925dc' },
  teal: { 50: '#f0fdf9', 100: '#ccfbef', 500: '#15b79e', 700: '#107569' },
} as const;

/** One visual tone: soft background, readable foreground, border, solid fill. */
interface ToneColors {
  readonly bg: string;
  readonly fg: string;
  readonly border: string;
  readonly solid: string;
}

const tone = (bg: string, fg: string, border: string, solid: string): ToneColors => ({
  bg,
  fg,
  border,
  solid,
});

const color = {
  bg: {
    app: palette.slate[50],
    surface: palette.white,
    subtle: palette.slate[25],
    muted: palette.slate[100],
    hover: palette.slate[50],
    selected: palette.blue[50],
    /** Sidebar and other dark chrome. */
    inverse: palette.navy[900],
    inverseRaised: palette.navy[800],
    inverseActive: palette.blue[600],
  },
  text: {
    primary: palette.slate[900],
    secondary: palette.slate[600],
    tertiary: palette.slate[500],
    disabled: palette.slate[400],
    inverse: palette.white,
    inverseMuted: '#b7c3dd',
    link: palette.blue[600],
    linkHover: palette.blue[700],
    onAction: palette.white,
  },
  border: {
    subtle: palette.slate[100],
    default: palette.slate[200],
    strong: palette.slate[300],
    focus: palette.blue[500],
    inverse: palette.navy[800],
  },
  action: {
    primary: {
      bg: palette.blue[600],
      bgHover: palette.blue[700],
      bgActive: palette.blue[800],
      fg: palette.white,
    },
    secondary: {
      bg: palette.white,
      bgHover: palette.slate[50],
      bgActive: palette.slate[100],
      fg: palette.slate[800],
      border: palette.slate[300],
    },
    ghost: {
      bg: 'transparent',
      bgHover: palette.slate[100],
      bgActive: palette.slate[200],
      fg: palette.slate[700],
    },
    danger: {
      bg: palette.red[600],
      bgHover: palette.red[700],
      bgActive: palette.red[700],
      fg: palette.white,
    },
  },
  status: {
    neutral: tone(palette.slate[100], palette.slate[700], palette.slate[200], palette.slate[500]),
    brand: tone(palette.blue[50], palette.blue[700], palette.blue[200], palette.blue[600]),
    info: tone(palette.blue[50], palette.blue[700], palette.blue[200], palette.blue[500]),
    success: tone(palette.green[50], palette.green[700], palette.green[200], palette.green[500]),
    warning: tone(palette.amber[50], palette.amber[700], palette.amber[200], palette.amber[500]),
    danger: tone(palette.red[50], palette.red[700], palette.red[200], palette.red[600]),
  },
  severity: {
    critical: tone(palette.red[50], palette.red[700], palette.red[200], palette.red[600]),
    high: tone(palette.orange[50], palette.orange[700], palette.orange[200], palette.orange[500]),
    medium: tone(palette.amber[50], palette.amber[700], palette.amber[200], palette.amber[500]),
    low: tone(palette.blue[50], palette.blue[700], palette.blue[200], palette.blue[400]),
    info: tone(palette.slate[100], palette.slate[700], palette.slate[200], palette.slate[400]),
  },
  /** Deterministic avatar backgrounds; foreground is always text.inverse. */
  avatar: {
    blue: palette.blue[600],
    violet: palette.violet[500],
    teal: palette.teal[500],
    amber: palette.amber[600],
    rose: palette.red[500],
    navy: palette.navy[700],
  },
  overlay: 'rgba(7, 18, 43, 0.48)',
  skeleton: palette.slate[100],
  focusRing: 'rgba(51, 102, 238, 0.35)',
} as const;

const font = {
  family: {
    /** Web only. Native uses the platform system font. */
    sans: "'Inter Variable', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
  },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
} as const;

/**
 * Text styles. Sizes and line heights are px. Web is desktop-dense (body 14);
 * native screens use the `*Lg` body styles for comfortable reading.
 */
const text = {
  /** Headline figures, e.g. the overall score on mobile. */
  hero: { size: 40, lineHeight: 48, weight: 700, tracking: -0.8 },
  display: { size: 30, lineHeight: 38, weight: 700, tracking: -0.4 },
  h1: { size: 24, lineHeight: 32, weight: 700, tracking: -0.3 },
  h2: { size: 20, lineHeight: 28, weight: 600, tracking: -0.2 },
  h3: { size: 16, lineHeight: 24, weight: 600, tracking: 0 },
  bodyLg: { size: 16, lineHeight: 24, weight: 400, tracking: 0 },
  body: { size: 14, lineHeight: 20, weight: 400, tracking: 0 },
  bodySm: { size: 13, lineHeight: 18, weight: 400, tracking: 0 },
  label: { size: 13, lineHeight: 18, weight: 500, tracking: 0 },
  caption: { size: 12, lineHeight: 16, weight: 400, tracking: 0 },
  overline: { size: 11, lineHeight: 16, weight: 600, tracking: 0.6 },
  metric: { size: 28, lineHeight: 34, weight: 700, tracking: -0.4 },
} as const;

/** 4px base grid. Keys are multiples of 4px ("0.5" = 2px). */
const space = {
  0: 0,
  '0.5': 2,
  1: 4,
  '1.5': 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

const radius = { none: 0, sm: 4, md: 8, lg: 12, xl: 16, '2xl': 20, full: 9999 } as const;

/**
 * Restrained elevation. CSS box-shadow syntax, used as-is by React Native's
 * `boxShadow` style (new architecture, RN ≥ 0.76).
 */
const shadow = {
  none: 'none',
  xs: '0 1px 2px rgba(16, 24, 40, 0.05)',
  sm: '0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04)',
  md: '0 4px 12px -2px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.04)',
  lg: '0 12px 24px -4px rgba(16, 24, 40, 0.12), 0 4px 8px -4px rgba(16, 24, 40, 0.06)',
  xl: '0 24px 48px -12px rgba(16, 24, 40, 0.22)',
  focus: '0 0 0 3px rgba(51, 102, 238, 0.35)',
} as const;

/** Min-width breakpoints (px). CSS variables cannot be used in media queries. */
const breakpoint = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;

const size = {
  /** Web control heights (desktop-dense). */
  control: { sm: 32, md: 38, lg: 44 },
  /** Native control heights: md and up meet the 44pt minimum touch target. */
  controlNative: { sm: 36, md: 44, lg: 52 },
  /** Minimum touch target on native (Apple HIG 44pt). */
  touchTarget: 44,
  icon: { sm: 16, md: 20, lg: 24 },
  avatar: { sm: 28, md: 36, lg: 48 },
} as const;

const layout = {
  sidebarWidth: 240,
  headerHeight: 64,
  contentMaxWidth: 1440,
  drawerWidth: 480,
  modalWidth: 560,
} as const;

const zIndex = {
  base: 0,
  sticky: 10,
  dropdown: 1000,
  overlay: 1100,
  modal: 1200,
  toast: 1300,
} as const;

const motion = {
  duration: { fast: 120, normal: 200, slow: 320 },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
  },
} as const;

export const tokens = {
  palette,
  color,
  font,
  text,
  space,
  radius,
  shadow,
  breakpoint,
  size,
  layout,
  zIndex,
  motion,
} as const;

export type Tokens = typeof tokens;
export type StatusTone = keyof Tokens['color']['status'];
export type SeverityTone = keyof Tokens['color']['severity'];
export type AvatarTone = keyof Tokens['color']['avatar'];
export type TextStyle = keyof Tokens['text'];
export type SpaceKey = keyof Tokens['space'];
