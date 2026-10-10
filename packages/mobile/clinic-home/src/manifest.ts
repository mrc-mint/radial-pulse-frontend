import type { ModuleManifest } from '@radial-pulse/shell-core';

export const homeModule: ModuleManifest = {
  id: 'home',
  clinicSections: [
    {
      id: 'home',
      label: 'Home',
      path: 'home',
      icon: 'home',
      order: 10,
      requiredPermission: 'clinics:read',
    },
  ],
};
