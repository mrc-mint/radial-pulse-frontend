import type { Capability } from '@radial-pulse/shared-types';
import { can } from '@radial-pulse/utils';
import type { ModuleManifest, ResolvedNavEntry } from './manifest';

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
    .flatMap((m) => m.navEntries)
    .filter((entry) => can(capabilities, entry.requiredCapability))
    .sort((a, b) => a.order - b.order)
    .map((entry) => ({
      id: entry.id,
      to: entry.to,
      placement: entry.placement,
      label: entry.labelWhen?.find((l) => capabilities.has(l.capability))?.label ?? entry.label,
    }));
}
