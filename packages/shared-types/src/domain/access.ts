/**
 * Access vocabulary used by the platform shell.
 *
 * Capabilities come from `GET /me` (decision 5d). The frontend uses them for
 * navigation and UI affordances only; the backend (Cognito + FastAPI + RLS)
 * remains the security boundary.
 *
 * Capability and role values are owned by the backend contract, so they are
 * plain strings here rather than a frontend-invented union.
 */
export type Capability = string;

/** Approved product roles (spec §4). Wire values follow the backend enum. */
export type RoleName =
  | 'PLATFORM_ADMINISTRATOR'
  | 'DIGITAL_SUCCESS_MANAGER'
  | 'CLINIC_ADMINISTRATOR'
  | 'CLINIC_TEAM_MEMBER';
