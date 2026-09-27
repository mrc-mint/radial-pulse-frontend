import type { Capability } from '@radial-pulse/shared-types';

/**
 * The seam between the Central Tech shell and feature modules
 * (architecture §4). Modules describe what they contribute; the shell decides
 * what the current user sees. Composition is compile-time: each app lists its
 * modules in module-registry.ts.
 */
export type NavPlacement = 'primary' | 'secondary';

/**
 * Icon names, not components: this file is platform-neutral, and each
 * platform shell maps a name to its own icon set (Lucide on web).
 */
export type NavIcon =
  | 'dashboard'
  | 'clinics'
  | 'users'
  | 'reports'
  | 'settings'
  | 'home'
  | 'insights'
  | 'social'
  | 'profile'
  | 'chat';

export interface NavEntry {
  id: string;
  /** Product label, e.g. "Clinics". */
  label: string;
  /** Optional role-specific label, keyed by capability (e.g. "My Clinics"). */
  labelWhen?: ReadonlyArray<{ capability: Capability; label: string }>;
  to: string;
  icon: NavIcon;
  requiredCapability?: Capability;
  placement: NavPlacement;
  order: number;
}

/**
 * A section of the clinic workspace (web: /clinics/$clinicId/<path>).
 * Clinic-scoped features (audit, social media, chat) contribute sections
 * instead of global navigation entries.
 */
export interface ClinicSectionEntry {
  id: string;
  label: string;
  /** Path relative to the clinic root; '' is the clinic's landing section. */
  path: string;
  requiredCapability?: Capability;
  order: number;
}

export interface ModuleManifest {
  id: string;
  navEntries?: ReadonlyArray<NavEntry>;
  clinicSections?: ReadonlyArray<ClinicSectionEntry>;
}

export interface ResolvedNavEntry {
  id: string;
  label: string;
  to: string;
  icon: NavIcon;
  placement: NavPlacement;
}

export interface ResolvedClinicSection {
  id: string;
  label: string;
  to: string;
  /** Active only on an exact path match (the landing section). */
  exact: boolean;
}
