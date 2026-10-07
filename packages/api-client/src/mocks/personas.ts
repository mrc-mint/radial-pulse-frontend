import type { Permission, Schema } from '@radial-pulse/shared-types';

/**
 * DEV/TEST ONLY. Mock sign-in personas for building the UI against MSW
 * (only with API mocking; real sign-in is Cognito Managed Login). A persona's token is `dev-persona:<id>`; the mock
 * `/auth/me` returns the matching contract `MeResponse`.
 *
 * Permission sets mirror the backend's RBAC table (radial-pulse-backend
 * app/core/rbac.py, v0.1.0), so the UI is exercised with realistic access.
 */
export const MOCK_TOKEN_PREFIX = 'dev-persona:';

export const PERSONA_IDS = [
  'platform-administrator',
  'digital-success-manager',
  'clinic-administrator',
] as const;
export type PersonaId = (typeof PERSONA_IDS)[number];

export const PLATFORM_ADMIN_GLOBAL: Permission[] = [
  'clinics:create',
  'users:read',
  'users:manage',
  'assignments:manage',
  'settings:manage',
];

export const DSM_GLOBAL: Permission[] = ['clinics:create'];

export const DSM_CLINIC: Permission[] = [
  'clinics:read',
  'clinics:write',
  'clinics:manage',
  'team:manage',
  'practitioners:read',
  'practitioners:write',
  'profile:read',
  'profile:write',
  'presence:read',
  'presence:write',
  'assets:read',
  'assets:upload',
  'assessments:read',
  'assessments:request',
  'reports:read',
  'reports:write',
  'approvals:submit',
  'approvals:decide',
  'approvals:publish',
  'work_items:read',
  'work_items:write',
  'snapshots:read',
  'snapshots:write',
  'audit_log:read',
  'chat:read',
  'chat:write',
  'connections:read',
  'connections:manage',
  'media:review',
];

/**
 * V1 rule: Clinic Administrators upload clinic media (`media:upload`) but
 * never review it: no `media:review` and no `approvals:*` permission.
 */
export const CLINIC_ADMIN_CLINIC: Permission[] = [
  'clinics:read',
  'clinics:write',
  'team:manage',
  'practitioners:read',
  'practitioners:write',
  'profile:read',
  'profile:write',
  'presence:read',
  'presence:write',
  'assets:read',
  'assets:upload',
  'assessments:read',
  'reports:read',
  'work_items:read',
  'snapshots:read',
  'audit_log:read',
  'chat:read',
  'chat:write',
  'connections:read',
  'connections:manage',
  'media:upload',
];

export interface MockPersona {
  id: PersonaId;
  label: string;
  description: string;
  userId: string;
}

export const MOCK_PERSONAS: ReadonlyArray<MockPersona> = [
  {
    id: 'platform-administrator',
    label: 'Platform Administrator',
    description: 'Rohan Agarwal — all client organizations, users and settings.',
    userId: 'a1000000-0000-4000-8000-000000000001',
  },
  {
    id: 'digital-success-manager',
    label: 'Digital Success Manager',
    description: 'Priya Shah — her client portfolio, its reviews and client collaboration.',
    userId: 'a1000000-0000-4000-8000-000000000002',
  },
  {
    id: 'clinic-administrator',
    label: 'Clinic Administrator',
    description: 'Dr. Rahul Mehta — two clinics (mobile app persona).',
    userId: 'a1000000-0000-4000-8000-000000000101',
  },
];

export function personaFromToken(authorization: string | null): MockPersona | null {
  const token = authorization?.replace(/^Bearer\s+/i, '') ?? '';
  if (!token.startsWith(MOCK_TOKEN_PREFIX)) return null;
  const id = token.slice(MOCK_TOKEN_PREFIX.length);
  return MOCK_PERSONAS.find((p) => p.id === id) ?? null;
}

export type MeResponse = Schema<'MeResponse'>;
