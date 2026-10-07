import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/**
 * Client Organizations / My Client Portfolio: one route (`/clinics`); "My
 * Client Portfolio" when the user does not see all
 * clinics (`MeResponse.all_clinics` is false, docs/scope-v1.md). Owns the clinic
 * workspace landing sections. Assigning a Digital Success Manager happens
 * inside the clinic, not in a separate module.
 */
export const clinicsModule: ModuleManifest = {
  id: 'clinics',
  navEntries: [
    {
      id: 'clinics',
      label: 'Client Organizations',
      scopedLabel: 'My Client Portfolio',
      to: '/clinics',
      icon: 'clinics',
      placement: 'primary',
      order: 20,
    },
  ],
  clinicSections: [
    { id: 'overview', label: 'Overview', path: '', order: 10, requiredPermission: 'clinics:read' },
    {
      id: 'digital-information',
      label: 'Digital Presence',
      path: 'digital-information',
      order: 20,
      requiredPermission: 'presence:read',
    },
    {
      id: 'listings',
      label: 'Listings',
      path: 'listings',
      order: 40,
      requiredPermission: 'presence:read',
    },
    {
      id: 'media',
      label: 'Media',
      path: 'media',
      order: 55,
      requiredPermission: 'assets:read',
    },
    {
      id: 'activity',
      label: 'Activity',
      path: 'activity',
      order: 60,
      requiredPermission: 'audit_log:read',
    },
  ],
};
