import type { Schema } from '@radial-pulse/shared-types';
import { describe, expect, it } from 'vitest';
import { MEDIA_REVIEW_LABELS, mediaReviewLabel } from './labels';
import {
  approvalForResource,
  buildMediaBoard,
  CLINIC_PHOTO_CATEGORIES,
  currentAssets,
  DOCTOR_PHOTO_ANGLES,
  DOCTOR_PHOTO_OUTFITS,
  mediaReviewDecisions,
  mediaSlotOf,
} from './media';

let n = 0;
function asset(overrides: Partial<Schema<'AssetRead'>> = {}): Schema<'AssetRead'> {
  n += 1;
  return {
    id: `asset-${n}`,
    clinic_id: 'clinic-1',
    owner_user_id: 'user-1',
    kind: 'clinic_photo',
    mime_type: 'image/jpeg',
    size_bytes: 1000,
    original_filename: `photo-${n}.jpg`,
    version: 1,
    previous_version_id: null,
    provenance: {},
    status: 'uploaded',
    approval_state: 'submitted',
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
    ...overrides,
  };
}

describe('media board layout (product reference)', () => {
  it('has five doctor angles in shooting order and two outfit options', () => {
    expect(DOCTOR_PHOTO_ANGLES.map((a) => a.label)).toEqual([
      '90° L',
      '45° L',
      '0°',
      '45° R',
      '90° R',
    ]);
    expect(DOCTOR_PHOTO_OUTFITS.map((o) => o.label)).toEqual(['With apron', 'Without apron']);
  });

  it('has the six hospital photo categories in order with their targets', () => {
    expect(CLINIC_PHOTO_CATEGORIES.map((c) => [c.title, c.target])).toEqual([
      ['Exterior & signage', 3],
      ['Reception & waiting', 3],
      ['Consult & procedure rooms', 3],
      ['Equipment & facilities', 3],
      ['Team at work', 3],
      ['Logo & cover photo', 2],
    ]);
  });
});

describe('buildMediaBoard', () => {
  it('places only what the contract can place: the logo and the cover photo', () => {
    const cover = asset({ kind: 'clinic_photo' });
    const logo = asset({ kind: 'logo' });
    const room = asset({ kind: 'clinic_photo' });
    const doctor = asset({ kind: 'practitioner_photo' });
    const voice = asset({ kind: 'audio', mime_type: 'audio/wav' });
    const board = buildMediaBoard([cover, logo, room, doctor, voice], { coverAssetId: cover.id });

    expect(mediaSlotOf(doctor, { coverAssetId: cover.id })).toBeNull();
    expect(board.logo).toBe(logo);
    expect(board.cover).toBe(cover);
    expect(board.clinic.find((c) => c.id === 'logo_cover')!.assets).toEqual([logo, cover]);
    expect(board.clinicUnplaced).toEqual([room]);
    expect(board.doctorUnplaced).toEqual([doctor]);
    expect(board.voice).toEqual([voice]);
  });

  it('lays out one empty outfit of five angles per apron option, more on request', () => {
    const board = buildMediaBoard([], { coverAssetId: null }, { with_apron: 2 });
    expect(board.doctor.with_apron).toHaveLength(2);
    expect(board.doctor.without_apron).toHaveLength(1);
    expect(board.doctor.with_apron[0]!.slots.map((s) => s.asset)).toEqual([
      null,
      null,
      null,
      null,
      null,
    ]);
    expect(board.doctor.with_apron[0]!.uploaded).toBe(0);
  });

  it('shows only the newest uploaded version of each file', () => {
    const v1 = asset({ kind: 'audio' });
    const v2 = asset({ kind: 'audio', previous_version_id: v1.id, version: 2 });
    const pending = asset({ kind: 'audio', status: 'pending_upload' });
    const deleted = asset({ kind: 'audio', status: 'deleted' });
    expect(currentAssets([v1, v2, pending, deleted])).toEqual([v2]);
  });
});

describe('review', () => {
  it('offers decisions only for a file awaiting review, to someone who may decide', () => {
    expect(mediaReviewDecisions('submitted', true)).toEqual(['approve', 'redo', 'reject']);
    expect(mediaReviewDecisions('submitted', false)).toEqual([]);
    for (const state of ['draft', 'approved', 'rejected', 'redo_requested'] as const) {
      expect(mediaReviewDecisions(state, true)).toEqual([]);
    }
  });

  it('labels every review state, and asks for a re-record for voice samples', () => {
    expect(Object.keys(MEDIA_REVIEW_LABELS).sort()).toEqual([
      'approved',
      'draft',
      'redo_requested',
      'rejected',
      'submitted',
    ]);
    expect(mediaReviewLabel('redo_requested', 'practitioner_photo')).toBe('Needs retake');
    expect(mediaReviewLabel('redo_requested', 'audio')).toBe('Needs re-record');
    expect(mediaReviewLabel('approved', 'audio')).toBe('Verified');
  });

  it('finds the newest approval for a file by its id', () => {
    const base = {
      clinic_id: 'clinic-1',
      resource_type: 'asset',
      publication_state: 'unpublished' as const,
      submitted_by_user_id: null,
      decided_by_user_id: null,
      assignee_user_id: null,
      last_comment: null,
      created_at: '2026-09-01T00:00:00Z',
    };
    const old = {
      ...base,
      id: 'a1',
      resource_id: 'x',
      state: 'rejected' as const,
      updated_at: '2026-09-01T00:00:00Z',
    };
    const latest = {
      ...base,
      id: 'a2',
      resource_id: 'x',
      state: 'submitted' as const,
      updated_at: '2026-09-02T00:00:00Z',
    };
    const other = {
      ...base,
      id: 'a3',
      resource_id: 'y',
      state: 'approved' as const,
      updated_at: '2026-09-03T00:00:00Z',
    };
    expect(approvalForResource([old, latest, other], 'x')).toBe(latest);
    expect(approvalForResource([other], 'x')).toBeNull();
  });
});
