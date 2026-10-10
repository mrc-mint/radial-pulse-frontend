import type { ModuleManifest } from '@radial-pulse/shell-core';

/** Social Presence: connected accounts, metrics and the assessment's social findings (no posts in V1). */
export const socialMediaModule: ModuleManifest = {
  id: 'social-media',
  clinicSections: [
    {
      id: 'social-media',
      label: 'Social Presence',
      path: 'social-media',
      icon: 'social',
      order: 30,
      requiredPermission: 'connections:read',
    },
  ],
};
