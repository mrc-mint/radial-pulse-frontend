import type { ModuleManifest } from '@radial-pulse/shell-core';
import { assessmentsModule } from '../modules/assessments/manifest';
import { chatModule } from '../modules/chat/manifest';
import { clinicsModule } from '../modules/clinics/manifest';
import { dashboardModule } from '../modules/dashboard/manifest';
import { settingsModule } from '../modules/settings/manifest';
import { socialMediaModule } from '../modules/social-media/manifest';
import { usersModule } from '../modules/users/manifest';
import { STUDIO_FEATURES } from './release';

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
