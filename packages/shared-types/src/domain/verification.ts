import type { components } from '../contract';

/**
 * Verification state of a discovered presence profile (contract
 * `PresenceVerification`). Human decisions (`confirmed`, `rejected`) are never
 * overwritten by automated discovery — enforced by the backend.
 */
export type VerificationStatus = components['schemas']['PresenceVerification'];
