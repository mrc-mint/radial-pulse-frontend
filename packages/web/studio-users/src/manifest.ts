import type { ModuleManifest } from '@radial-pulse/shell-core';

/** Platform Administrator only (docs/scope-v1.md): gated on `users:read`. */
export const usersModule: ModuleManifest = {
  id: 'users',
  navEntries: [
    {
      id: 'users',
      label: 'Users',
      to: '/users',
      icon: 'users',
      requiredCapability: 'users:read',
      placement: 'primary',
      order: 30,
    },
  ],
};
