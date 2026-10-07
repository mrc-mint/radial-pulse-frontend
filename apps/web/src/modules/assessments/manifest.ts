import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/**
 * The one Digital Presence Assessment per client organization (contract
 * `assessments`).
 * No per-audit-type navigation (docs/scope-v1.md).
 */
export const assessmentsModule: ModuleManifest = {
  id: 'assessments',
  navEntries: [
    {
      id: 'assessments',
      label: 'Digital Presence Assessments',
      to: '/assessments',
      icon: 'reports',
      placement: 'primary',
      order: 40,
    },
  ],
  clinicSections: [
    {
      id: 'assessment',
      label: 'Digital Presence Assessment',
      path: 'assessment',
      order: 50,
      requiredPermission: 'assessments:read',
    },
  ],
};
