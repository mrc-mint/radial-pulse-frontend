import type { ModuleManifest } from '@radial-pulse/shell-core';

/** Clinic-scoped: reached through the clinic workspace, not the sidebar. */
export const socialMediaModule: ModuleManifest = {
  id: 'social-media',
  clinicSections: [
    {
      id: 'social-media',
      label: 'Social Presence Insights',
      path: 'social-media',
      order: 30,
      requiredPermission: 'connections:read',
    },
  ],
};
