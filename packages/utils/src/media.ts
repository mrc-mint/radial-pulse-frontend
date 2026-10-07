import type { Schema } from '@radial-pulse/shared-types';

/**
 * Clinic media (practitioner photos, hospital photos, voice samples): pure rules
 * both apps share. The labels (photo categories, apron options, angles,
 * outfits, voice-sample types) come from `GET /media/taxonomy` and are never
 * hard-coded; files carry those codes (`category`, `apron`, `angle`, `outfit`).
 */

type Asset = Schema<'AssetRead'>;
type ApprovalState = Schema<'ApprovalState'>;
export type MediaLabel = Schema<'MediaTaxonomyValueRead'>;

/** File kinds shown on the Media board. */
export const MEDIA_ASSET_KINDS = [
  'practitioner_photo',
  'clinic_photo',
  'logo',
  'audio',
] as const satisfies ReadonlyArray<Schema<'AssetKind'>>;

export type MediaAssetKind = (typeof MEDIA_ASSET_KINDS)[number];

/** Target photos per hospital photo category (product reference). */
export const CLINIC_PHOTO_TARGET = 3;

/** The "Logo & cover photo" row: the clinic's logo file and its cover photo. */
export const LOGO_COVER_ROW = {
  title: 'Logo & cover photo',
  hint: 'Square logo plus one wide hero shot',
  target: 2,
} as const;

/**
 * Optional helper text for known category codes. The taxonomy has labels but
 * no descriptions; a category without an entry here simply shows no hint.
 */
export const CLINIC_PHOTO_HINTS: Readonly<Record<string, string>> = {
  exterior_signage: 'Building front, board and street view',
  reception_waiting: 'Front desk and seating, lights on',
  consult_procedure_rooms: 'Tidy and empty, no patients in frame',
  equipment_facilities: 'Lasers, pharmacy, parking, ramp',
  team_at_work: 'Shown next to your Google reviews',
};

export interface MediaLabels {
  categories: MediaLabel[];
  aprons: MediaLabel[];
  angles: MediaLabel[];
  outfits: MediaLabel[];
  voiceSamples: MediaLabel[];
}

/** The taxonomy grouped by dimension, each in display order. */
export function mediaLabels(taxonomy: ReadonlyArray<MediaLabel>): MediaLabels {
  const of = (dimension: MediaLabel['dimension']) =>
    taxonomy.filter((v) => v.dimension === dimension).sort((a, b) => a.sort_order - b.sort_order);
  return {
    categories: of('clinic_photo_category'),
    aprons: of('practitioner_apron'),
    angles: of('practitioner_angle'),
    outfits: of('practitioner_outfit'),
    voiceSamples: of('voice_sample'),
  };
}

/**
 * Files to show: uploaded (not pending, failed or deleted) and not replaced
 * by a newer version that is also in the list.
 */
export function currentAssets(assets: ReadonlyArray<Asset>): Asset[] {
  const replaced = new Set(assets.map((a) => a.previous_version_id).filter(Boolean));
  return assets.filter((a) => a.status === 'uploaded' && !replaced.has(a.id));
}

// ── Board ───────────────────────────────────────────────────────────────────

export interface PractitionerOutfitBoard {
  outfit: MediaLabel;
  slots: Array<{ angle: MediaLabel; asset: Asset | null }>;
  uploaded: number;
  needsChanges: number;
}

export interface MediaBoard {
  /** One entry per apron option, each with the outfits to lay out. */
  practitioner: Array<{
    apron: MediaLabel;
    outfits: PractitionerOutfitBoard[];
    hasMoreOutfits: boolean;
  }>;
  /** Practitioner photos whose labels are missing or unknown to the taxonomy. */
  practitionerUnplaced: Asset[];
  clinic: Array<{ category: MediaLabel; hint: string | null; assets: Asset[] }>;
  logo: Asset | null;
  cover: Asset | null;
  /** Clinic photos without a known category. */
  clinicUnplaced: Asset[];
  voice: Array<{ asset: Asset; title: string }>;
}

const byCode = (labels: ReadonlyArray<MediaLabel>, code: string | null | undefined) =>
  code ? labels.find((l) => l.code === code) : undefined;

/**
 * Arranges the clinic's current media on the board. `outfitsShown` is how
 * many outfits to lay out per apron code (at least one, never fewer than the
 * uploaded photos need, never more than the taxonomy has).
 */
export function buildMediaBoard(
  assets: ReadonlyArray<Asset>,
  labels: MediaLabels,
  sources: { coverAssetId: string | null },
  outfitsShown: Readonly<Record<string, number>> = {},
): MediaBoard {
  const current = currentAssets(assets);
  const cover = current.find((a) => a.id === sources.coverAssetId) ?? null;
  const logo = current.find((a) => a.kind === 'logo') ?? null;

  const practitionerPhotos = current.filter((a) => a.kind === 'practitioner_photo');
  const placedPractitioner = practitionerPhotos.filter(
    (a) =>
      byCode(labels.aprons, a.apron) &&
      byCode(labels.angles, a.angle) &&
      byCode(labels.outfits, a.outfit),
  );
  const practitioner = labels.aprons.map((apron) => {
    const mine = placedPractitioner.filter((a) => a.apron === apron.code);
    const lastUsed = Math.max(
      0,
      ...mine.map((a) => labels.outfits.findIndex((o) => o.code === a.outfit) + 1),
    );
    const count = Math.min(
      labels.outfits.length,
      Math.max(1, outfitsShown[apron.code] ?? 1, lastUsed),
    );
    const outfits = labels.outfits.slice(0, count).map((outfit) => {
      const slots = labels.angles.map((angle) => ({
        angle,
        asset: mine.find((a) => a.outfit === outfit.code && a.angle === angle.code) ?? null,
      }));
      const filled = slots.flatMap((s) => (s.asset ? [s.asset] : []));
      return {
        outfit,
        slots,
        uploaded: filled.length,
        needsChanges: filled.filter((a) => needsChanges(a.approval_state)).length,
      };
    });
    return { apron, outfits, hasMoreOutfits: count < labels.outfits.length };
  });

  const clinicPhotos = current.filter((a) => a.kind === 'clinic_photo' && a.id !== cover?.id);
  const clinic = labels.categories.map((category) => ({
    category,
    hint: CLINIC_PHOTO_HINTS[category.code] ?? null,
    assets: clinicPhotos.filter((a) => a.category === category.code),
  }));

  const audio = current
    .filter((a) => a.kind === 'audio')
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const voice = audio.map((asset) => {
    const sample = byCode(labels.voiceSamples, asset.category);
    if (!sample) return { asset, title: asset.original_filename ?? 'Voice sample' };
    const same = audio.filter((a) => a.category === asset.category);
    return {
      asset,
      title: same.length > 1 ? `${sample.label} ${same.indexOf(asset) + 1}` : sample.label,
    };
  });

  return {
    practitioner,
    practitionerUnplaced: practitionerPhotos.filter((a) => !placedPractitioner.includes(a)),
    clinic,
    logo,
    cover,
    clinicUnplaced: clinicPhotos.filter((a) => !byCode(labels.categories, a.category)),
    voice: voice.reverse(),
  };
}

// ── Review ──────────────────────────────────────────────────────────────────

/** The reviewer sent it back: a retake / re-record or a rejection. */
export function needsChanges(state: ApprovalState): boolean {
  return state === 'redo_requested' || state === 'rejected';
}

/** The actions the caller may take on a file now (the API's `available_actions`). */
export function mediaActions(asset: Asset): ReadonlyArray<Schema<'ApprovalAction'>> {
  return asset.review?.available_actions ?? [];
}
