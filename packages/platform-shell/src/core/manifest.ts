import type { Capability } from '@radial-pulse/shared-types';

/**
 * The seam between the Central Tech shell and feature modules
 * (architecture §4). Modules describe what they contribute; the shell decides
 * what the current user sees. Composition is compile-time: each app lists its
 * modules in module-registry.ts.
 *
 * Phase 5 extends this with clinic sections and dashboard widgets.
 */
export type NavPlacement = 'primary' | 'secondary';

export interface NavEntry {
  id: string;
  /** Product label, e.g. "Clinics". */
  label: string;
  /** Optional role-specific label, keyed by capability (e.g. "My Clinics"). */
  labelWhen?: ReadonlyArray<{ capability: Capability; label: string }>;
  to: string;
  requiredCapability?: Capability;
  placement: NavPlacement;
  order: number;
}

export interface ModuleManifest {
  id: string;
  navEntries: ReadonlyArray<NavEntry>;
}

export interface ResolvedNavEntry {
  id: string;
  label: string;
  to: string;
  placement: NavPlacement;
}
