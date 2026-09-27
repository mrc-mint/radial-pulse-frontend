import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/**
 * The ONE list of modules the mobile app includes (enforces docs/scope-v1.md).
 * Modules (home, insights, social-media, reports, profile, chat,
 * connect-accounts) are added from Phase 6.
 */
export const mobileModules: ReadonlyArray<ModuleManifest> = [];
