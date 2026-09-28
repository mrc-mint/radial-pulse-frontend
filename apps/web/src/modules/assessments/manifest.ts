import type { ModuleManifest } from '@radial-pulse/platform-shell/core';

/**
 * The one unified assessment ("Audit Report" / "Unified Audit" in the UI).
 * No per-audit-type navigation (docs/scope-v1.md).
 */
export const assessmentsModule: ModuleManifest = {
  id: 'assessments',
  navEntries: [
    {
      id: 'audit-reports',
      label: 'Audit Reports',
      to: '/audit-reports',
      icon: 'reports',
      placement: 'primary',
      order: 40,
    },
  ],
  clinicSections: [
    {
      id: 'audit',
      label: 'Audit Report',
      path: 'audit',
      order: 50,
      requiredPermission: 'assessments:read',
    },
  ],
};
