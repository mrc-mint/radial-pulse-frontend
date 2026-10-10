import type { ClinicSectionEntry, ModuleManifest } from '@radial-pulse/shell-core';
import { hasClinicPermission, type ClinicPermissionSet } from '@radial-pulse/shell-core';
import { chatModule } from '@radial-pulse/clinic-chat/manifest';
import { connectAccountsModule } from '@radial-pulse/clinic-connect-accounts/manifest';
import { homeModule } from '@radial-pulse/clinic-home/manifest';
import { insightsModule } from '@radial-pulse/clinic-insights/manifest';
import { profileModule } from '@radial-pulse/clinic-profile/manifest';
import { assessmentsModule } from '@radial-pulse/clinic-assessments/manifest';
import { socialMediaModule } from '@radial-pulse/clinic-social-media/manifest';

/**
 * The ONE list of modules the Clinic app includes (enforces docs/scope-v1.md).
 * Clinic Administrator experience only: no Clinic Team Member modules.
 */
export const mobileModules: ReadonlyArray<ModuleManifest> = [
  homeModule,
  insightsModule,
  socialMediaModule,
  assessmentsModule,
  profileModule,
  chatModule,
  connectAccountsModule,
];

/** Bottom tabs: the modules' clinic sections, in order. */
export const TAB_SECTIONS: ReadonlyArray<ClinicSectionEntry> = mobileModules
  .flatMap((m) => m.clinicSections ?? [])
  .sort((a, b) => a.order - b.order);

/** Whether a tab is shown for the selected clinic's permissions. */
export function isTabVisible(section: ClinicSectionEntry, permissions: ClinicPermissionSet) {
  return hasClinicPermission(permissions, section.requiredPermission);
}
