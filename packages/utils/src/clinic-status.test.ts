import { describe, expect, it } from 'vitest';
import { CLINIC_STATUS_GROUP, CLINIC_STATUS_OF_GROUP, clinicStatus } from './clinic-status';

describe('clinicStatus', () => {
  it('shows the API stage group', () => {
    expect(clinicStatus({ stage_group: 'prospects', is_active: true })).toBe('prospect');
    expect(clinicStatus({ stage_group: 'in_progress', is_active: true })).toBe('in_progress');
    expect(clinicStatus({ stage_group: 'active', is_active: true })).toBe('active');
  });

  it('shows archived clinics as inactive whatever their group', () => {
    expect(clinicStatus({ stage_group: 'active', is_active: false })).toBe('inactive');
  });

  it('filters each status by its own group', () => {
    for (const [status, group] of Object.entries(CLINIC_STATUS_GROUP)) {
      expect(CLINIC_STATUS_OF_GROUP[group]).toBe(status);
    }
  });
});
