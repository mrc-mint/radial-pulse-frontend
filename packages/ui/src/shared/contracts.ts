import type { SeverityTone, StatusTone } from '@radial-pulse/design-tokens';
import type { ComponentScore } from '@radial-pulse/shared-types';
import type { ReactNode } from 'react';

/**
 * Prop contracts shared by @radial-pulse/ui/web and @radial-pulse/ui/native.
 *
 * Only platform-neutral props live here. Event handlers differ per platform
 * (onClick vs onPress), so each implementation adds its own. Components are
 * presentational: they receive data and never fetch.
 *
 * Tones are VISUAL. Contract values (assessment status, finding severity,
 * clinic status) are mapped to a tone by the app, in one place — the UI never
 * interprets domain values or derives them from scores.
 */
export type { SeverityTone, StatusTone };

export type ControlSize = 'sm' | 'md' | 'lg';

// ── Actions ─────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ControlSize;
  /** Shows a spinner, keeps the width, and blocks interaction. */
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children: ReactNode;
}

export interface IconButtonBaseProps {
  icon: ReactNode;
  /** Required accessible name — icon-only controls have no visible text. */
  label: string;
  variant?: Exclude<ButtonVariant, 'danger'>;
  size?: ControlSize;
  disabled?: boolean;
}

// ── Form controls ───────────────────────────────────────────────────────────

export interface FieldBaseProps {
  /** Always required for accessibility; use hideLabel to hide it visually. */
  label: string;
  hideLabel?: boolean;
  hint?: string;
  /** Error message. Presence marks the field invalid. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
  disabled?: boolean;
}

export interface SelectBaseProps<V extends string = string> extends FieldBaseProps {
  options: ReadonlyArray<SelectOption<V>>;
  value: V | null;
  onChange: (value: V) => void;
  placeholder?: string;
}

// ── Layout and display ──────────────────────────────────────────────────────

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardBaseProps {
  title?: string;
  description?: string;
  /** Right-aligned header content, e.g. a link or a filter. */
  actions?: ReactNode;
  padding?: CardPadding;
  children?: ReactNode;
}

export interface BadgeBaseProps {
  tone?: StatusTone;
  /** Leading status dot — the reference's "status indicator" style. */
  dot?: boolean;
  size?: 'sm' | 'md';
  children: ReactNode;
}

export interface AvatarBaseProps {
  /** Person or clinic name: drives initials, colour and the accessible name. */
  name: string;
  src?: string | null;
  size?: ControlSize;
}

export interface TabItem<V extends string = string> {
  value: V;
  label: string;
  /** Backend-provided count shown next to the label. */
  count?: number;
  disabled?: boolean;
}

export interface TabsBaseProps<V extends string = string> {
  /** Accessible name of the tab list. */
  label: string;
  items: ReadonlyArray<TabItem<V>>;
  value: V;
  onChange: (value: V) => void;
}

export interface PageHeaderBaseProps {
  title: string;
  description?: string;
  /** Primary page actions. */
  actions?: ReactNode;
  /** Back control slot. Routing belongs to the app, so it passes the link. */
  back?: ReactNode;
}

// ── Overlays ────────────────────────────────────────────────────────────────

export interface ModalBaseProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Action row, usually Cancel + primary. */
  footer?: ReactNode;
}

// ── Data display ────────────────────────────────────────────────────────────

export type TrendDirection = 'up' | 'down' | 'flat';

/** A change value supplied by the backend. The UI never computes deltas. */
export interface MetricChange {
  /** Display text, e.g. "12%" or "+340". */
  label: string;
  direction: TrendDirection;
  /** Whether the change is good is a product judgement the caller makes. */
  tone?: StatusTone;
  /** Context, e.g. "vs last 30 days". */
  period?: string;
}

export interface MetricCardBaseProps {
  label: string;
  /**
   * Backend value. `null`/`undefined` renders "Not Available" — never 0.
   * Numbers are grouped for display (12,480); strings render as given.
   */
  value: string | number | null | undefined;
  icon?: ReactNode;
  change?: MetricChange;
  hint?: string;
}

export interface ScoreComparison {
  /** e.g. "Competitor average". */
  label: string;
  score: ComponentScore;
}

export interface ScoreCardBaseProps {
  label: string;
  /** From the assessment contract. `not_available` renders "Not Available". */
  score: ComponentScore;
  /** Scale maximum for display, e.g. 100. */
  max?: number;
  /**
   * Visual tone, supplied by the caller from backend data (e.g. a rating
   * band in the contract). The UI never derives a tone from the number.
   */
  tone?: StatusTone;
  caption?: string;
  comparison?: ScoreComparison;
}

/** Evidence attached to a finding (spec: critical/high findings carry it). */
export interface FindingEvidence {
  sourceUrl?: string;
  excerpt?: string;
  provider?: string;
  /** ISO-8601 timestamp from the contract. */
  observedAt?: string;
}

export interface FindingSeverity {
  /** Contract value's display label, e.g. "High". */
  label: string;
  tone: SeverityTone;
}

export interface FindingCardBaseProps {
  title: string;
  description?: string;
  severity: FindingSeverity;
  /** Assessment section the finding belongs to, e.g. "Google Business Profile". */
  sectionLabel?: string;
  /** Backend recommendation text, rendered as-is. */
  recommendation?: string;
  evidence?: ReadonlyArray<FindingEvidence>;
}

// ── Feedback states ─────────────────────────────────────────────────────────

export interface EmptyStateBaseProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export interface LoadingStateBaseProps {
  /** Announced to assistive tech and shown under the spinner. */
  label?: string;
}

export interface ErrorStateBaseProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  /** Shown so users can quote it to support (ApiError.requestId). */
  requestId?: string;
}

export interface SkeletonBaseProps {
  width?: number | string;
  height?: number;
  radius?: 'sm' | 'md' | 'lg' | 'full';
}
