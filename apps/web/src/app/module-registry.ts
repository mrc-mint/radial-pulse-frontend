import type { ModuleManifest } from '@radial-pulse/shell-core';
import { assessmentsModule } from '@radial-pulse/studio-assessments/manifest';
import { chatModule } from '@radial-pulse/studio-chat/manifest';
import { clinicsModule } from '@radial-pulse/studio-clinics/manifest';
import { dashboardModule } from '@radial-pulse/studio-dashboard/manifest';
import { settingsModule } from '@radial-pulse/studio-settings/manifest';
import { socialMediaModule } from '@radial-pulse/studio-social-media/manifest';
import { usersModule } from '@radial-pulse/studio-users/manifest';
import { STUDIO_FEATURES } from '@radial-pulse/studio-kit';

/**
 * The ONE list of modules this app includes. If a feature is not registered
 * here it does not exist in the app — this is how the V1 scope
 * (docs/scope-v1.md) is enforced in code.
 *
 * Sidebar order comes from each entry's `order`; clinic-scoped features
 * (audit, social media, chat) contribute clinic workspace sections instead
 * of sidebar entries.
 */
export const webModules: ReadonlyArray<ModuleManifest> = [
  dashboardModule,
  clinicsModule,
  usersModule,
  assessmentsModule,
  socialMediaModule,
  // Client Collaboration is V2 (STUDIO_FEATURES).
  ...(STUDIO_FEATURES.clientCollaboration ? [chatModule] : []),
  settingsModule,
];
