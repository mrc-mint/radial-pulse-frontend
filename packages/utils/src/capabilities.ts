import type { Capability } from '@radial-pulse/shared-types';

/**
 * UI-only permission check against capabilities returned by `GET /me`.
 * Hiding a control is a UX decision, never a security control.
 */
export function can(capabilities: ReadonlySet<Capability>, required: Capability | undefined): boolean {
  return required === undefined || capabilities.has(required);
}
