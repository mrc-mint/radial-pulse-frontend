import type { ModuleManifest } from '@radial-pulse/platform-shell/core';
import { CAPABILITIES } from '../../app/capabilities';

/**
 * Clinics / My Clinics: one route, labelled by capability (docs/scope-v1.md).
 * Owns the clinic workspace landing sections. Assignment of a Digital Success
 * Manager happens inside the clinic, not in a separate module.
 */
export const clinicsModule: ModuleManifest = {
  id: 'clinics',
  navEntries: [
    {
      id: 'clinics',
      label: 'Clinics',
      labelWhen: [{ capability: CAPABILITIES.assignedClinicsOnly, label: 'My Clinics' }],
      to: '/clinics',
      icon: 'clinics',
      placement: 'primary',
      order: 20,
    },
  ],
  clinicSections: [
    { id: 'overview', label: 'Overview', path: '', order: 10 },
    {
      id: 'digital-information',
      label: 'Digital Information',
      path: 'digital-information',
      order: 20,
    },
  ],
};
