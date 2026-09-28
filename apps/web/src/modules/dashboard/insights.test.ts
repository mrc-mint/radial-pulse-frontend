import type { Schema } from '@radial-pulse/shared-types';
import { describe, expect, it } from 'vitest';
import { addedThisMonth, clinicActivity, websiteShare } from './insights';

const clinic = (over: Partial<Schema<'ClinicListItem'>>) =>
  ({
    id: 'c1',
    name: 'Smile Dental Care',
    stage: 'prospective_client',
    created_at: '2026-09-01T10:00:00Z',
    stage_changed_at: '2026-09-01T10:00:00Z',
    website_url: null,
    ...over,
  }) as Schema<'ClinicListItem'>;

describe('clinicActivity', () => {
  it('lists additions and later stage moves, newest first', () => {
    const events = clinicActivity([
      clinic({ id: 'a', name: 'A' }),
      clinic({
        id: 'b',
        name: 'B',
        stage: 'active_client',
        created_at: '2026-08-01T10:00:00Z',
        stage_changed_at: '2026-09-20T10:00:00Z',
      }),
    ]);
    expect(events.map((e) => e.text)).toEqual(['B moved to Active', 'A added', 'B added']);
  });

  it('does not report the starting stage as a move', () => {
    expect(clinicActivity([clinic({})]).map((e) => e.kind)).toEqual(['added']);
  });
});

describe('addedThisMonth', () => {
  it('counts clinics created in the viewer’s current month', () => {
    const now = new Date(2026, 8, 28);
    expect(
      addedThisMonth(
        [
          clinic({ created_at: new Date(2026, 8, 3).toISOString() }),
          clinic({ created_at: new Date(2026, 7, 30).toISOString() }),
        ],
        now,
      ),
    ).toBe(1);
  });
});

describe('websiteShare', () => {
  it('is null unless every clinic of the list is loaded', () => {
    const rows = [clinic({ website_url: 'https://a.in' }), clinic({})];
    expect(websiteShare(rows, 2)).toEqual({ withWebsite: 1, total: 2, percent: 50 });
    expect(websiteShare(rows, 250)).toBeNull();
    expect(websiteShare([], 0)).toBeNull();
  });
});
