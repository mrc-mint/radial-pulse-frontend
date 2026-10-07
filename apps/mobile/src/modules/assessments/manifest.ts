import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/** The clinic's published Digital Presence Assessments (docs/scope-v1.md). */
export const assessmentsModule: ModuleManifest = {
  id: 'assessments',
  clinicSections: [
    {
      id: 'assessments',
      label: 'Assessments',
      path: 'assessments',
      icon: 'reports',
      order: 40,
      requiredPermission: 'assessments:read',
    },
  ],
};
