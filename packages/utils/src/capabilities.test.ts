import { describe, expect, it } from 'vitest';
import { can } from './capabilities';

describe('can', () => {
  const caps = new Set(['users:manage'] as const);
  it('allows entries with no required capability', () => expect(can(caps, undefined)).toBe(true));
  it('allows a held capability', () => expect(can(caps, 'users:manage')).toBe(true));
  it('denies a missing capability', () => expect(can(caps, 'approvals:publish')).toBe(false));
});
