import { describe, expect, it } from 'vitest';
import type { ModuleManifest } from './manifest';
import { isRouteActive, resolveClinicSections, resolveNavigation } from './navigation';

// Capability strings here are test fixtures; real values come from GET /me.
const modules: ModuleManifest[] = [
  {
    id: 'users',
    navEntries: [
      {
        id: 'users',
        label: 'Users',
        to: '/users',
        icon: 'users',
        requiredCapability: 'users.manage',
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
        label: 'Clinics',
        labelWhen: [{ capability: 'clinics.assigned_only', label: 'My Clinics' }],
        to: '/clinics',
        icon: 'clinics',
        placement: 'primary',
        order: 20,
      },
    ],
    clinicSections: [
      { id: 'overview', label: 'Overview', path: '', order: 10 },
      { id: 'internal', label: 'Internal', path: 'internal', order: 5, requiredCapability: 'x' },
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
  { id: 'chat', clinicSections: [{ id: 'chat', label: 'Chat', path: 'chat', order: 50 }] },
];

describe('resolveNavigation', () => {
  it('hides entries whose capability the user lacks, in order', () => {
    const nav = resolveNavigation(modules, new Set(['clinics.assigned_only']));
    expect(nav.map((n) => n.label)).toEqual(['Dashboard', 'My Clinics']);
  });

  it('shows capability-gated entries when held', () => {
    const nav = resolveNavigation(modules, new Set(['users.manage']));
    expect(nav.map((n) => n.label)).toEqual(['Dashboard', 'Clinics', 'Users']);
  });

  it('carries the icon name through', () => {
    expect(resolveNavigation(modules, new Set())[0]?.icon).toBe('dashboard');
  });
});

describe('resolveClinicSections', () => {
  it('builds clinic-scoped URLs in order and filters by capability', () => {
    const sections = resolveClinicSections(modules, new Set(), 'clinic_42');
    expect(sections).toEqual([
      { id: 'overview', label: 'Overview', to: '/clinics/clinic_42', exact: true },
      { id: 'chat', label: 'Chat', to: '/clinics/clinic_42/chat', exact: false },
    ]);
  });

  it('encodes the clinicId', () => {
    const [overview] = resolveClinicSections(modules, new Set(), 'a/b');
    expect(overview?.to).toBe('/clinics/a%2Fb');
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
