import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/** Each clinic has its own chat; reached through the clinic workspace. */
export const chatModule: ModuleManifest = {
  id: 'chat',
  clinicSections: [{ id: 'chat', label: 'Chat', path: 'chat', order: 50 }],
};
