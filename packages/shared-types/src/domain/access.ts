import type { components } from '../contract';

/**
 * Access vocabulary, straight from the API contract (`GET /api/v1/auth/me`).
 *
 * Permissions are two-level (backend RBAC): `MeResponse.permissions` holds
 * platform-level permissions; each `ClinicAccess` carries the permissions for
 * that clinic. The frontend uses them for navigation and affordances only —
 * the backend (Cognito + FastAPI + RLS) remains the security boundary.
 */
type S = components['schemas'];

export type Permission = S['Permission'];
/** The shell's name for a permission it can gate UI on. */
export type Capability = Permission;
export type PlatformRole = S['PlatformRole'];
export type ClinicRole = S['ClinicRole'];
export type MeResponse = S['MeResponse'];
export type ClinicAccess = S['ClinicAccess'];
