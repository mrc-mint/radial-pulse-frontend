/**
 * Verification status of a discovered digital-profile value (spec §6).
 * Human-confirmed values take precedence and are never overwritten by
 * automated enrichment — that rule is enforced by the backend.
 *
 * Wire values will follow the backend contract; these are the approved
 * product states.
 */
export type VerificationStatus = 'UNVERIFIED' | 'HUMAN_CONFIRMED';
