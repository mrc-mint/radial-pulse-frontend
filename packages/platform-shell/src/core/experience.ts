import type { PlatformRole } from '@radial-pulse/shared-types';
import type { Session } from './session';

/**
 * Which product experience a session belongs to (docs/scope-v1.md).
 *
 *   internal-web                 Platform Administrator, Digital Success Manager
 *   clinic-administrator-mobile  a clinic account that administers ≥1 clinic
 *   unsupported                  any other clinic account (no V1 experience)
 *
 * This is the one place that reads role values to pick an app; inside an app,
 * screens and actions are gated by permissions (`useCan`, `useClinicCan`).
 */
export type ProductExperience = 'internal-web' | 'clinic-administrator-mobile' | 'unsupported';

const EXPERIENCE_BY_PLATFORM_ROLE: Readonly<Record<PlatformRole, 'internal-web' | 'clinic'>> = {
  platform_administrator: 'internal-web',
  digital_success_manager: 'internal-web',
  clinic_user: 'clinic',
};

/** Ids of the clinics this session administers (contract clinic role `clinic_administrator`). */
export function clinicAdministratorClinicIds(session: Session): string[] {
  return [...session.clinicAccess]
    .filter(([, access]) => access.clinicRole === 'clinic_administrator')
    .map(([clinicId]) => clinicId);
}

export function productExperience(session: Session): ProductExperience {
  if (EXPERIENCE_BY_PLATFORM_ROLE[session.user.platformRole] === 'internal-web') {
    return 'internal-web';
  }
  return clinicAdministratorClinicIds(session).length > 0
    ? 'clinic-administrator-mobile'
    : 'unsupported';
}
