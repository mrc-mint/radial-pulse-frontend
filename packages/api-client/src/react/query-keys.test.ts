import { describe, expect, it } from 'vitest';
import { clinicQueryKey } from './query-keys';

describe('clinicQueryKey', () => {
  it('always places the clinicId in the key', () => {
    expect(clinicQueryKey('clinic_1', 'assessment', 'latest')).toEqual([
      'radial-pulse',
      'clinic',
      'clinic_1',
      'assessment',
      'latest',
    ]);
  });

  it('gives different clinics different keys for the same resource', () => {
    expect(clinicQueryKey('a', 'chat')).not.toEqual(clinicQueryKey('b', 'chat'));
  });

  it('rejects a missing clinicId', () => {
    expect(() => clinicQueryKey('')).toThrow(/clinicId/);
  });
});
