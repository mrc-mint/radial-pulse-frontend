import { describe, expect, it } from 'vitest';
import type { ModuleManifest } from './manifest';
import {
  hasClinicPermission,
  isRouteActive,
  resolveClinicSections,
  resolveNavigation,
} from './navigation';

// Permission values are the contract's (`Permission` enum).
const modules: ModuleManifest[] = [
  {
    id: 'users',
    navEntries: [
      {
        id: 'users',
        label: 'Users',
        to: '/users',
        icon: 'users',
        requiredCapability: 'users:read',
        placement: 'primary',
        order: 30,
      },
    ],
  },
  {
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
      {
        id: 'overview',
        label: 'Overview',
        path: '',
        order: 10,
        requiredPermission: 'clinics:read',
      },
      {
        id: 'audit',
        label: 'Digital Presence Assessment',
        path: 'audit',
        order: 30,
        requiredPermission: 'assessments:read',
      },
    ],
  },
  {
    id: 'dashboard',
    navEntries: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        to: '/dashboard',
        icon: 'dashboard',
        placement: 'primary',
        order: 10,
      },
    ],
  },
  {
    id: 'chat',
    clinicSections: [
      {
        id: 'chat',
        label: 'Client Collaboration',
        path: 'chat',
        order: 50,
        requiredPermission: 'chat:read',
      },
    ],
  },
];

describe('resolveNavigation', () => {
  it('uses the scoped label and hides entries without the platform permission', () => {
    const nav = resolveNavigation(modules, new Set(['clinics:create']), { allClinics: false });
    expect(nav.map((n) => n.label)).toEqual(['Dashboard', 'My Client Portfolio']);
  });

  it('shows permission-gated entries and the full label for all-clinics users', () => {
    const nav = resolveNavigation(modules, new Set(['users:read']), { allClinics: true });
    expect(nav.map((n) => n.label)).toEqual(['Dashboard', 'Client Organizations', 'Users']);
  });

  it('carries the icon name through', () => {
    expect(resolveNavigation(modules, new Set(), { allClinics: true })[0]?.icon).toBe('dashboard');
  });
});

describe('resolveClinicSections', () => {
  it('filters sections by the permissions inside that clinic', () => {
    const sections = resolveClinicSections(
      modules,
      new Set(['clinics:read', 'chat:read']),
      'clinic_42',
    );
    expect(sections).toEqual([
      { id: 'overview', label: 'Overview', to: '/clinics/clinic_42', exact: true },
      { id: 'chat', label: 'Client Collaboration', to: '/clinics/clinic_42/chat', exact: false },
    ]);
  });

  it('shows every section when the API reports no per-clinic permissions', () => {
    const sections = resolveClinicSections(modules, 'unrestricted', 'clinic_42');
    expect(sections.map((s) => s.id)).toEqual(['overview', 'audit', 'chat']);
  });

  it('shows nothing for a clinic the user cannot access', () => {
    expect(resolveClinicSections(modules, new Set(), 'clinic_42')).toEqual([]);
  });

  it('encodes the clinicId', () => {
    const [overview] = resolveClinicSections(modules, 'unrestricted', 'a/b');
    expect(overview?.to).toBe('/clinics/a%2Fb');
  });
});

describe('hasClinicPermission', () => {
  it('checks the clinic set, and allows everything when unrestricted', () => {
    expect(hasClinicPermission(new Set(['chat:read']), 'chat:read')).toBe(true);
    expect(hasClinicPermission(new Set(['chat:read']), 'chat:write')).toBe(false);
    expect(hasClinicPermission('unrestricted', 'chat:write')).toBe(true);
    expect(hasClinicPermission(new Set(), undefined)).toBe(true);
  });
});

describe('isRouteActive', () => {
  it('matches the route and its descendants', () => {
    expect(isRouteActive('/clinics', '/clinics')).toBe(true);
    expect(isRouteActive('/clinics', '/clinics/c_1/audit')).toBe(true);
    expect(isRouteActive('/clinics', '/clinics/')).toBe(true);
  });

  it('never matches a sibling that shares a prefix', () => {
    expect(isRouteActive('/clinics', '/clinics-archive')).toBe(false);
  });

  it('honours exact matching for landing sections', () => {
    expect(isRouteActive('/clinics/c_1', '/clinics/c_1', true)).toBe(true);
    expect(isRouteActive('/clinics/c_1', '/clinics/c_1/chat', true)).toBe(false);
  });
});
