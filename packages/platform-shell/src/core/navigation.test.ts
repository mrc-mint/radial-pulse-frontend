import { describe, expect, it } from 'vitest';
import type { ModuleManifest } from './manifest';
import { resolveNavigation } from './navigation';

// Capability strings here are test fixtures; real values come from GET /me.
const modules: ModuleManifest[] = [
  {
    id: 'users',
    navEntries: [{ id: 'users', label: 'Users', to: '/users', requiredCapability: 'users.manage', placement: 'primary', order: 30 }],
  },
  {
    id: 'clinics',
    navEntries: [
      {
        id: 'clinics',
        label: 'Clinics',
        labelWhen: [{ capability: 'clinics.assigned_only', label: 'My Clinics' }],
        to: '/clinics',
        placement: 'primary',
        order: 20,
      },
    ],
  },
  {
    id: 'dashboard',
    navEntries: [{ id: 'dashboard', label: 'Dashboard', to: '/dashboard', placement: 'primary', order: 10 }],
  },
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
});
