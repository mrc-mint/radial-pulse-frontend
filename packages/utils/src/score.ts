import type { ComponentScore } from '@radial-pulse/shared-types';

/** Product copy for a component without an available engine (spec §10). */
export const NOT_AVAILABLE_LABEL = 'Not Available';

/**
 * Display text for a component score. Never turns missing data into 0.
 * The score itself is computed by the backend; this only formats it.
 */
export function formatComponentScore(value: ComponentScore): string {
  if (value.availability === 'not_available') return NOT_AVAILABLE_LABEL;
  return String(Math.round(value.score));
}
