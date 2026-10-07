import type { Schema } from '@radial-pulse/shared-types';
import { describe, expect, it } from 'vitest';
import { MEDIA_REVIEW_LABELS, mediaReviewLabel } from './labels';
import {
  buildMediaBoard,
  currentAssets,
  mediaActions,
  mediaLabels,
  type MediaLabel,
} from './media';

const label = (
  dimension: MediaLabel['dimension'],
  code: string,
  sort_order: number,
): MediaLabel => ({
  dimension,
  code,
  label: code.replace(/_/g, ' '),
  sort_order,
});

// Deliberately out of order: the board follows sort_order.
const TAXONOMY: MediaLabel[] = [
  label('practitioner_angle', 'front', 30),
  label('practitioner_angle', 'left_90', 10),
  label('practitioner_angle', 'left_45', 20),
  label('practitioner_apron', 'without_apron', 20),
  label('practitioner_apron', 'with_apron', 10),
  label('practitioner_outfit', 'outfit_1', 10),
  label('practitioner_outfit', 'outfit_2', 20),
  label('clinic_photo_category', 'reception_waiting', 20),
  label('clinic_photo_category', 'exterior_signage', 10),
  label('voice_sample', 'reading_sample', 20),
  label('voice_sample', 'clinic_greeting', 10),
];
const LABELS = mediaLabels(TAXONOMY);

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
    created_at: `2026-09-${String(n).padStart(2, '0')}T00:00:00Z`,
    updated_at: '2026-09-01T00:00:00Z',
    ...overrides,
  };
}

describe('mediaLabels', () => {
  it('groups the taxonomy by dimension in display order', () => {
    expect(LABELS.angles.map((a) => a.code)).toEqual(['left_90', 'left_45', 'front']);
    expect(LABELS.aprons.map((a) => a.code)).toEqual(['with_apron', 'without_apron']);
    expect(LABELS.categories.map((c) => c.code)).toEqual(['exterior_signage', 'reception_waiting']);
    expect(LABELS.voiceSamples.map((v) => v.code)).toEqual(['clinic_greeting', 'reading_sample']);
  });
});

describe('buildMediaBoard', () => {
  it('places practitioner photos by apron, outfit and angle', () => {
    const front = asset({
      kind: 'practitioner_photo',
      apron: 'with_apron',
      outfit: 'outfit_2',
      angle: 'front',
    });
    const board = buildMediaBoard([front], LABELS, { coverAssetId: null });
    const withApron = board.practitioner[0]!;
    expect(withApron.apron.code).toBe('with_apron');
    // Outfit 2 holds a photo, so both outfits are laid out.
    expect(withApron.outfits.map((o) => o.outfit.code)).toEqual(['outfit_1', 'outfit_2']);
    expect(withApron.outfits[1]!.slots.map((s) => s.asset)).toEqual([null, null, front]);
    expect(withApron.hasMoreOutfits).toBe(false);
    expect(board.practitioner[1]!.outfits).toHaveLength(1);
  });

  it('lays out more outfits on request, up to the taxonomy', () => {
    const board = buildMediaBoard([], LABELS, { coverAssetId: null }, { without_apron: 5 });
    expect(board.practitioner[1]!.outfits).toHaveLength(2);
  });

  it('keeps photos with missing or unknown labels visible as unplaced', () => {
    const noLabels = asset({ kind: 'practitioner_photo' });
    const unknown = asset({ kind: 'clinic_photo', category: 'rooftop' });
    const board = buildMediaBoard([noLabels, unknown], LABELS, { coverAssetId: null });
    expect(board.practitionerUnplaced).toEqual([noLabels]);
    expect(board.clinicUnplaced).toEqual([unknown]);
  });

  it('puts clinic photos in their category, the logo and the cover photo in their row', () => {
    const entrance = asset({ category: 'exterior_signage' });
    const cover = asset({ category: 'reception_waiting' });
    const logo = asset({ kind: 'logo' });
    const board = buildMediaBoard([entrance, cover, logo], LABELS, { coverAssetId: cover.id });
    expect(board.clinic.map((c) => c.assets)).toEqual([[entrance], []]);
    expect(board.cover).toBe(cover);
    expect(board.logo).toBe(logo);
  });

  it('names voice samples by type, numbering repeats, newest first', () => {
    const greeting = asset({ kind: 'audio', category: 'clinic_greeting' });
    const first = asset({ kind: 'audio', category: 'reading_sample' });
    const second = asset({ kind: 'audio', category: 'reading_sample' });
    const board = buildMediaBoard([greeting, first, second], LABELS, { coverAssetId: null });
    expect(board.voice.map((v) => v.title)).toEqual([
      'reading sample 2',
      'reading sample 1',
      'clinic greeting',
    ]);
  });

  it('shows only the newest uploaded version of each file', () => {
    const v1 = asset({ kind: 'audio' });
    const v2 = asset({ kind: 'audio', previous_version_id: v1.id, version: 2 });
    const pending = asset({ kind: 'audio', status: 'pending_upload' });
    expect(currentAssets([v1, v2, pending])).toEqual([v2]);
  });
});

describe('review', () => {
  it('offers exactly the actions the API allows', () => {
    const review: Schema<'AssetReview'> = {
      approval_id: 'ap-1',
      state: 'submitted',
      clinic_message: null,
      internal_note: null,
      submitted_by_user_id: null,
      decided_by_user_id: null,
      available_actions: ['approve', 'redo'],
      updated_at: '2026-09-01T00:00:00Z',
    };
    expect(mediaActions(asset({ review }))).toEqual(['approve', 'redo']);
    expect(mediaActions(asset({ review: null }))).toEqual([]);
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
  });
});
