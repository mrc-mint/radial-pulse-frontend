import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/**
 * Client Collaboration: chat with the clinic's Digital Success Manager, a
 * modal from the floating button, not a tab.
 */
export const chatModule: ModuleManifest = { id: 'chat' };

export const CHAT_PERMISSION = 'chat:read' as const;
