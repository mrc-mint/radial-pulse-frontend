import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/**
 * The ONE list of modules this app includes. If a feature is not registered
 * here it does not exist in the app — this is how the V1 scope
 * (docs/scope-v1.md) is enforced in code. Modules are added from Phase 5.
 */
export const webModules: ReadonlyArray<ModuleManifest> = [];
