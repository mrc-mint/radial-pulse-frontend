import type { components } from '../contract';

/**
 * Assessment component status (contract `ComponentStatus`).
 *
 * `not_available` means no engine is deployed for that component: it is
 * shown as "Not Available", never as a score of 0. A component only has a
 * meaningful score when its status is `completed`.
 */
export type ComponentStatus = components['schemas']['ComponentStatus'];

/** The part of a contract `ComponentDetail` needed to display its score. */
export type ComponentScore = Pick<components['schemas']['ComponentDetail'], 'status' | 'score'>;
