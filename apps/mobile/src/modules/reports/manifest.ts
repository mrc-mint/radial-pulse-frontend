import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/** V1 reports are the clinic's published assessments (docs/scope-v1.md). */
export const reportsModule: ModuleManifest = {
  id: 'reports',
  clinicSections: [
    {
      id: 'reports',
      label: 'Reports',
      path: 'reports',
      icon: 'reports',
      order: 40,
      requiredPermission: 'assessments:read',
    },
  ],
};
