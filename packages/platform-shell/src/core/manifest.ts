import type { Capability, Permission } from '@radial-pulse/shared-types';

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
  /**
   * Label for users who see only their own clinics (`all_clinics` is false),
   * e.g. "My Clinics" for a Digital Success Manager.
   */
  scopedLabel?: string;
  to: string;
  icon: NavIcon;
  /** Platform-level permission (`MeResponse.permissions`). */
  requiredCapability?: Capability;
  placement: NavPlacement;
  order: number;
}

/**
 * A clinic-scoped section. Web: a tab of the clinic workspace
 * (/clinics/$clinicId/<path>). Mobile: a bottom tab of the Clinic
 * Administrator app, whose `path` is the tab's route name.
 */
export interface ClinicSectionEntry {
  id: string;
  label: string;
  /** Web: path relative to the clinic root ('' = landing). Mobile: tab route name. */
  path: string;
  /** Mobile tab icon. */
  icon?: NavIcon;
  /** Permission inside the clinic (`ClinicAccess.permissions`). */
  requiredPermission?: Permission;
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
