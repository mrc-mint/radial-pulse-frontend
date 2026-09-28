import { describe, expect, it } from 'vitest';
import { clinicsAtMonthEnd } from './growth';

describe('clinicsAtMonthEnd', () => {
  it('works back from the current total through each month’s additions', () => {
    const months = [
      { month: '2026-07', count: 2 },
      { month: '2026-08', count: 3 },
      { month: '2026-09', count: 1 },
    ];
    expect(clinicsAtMonthEnd(12, months)).toEqual([
      { month: '2026-07', count: 8 },
      { month: '2026-08', count: 11 },
      { month: '2026-09', count: 12 },
    ]);
  });

  it('never goes below zero', () => {
    expect(
      clinicsAtMonthEnd(1, [
        { month: '2026-08', count: 5 },
        { month: '2026-09', count: 3 },
      ]),
    ).toEqual([
      { month: '2026-08', count: 0 },
      { month: '2026-09', count: 1 },
    ]);
  });
});
