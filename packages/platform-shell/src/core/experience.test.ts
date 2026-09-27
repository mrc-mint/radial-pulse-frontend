import type { MeResponse } from '@radial-pulse/shared-types';
import { describe, expect, it } from 'vitest';
import { clinicAdministratorClinicIds, productExperience } from './experience';
import { sessionFromMe } from './session';

const base: MeResponse = {
  id: '7d9a2c4e-1f3b-4a5c-8d6e-2b1c0a9f8e71',
  email: 'person@example.com',
  full_name: 'Person',
  platform_role: 'clinic_user',
  permissions: [],
  all_clinics: false,
  sign_in_method: 'google',
  clinics: [],
};
const clinic = (id: string, role: MeResponse['clinics'][number]['clinic_role']) => ({
  clinic_id: id,
  clinic_role: role,
  permissions: ['clinics:read' as const],
});

describe('productExperience', () => {
  it('sends Platform Administrators and Digital Success Managers to the web portal', () => {
    for (const platform_role of ['platform_administrator', 'digital_success_manager'] as const) {
      expect(productExperience(sessionFromMe({ ...base, platform_role }))).toBe('internal-web');
    }
  });

  it('sends clinic accounts that administer a clinic to the mobile app', () => {
    const session = sessionFromMe({
      ...base,
      clinics: [clinic('c1', 'clinic_team_member'), clinic('c2', 'clinic_administrator')],
    });
    expect(productExperience(session)).toBe('clinic-administrator-mobile');
    expect(clinicAdministratorClinicIds(session)).toEqual(['c2']);
  });

  it('has no V1 experience for other clinic accounts', () => {
    const session = sessionFromMe({ ...base, clinics: [clinic('c1', 'clinic_team_member')] });
    expect(productExperience(session)).toBe('unsupported');
    expect(productExperience(sessionFromMe(base))).toBe('unsupported');
  });
});
