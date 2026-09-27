import type { RoleName } from '@radial-pulse/shared-types';

/**
 * Approved display names (docs/glossary.md). Display only: navigation and
 * permissions use capabilities, never role names.
 */
export const ROLE_LABELS: Readonly<Record<RoleName, string>> = {
  PLATFORM_ADMINISTRATOR: 'Platform Administrator',
  DIGITAL_SUCCESS_MANAGER: 'Digital Success Manager',
  CLINIC_ADMINISTRATOR: 'Clinic Administrator',
  CLINIC_TEAM_MEMBER: 'Clinic Team Member',
};

/** Label for the user's first role, e.g. under their name in the sidebar. */
export function roleLabel(roles: ReadonlyArray<RoleName>): string | null {
  const first = roles[0];
  return first ? ROLE_LABELS[first] : null;
}
