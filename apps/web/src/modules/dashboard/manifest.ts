import type { ModuleManifest } from '@radial-pulse/shell-core';

export const dashboardModule: ModuleManifest = {
  id: 'dashboard',
  navEntries: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      to: '/dashboard',
      icon: 'dashboard',
      placement: 'primary',
      order: 10,
    },
  ],
};
