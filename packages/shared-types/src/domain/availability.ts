/**
 * Assessment component availability (spec §10).
 *
 * When no engine is available for a component the platform shows
 * "Not Available". It is NOT a score of zero, a placeholder, or an estimate.
 * Encoding this as a discriminated union makes a fake score a type error:
 * a `not_available` value has no `score` field to fill in.
 *
 * Phase 4: once the contract exists, this is re-pointed to (or checked
 * against) the generated schema so the backend shape stays authoritative.
 */
export type ComponentScore =
  | { availability: 'available'; score: number }
  | { availability: 'not_available' };
