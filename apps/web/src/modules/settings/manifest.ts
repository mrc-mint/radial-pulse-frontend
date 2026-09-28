import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

export const settingsModule: ModuleManifest = {
  id: 'settings',
  navEntries: [
    {
      id: 'settings',
      label: 'Settings',
      to: '/settings',
      icon: 'settings',
      placement: 'primary',
      order: 90,
    },
  ],
};
