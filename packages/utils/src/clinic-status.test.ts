import { describe, expect, it } from 'vitest';
import { CLINIC_STATUS_OF_STAGE, CLINIC_STATUS_STAGES, clinicStatus } from './clinic-status';

describe('clinicStatus', () => {
  it('groups contract stages the way the backend dashboard does', () => {
    expect(clinicStatus({ stage: 'profile_enriched', is_active: true })).toBe('prospect');
    expect(clinicStatus({ stage: 'client_discussion', is_active: true })).toBe('in_progress');
    expect(clinicStatus({ stage: 'active_client', is_active: true })).toBe('active');
  });

  it('shows archived clinics as inactive whatever their stage', () => {
    expect(clinicStatus({ stage: 'active_client', is_active: false })).toBe('inactive');
  });

  it('filters by exactly the stages of each group', () => {
    for (const [status, stages] of Object.entries(CLINIC_STATUS_STAGES)) {
      for (const stage of stages) expect(CLINIC_STATUS_OF_STAGE[stage]).toBe(status);
    }
    const all = Object.values(CLINIC_STATUS_STAGES).flat().sort();
    expect(all).toEqual(Object.keys(CLINIC_STATUS_OF_STAGE).sort());
  });
});
