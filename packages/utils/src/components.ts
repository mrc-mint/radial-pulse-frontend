import type { Schema } from '@radial-pulse/shared-types';

type ComponentKey = Schema<'AssessmentComponentKey'>;

/**
 * Assessment sections whose score is not shown anywhere in the product
 * (product decision). Their findings and recommendations are still shown.
 * The backend's overall score is its own figure and is not recalculated.
 */
const SCORE_HIDDEN: ReadonlySet<ComponentKey> = new Set<ComponentKey>(['google_business_profile']);

/** Whether a section's score card / tile is shown. */
export function showsComponentScore(key: ComponentKey): boolean {
  return !SCORE_HIDDEN.has(key);
}
