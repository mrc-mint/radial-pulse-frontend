import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/** The published Digital Presence Assessment: overview, components, findings. */
export const insightsModule: ModuleManifest = {
  id: 'insights',
  clinicSections: [
    {
      id: 'insights',
      label: 'Insights',
      path: 'insights',
      icon: 'insights',
      order: 20,
      requiredPermission: 'assessments:read',
    },
  ],
};
