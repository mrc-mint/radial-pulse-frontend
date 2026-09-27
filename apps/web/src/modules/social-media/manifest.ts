import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/** Clinic-scoped: reached through the clinic workspace, not the sidebar. */
export const socialMediaModule: ModuleManifest = {
  id: 'social-media',
  clinicSections: [{ id: 'social-media', label: 'Social Media', path: 'social-media', order: 40 }],
};
