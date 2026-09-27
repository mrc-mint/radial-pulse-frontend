import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/** Connected accounts and the assessment's social presence (no posts in V1). */
export const socialMediaModule: ModuleManifest = {
  id: 'social-media',
  clinicSections: [
    {
      id: 'social-media',
      label: 'Social Media',
      path: 'social-media',
      icon: 'social',
      order: 30,
      requiredPermission: 'connections:read',
    },
  ],
};
