import type { Schema } from '@radial-pulse/shared-types';
import { describe, expect, it } from 'vitest';
import { clinicsNeedingAttention } from './attention';

const clinic = (id: string, openWork = 0, updated = '2026-09-01T00:00:00Z') =>
  ({
    id,
    name: id,
    updated_at: updated,
    open_work: openWork ? [{ area: 'website', open_count: openWork }] : [],
  }) as unknown as Schema<'ClinicListItem'>;

describe('clinicsNeedingAttention', () => {
  it('lists what is waiting per clinic, newest first, and skips quiet clinics', () => {
    const items = clinicsNeedingAttention([
      { clinic: clinic('quiet') },
      {
        clinic: clinic('a', 2),
        assessments: [
          {
            approval_state: 'submitted',
            created_at: '2026-09-20T00:00:00Z',
            completed_at: '2026-09-21T00:00:00Z',
          } as Schema<'AssessmentRead'>,
        ],
      },
      {
        clinic: clinic('b'),
        thread: {
          unread_count: 1,
          last_message: { sender_side: 'clinic', created_at: '2026-09-25T00:00:00Z' },
        } as Schema<'ChatThread'>,
        profiles: [
          { verification: 'unverified', created_at: '2026-09-02T00:00:00Z' },
          { verification: 'confirmed', created_at: '2026-09-03T00:00:00Z' },
        ] as Array<Schema<'PresenceProfileRead'>>,
      },
    ]);
    expect(items.map((i) => [i.clinic.id, i.reasons])).toEqual([
      ['b', ['Client replied in chat', '1 profile to review']],
      ['a', ['Audit ready for review', '2 open improvement work items']],
    ]);
    expect(items[0]!.at).toBe('2026-09-25T00:00:00Z');
  });
});
