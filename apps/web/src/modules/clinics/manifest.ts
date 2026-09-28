import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/**
 * Clinics / My Clinics: one route; "My Clinics" when the user does not see all
 * clinics (`MeResponse.all_clinics` is false, docs/scope-v1.md). Owns the clinic
 * workspace landing sections. Assigning a Digital Success Manager happens
 * inside the clinic, not in a separate module.
 */
export const clinicsModule: ModuleManifest = {
  id: 'clinics',
  navEntries: [
    {
      id: 'clinics',
      label: 'Clinics',
      scopedLabel: 'My Clinics',
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
      id: 'activity',
      label: 'Activity',
      path: 'activity',
      order: 60,
      requiredPermission: 'audit_log:read',
    },
  ],
};
