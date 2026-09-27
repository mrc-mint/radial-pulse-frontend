import type { Capability } from '@radial-pulse/shared-types';

/**
 * PLACEHOLDER capability identifiers.
 *
 * Capability values are owned by the backend and arrive in `GET /me`
 * (decision 5d). No contract has been published yet, so these are the only
 * capability strings the web app knows, kept in this one file. When the
 * contract lands, replace the values here (ideally with generated contract
 * constants) — nothing else in the app hardcodes a capability string.
 *
 * The values match the fixtures used since the Phase 2 scaffold.
 */
export const CAPABILITIES = {
  /** Users module (Platform Administrator only, docs/scope-v1.md). */
  manageUsers: 'users.manage',
  /** Sees only assigned clinics; the Clinics entry reads "My Clinics". */
  assignedClinicsOnly: 'clinics.assigned_only',
} as const satisfies Record<string, Capability>;
