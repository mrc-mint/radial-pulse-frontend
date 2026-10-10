import type { ModuleManifest } from '@radial-pulse/shell-core';

/** The person, their clinic's details, connected accounts and sign-out. No Team in V1. */
export const profileModule: ModuleManifest = {
  id: 'profile',
  clinicSections: [
    { id: 'profile', label: 'Profile', path: 'profile', icon: 'profile', order: 50 },
  ],
};
