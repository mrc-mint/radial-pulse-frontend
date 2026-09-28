import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/**
 * Each clinic has its own chat; reached through the clinic workspace. The
 * clinic's Digital Success Manager chats; Platform Administrators do not
 * (the workspace hides this section for `all_clinics` sessions).
 */
export const chatModule: ModuleManifest = {
  id: 'chat',
  clinicSections: [
    { id: 'chat', label: 'Chat', path: 'chat', order: 70, requiredPermission: 'chat:read' },
  ],
};
