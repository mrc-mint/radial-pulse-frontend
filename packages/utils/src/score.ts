import type { ComponentScore, ComponentStatus, Schema } from '@radial-pulse/shared-types';

/** Product copy for a component without an available engine (spec §10). */
export const NOT_AVAILABLE_LABEL = 'Not Available';

const STATUS_TEXT: Record<Exclude<ComponentStatus, 'completed'>, string> = {
  not_available: NOT_AVAILABLE_LABEL,
  pending: 'Pending',
  failed: 'Failed',
};

/**
 * Display text for a contract score. Never turns missing data into 0: only a
 * `completed` component with a numeric score shows a number. The score itself
 * is computed by the backend; this only formats it.
 */
export function formatComponentScore(value: ComponentScore): string {
  if (value.status === 'completed') {
    return value.score === null ? 'No score' : String(Math.round(value.score));
  }
  return STATUS_TEXT[value.status];
}

const OVERALL_EMPTY: Readonly<Record<Schema<'AssessmentStatus'>, string>> = {
  queued: 'In progress',
  running: 'In progress',
  completed: NOT_AVAILABLE_LABEL,
  partial: NOT_AVAILABLE_LABEL,
  failed: 'Failed',
};

/** What to show instead of a missing `overall_score`, from the assessment's contract status. */
export function overallScoreEmptyLabel(status: Schema<'AssessmentStatus'>): string {
  return OVERALL_EMPTY[status];
}

/** A backend score that may be absent (e.g. `overall_score`). Null is never 0. */
export function formatScore(score: number | null | undefined, emptyLabel = NOT_AVAILABLE_LABEL) {
  return score === null || score === undefined ? emptyLabel : String(Math.round(score));
}
