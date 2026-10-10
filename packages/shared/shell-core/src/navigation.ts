import type { Capability, Permission } from '@radial-pulse/shared-types';
import { can } from '@radial-pulse/utils';
import type { ModuleManifest, ResolvedClinicSection, ResolvedNavEntry } from './manifest';

/**
 * Builds the navigation from registered modules, the platform-level
 * permissions and the clinic scope in `GET /auth/me`. Role names are never
 * compared here, so a future role needs no shell change.
 */
export function resolveNavigation(
  modules: ReadonlyArray<ModuleManifest>,
  capabilities: ReadonlySet<Capability>,
  scope: { allClinics: boolean },
): ResolvedNavEntry[] {
  return modules
    .flatMap((m) => m.navEntries ?? [])
    .filter((entry) => can(capabilities, entry.requiredCapability))
    .sort((a, b) => a.order - b.order)
    .map((entry) => ({
      id: entry.id,
      to: entry.to,
      icon: entry.icon,
      placement: entry.placement,
      label: !scope.allClinics && entry.scopedLabel ? entry.scopedLabel : entry.label,
    }));
}

/**
 * Permissions inside one clinic. `unrestricted` means the API reported
 * `all_clinics` without per-clinic permissions (API 0.1.0, Platform
 * Administrator): every section is shown and the API decides.
 */
export type ClinicPermissionSet = ReadonlySet<Permission> | 'unrestricted';

export function hasClinicPermission(
  permissions: ClinicPermissionSet,
  required: Permission | undefined,
): boolean {
  if (required === undefined || permissions === 'unrestricted') return true;
  return permissions.has(required);
}

/** Clinic workspace sections for one clinic, filtered by that clinic's permissions. */
export function resolveClinicSections(
  modules: ReadonlyArray<ModuleManifest>,
  permissions: ClinicPermissionSet,
  clinicId: string,
): ResolvedClinicSection[] {
  const root = `/clinics/${encodeURIComponent(clinicId)}`;
  return modules
    .flatMap((m) => m.clinicSections ?? [])
    .filter((section) => hasClinicPermission(permissions, section.requiredPermission))
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      id: section.id,
      label: section.label,
      to: section.path ? `${root}/${section.path}` : root,
      exact: section.path === '',
    }));
}

const trimSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/**
 * Whether a link target is the current location. Non-exact targets also match
 * their descendants ("/clinics" is active on "/clinics/c_1/audit") but never a
 * sibling that merely shares a prefix ("/clinics-archive").
 */
export function isRouteActive(to: string, pathname: string, exact = false): boolean {
  const target = trimSlash(to);
  const current = trimSlash(pathname);
  if (current === target) return true;
  if (exact) return false;
  return current.startsWith(target === '/' ? '/' : `${target}/`);
}
