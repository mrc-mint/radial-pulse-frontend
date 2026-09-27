import type { ModuleManifest } from '@radial-pulse/platform-shell/core';
import { CAPABILITIES } from '../../app/capabilities';

/** Platform Administrator only (docs/scope-v1.md). */
export const usersModule: ModuleManifest = {
  id: 'users',
  navEntries: [
    {
      id: 'users',
      label: 'Users',
      to: '/users',
      icon: 'users',
      requiredCapability: CAPABILITIES.manageUsers,
      placement: 'primary',
      order: 30,
    },
  ],
};
