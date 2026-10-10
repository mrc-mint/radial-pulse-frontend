import type { ModuleManifest } from '@radial-pulse/shell-core';

/**
 * Client Collaboration: each client organization has its own chat, reached
 * through its workspace. Its Digital Success Manager chats; Platform Administrators do not
 * (the workspace hides this section for `all_clinics` sessions).
 */
export const chatModule: ModuleManifest = {
  id: 'chat',
  clinicSections: [
    {
      id: 'chat',
      label: 'Client Collaboration',
      path: 'chat',
      order: 70,
      requiredPermission: 'chat:read',
    },
  ],
};
