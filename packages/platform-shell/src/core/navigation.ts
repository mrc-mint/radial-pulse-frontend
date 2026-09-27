import type { Capability } from '@radial-pulse/shared-types';
import { can } from '@radial-pulse/utils';
import type { ModuleManifest, ResolvedClinicSection, ResolvedNavEntry } from './manifest';

/**
 * Builds the navigation from registered modules and the capabilities in
 * GET /me. Role names are never compared here — only capabilities — so a
 * future role (e.g. Clinic Team Member) needs no shell change.
 */
export function resolveNavigation(
  modules: ReadonlyArray<ModuleManifest>,
  capabilities: ReadonlySet<Capability>,
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
      label: entry.labelWhen?.find((l) => capabilities.has(l.capability))?.label ?? entry.label,
    }));
}

/** Clinic workspace sections for one clinic, filtered by capability. */
export function resolveClinicSections(
  modules: ReadonlyArray<ModuleManifest>,
  capabilities: ReadonlySet<Capability>,
  clinicId: string,
): ResolvedClinicSection[] {
  const root = `/clinics/${encodeURIComponent(clinicId)}`;
  return modules
    .flatMap((m) => m.clinicSections ?? [])
    .filter((section) => can(capabilities, section.requiredCapability))
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
