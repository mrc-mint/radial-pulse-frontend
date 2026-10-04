import type { Schema } from '@radial-pulse/shared-types';

/**
 * Clinic media (doctor photos, clinic photos, voice samples): the board
 * layout from the product reference and the pure rules both apps share.
 *
 * The layout ids below (angles, outfits, photo categories) are UI layout
 * only. They are NOT contract values: they are never sent to the API and
 * never read from it. The contract has no category or slot fields yet
 * (backend gap 20), so `mediaSlotOf` is the one place to connect them when
 * the backend adds them.
 */

type Asset = Schema<'AssetRead'>;
type ApprovalState = Schema<'ApprovalState'>;

/** File kinds shown on the Media board. */
export const MEDIA_ASSET_KINDS = [
  'practitioner_photo',
  'clinic_photo',
  'logo',
  'audio',
] as const satisfies ReadonlyArray<Schema<'AssetKind'>>;

export type MediaAssetKind = (typeof MEDIA_ASSET_KINDS)[number];

// ── Layout (from the product reference) ────────────────────────────────────

export type DoctorPhotoAngle = 'left_90' | 'left_45' | 'front' | 'right_45' | 'right_90';

/** The five fixed angles of every outfit, in shooting order. */
export const DOCTOR_PHOTO_ANGLES: ReadonlyArray<{ id: DoctorPhotoAngle; label: string }> = [
  { id: 'left_90', label: '90° L' },
  { id: 'left_45', label: '45° L' },
  { id: 'front', label: '0°' },
  { id: 'right_45', label: '45° R' },
  { id: 'right_90', label: '90° R' },
];

export type DoctorPhotoOutfit = 'with_apron' | 'without_apron';

export const DOCTOR_PHOTO_OUTFITS: ReadonlyArray<{ id: DoctorPhotoOutfit; label: string }> = [
  { id: 'with_apron', label: 'With apron' },
  { id: 'without_apron', label: 'Without apron' },
];

export type ClinicPhotoCategory =
  | 'exterior_signage'
  | 'reception_waiting'
  | 'consult_procedure_rooms'
  | 'equipment_facilities'
  | 'team_at_work'
  | 'logo_cover';

/** Hospital photo categories, in order, with the target count for each. */
export const CLINIC_PHOTO_CATEGORIES: ReadonlyArray<{
  id: ClinicPhotoCategory;
  title: string;
  hint: string;
  target: number;
}> = [
  {
    id: 'exterior_signage',
    title: 'Exterior & signage',
    hint: 'Building front, board and street view',
    target: 3,
  },
  {
    id: 'reception_waiting',
    title: 'Reception & waiting',
    hint: 'Front desk and seating, lights on',
    target: 3,
  },
  {
    id: 'consult_procedure_rooms',
    title: 'Consult & procedure rooms',
    hint: 'Tidy and empty, no patients in frame',
    target: 3,
  },
  {
    id: 'equipment_facilities',
    title: 'Equipment & facilities',
    hint: 'Lasers, pharmacy, parking, ramp',
    target: 3,
  },
  {
    id: 'team_at_work',
    title: 'Team at work',
    hint: 'Shown next to your Google reviews',
    target: 3,
  },
  {
    id: 'logo_cover',
    title: 'Logo & cover photo',
    hint: 'Square logo plus one wide hero shot',
    target: 2,
  },
];

// ── Placement ───────────────────────────────────────────────────────────────

export type MediaSlot =
  | { section: 'doctor'; outfit: DoctorPhotoOutfit; outfitNumber: number; angle: DoctorPhotoAngle }
  | { section: 'clinic'; category: ClinicPhotoCategory };

/** Contract data that already says where a file belongs. */
export interface MediaPlacementSources {
  /** `ClinicRead.cover_asset_id`. */
  coverAssetId: string | null;
}

/**
 * Where a file sits on the board, or null when the contract cannot say yet.
 * Today only the logo (`kind: "logo"`) and the clinic's cover photo
 * (`ClinicRead.cover_asset_id`) are placed; doctor angles, outfits and the
 * other photo categories need backend fields (gap 20). Connect them here.
 */
export function mediaSlotOf(asset: Asset, sources: MediaPlacementSources): MediaSlot | null {
  if (asset.kind === 'logo') return { section: 'clinic', category: 'logo_cover' };
  if (asset.kind === 'clinic_photo' && asset.id === sources.coverAssetId) {
    return { section: 'clinic', category: 'logo_cover' };
  }
  return null;
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

export interface DoctorOutfitBoard {
  number: number;
  slots: Array<{ angle: DoctorPhotoAngle; label: string; asset: Asset | null }>;
  uploaded: number;
  needsChanges: number;
}

export interface ClinicCategoryBoard {
  id: ClinicPhotoCategory;
  title: string;
  hint: string;
  target: number;
  assets: Asset[];
}

export interface MediaBoard {
  doctor: Record<DoctorPhotoOutfit, DoctorOutfitBoard[]>;
  /** Doctor photos the contract cannot place on an angle yet. */
  doctorUnplaced: Asset[];
  clinic: ClinicCategoryBoard[];
  /** For the "Logo & cover photo" row. */
  logo: Asset | null;
  cover: Asset | null;
  /** Clinic photos the contract cannot place in a category yet. */
  clinicUnplaced: Asset[];
  voice: Asset[];
}

/**
 * Arranges the clinic's current media on the board. `outfitCounts` is how
 * many outfits to lay out per apron option (at least one, and never fewer
 * than the placed photos need).
 */
export function buildMediaBoard(
  assets: ReadonlyArray<Asset>,
  sources: MediaPlacementSources,
  outfitCounts: Partial<Record<DoctorPhotoOutfit, number>> = {},
): MediaBoard {
  const current = currentAssets(assets);
  const placed = new Map<Asset, MediaSlot>();
  for (const asset of current) {
    const slot = mediaSlotOf(asset, sources);
    if (slot) placed.set(asset, slot);
  }

  const doctor = {} as Record<DoctorPhotoOutfit, DoctorOutfitBoard[]>;
  for (const { id: outfit } of DOCTOR_PHOTO_OUTFITS) {
    const mine = [...placed].filter(
      (entry): entry is [Asset, Extract<MediaSlot, { section: 'doctor' }>] =>
        entry[1].section === 'doctor' && entry[1].outfit === outfit,
    );
    const count = Math.max(1, outfitCounts[outfit] ?? 1, ...mine.map(([, s]) => s.outfitNumber));
    doctor[outfit] = Array.from({ length: count }, (_, i) => {
      const slots = DOCTOR_PHOTO_ANGLES.map(({ id, label }) => ({
        angle: id,
        label,
        asset: mine.find(([, s]) => s.outfitNumber === i + 1 && s.angle === id)?.[0] ?? null,
      }));
      const filled = slots.flatMap((s) => (s.asset ? [s.asset] : []));
      return {
        number: i + 1,
        slots,
        uploaded: filled.length,
        needsChanges: filled.filter((a) => needsChanges(a.approval_state)).length,
      };
    });
  }

  const logo = current.find((a) => a.kind === 'logo') ?? null;
  const cover = current.find((a) => a.id === sources.coverAssetId) ?? null;
  const clinic = CLINIC_PHOTO_CATEGORIES.map((category) => ({
    ...category,
    assets:
      category.id === 'logo_cover'
        ? [logo, cover].filter((a): a is Asset => a !== null)
        : [...placed]
            .filter(([, s]) => s.section === 'clinic' && s.category === category.id)
            .map(([a]) => a),
  }));

  return {
    doctor,
    doctorUnplaced: current.filter((a) => a.kind === 'practitioner_photo' && !placed.has(a)),
    clinic,
    logo,
    cover,
    clinicUnplaced: current.filter((a) => a.kind === 'clinic_photo' && !placed.has(a)),
    voice: current.filter((a) => a.kind === 'audio'),
  };
}

// ── Review ──────────────────────────────────────────────────────────────────

/** The reviewer sent it back: a retake / re-record or a rejection. */
export function needsChanges(state: ApprovalState): boolean {
  return state === 'redo_requested' || state === 'rejected';
}

/** The newest approval record for a resource (matched by id only). */
export function approvalForResource(
  approvals: ReadonlyArray<Schema<'ApprovalRead'>>,
  resourceId: string,
): Schema<'ApprovalRead'> | null {
  return (
    approvals
      .filter((a) => a.resource_id === resourceId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0] ?? null
  );
}

export type MediaReviewDecision = Extract<Schema<'ApprovalAction'>, 'approve' | 'redo' | 'reject'>;

/**
 * Review buttons to offer for a file. A stand-in until the contract publishes
 * allowed actions (`available_actions`, gap 23): a reviewer with
 * `approvals:decide` may decide a file that is awaiting review. The backend
 * still checks every action.
 */
export function mediaReviewDecisions(
  state: ApprovalState,
  canDecide: boolean,
): ReadonlyArray<MediaReviewDecision> {
  return canDecide && state === 'submitted' ? ['approve', 'redo', 'reject'] : [];
}
