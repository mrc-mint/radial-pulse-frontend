import type { Schema } from '@radial-pulse/shared-types';
import { clinicPhotoSvg } from './extras';

/**
 * DEV/TEST ONLY. Sample media for UI prototyping: doctor photos, clinic
 * photos and voice samples in every review state, each with its approval
 * record. Every record is a contract schema. The contract has no category or
 * slot fields yet (backend gap 20), so none are invented here.
 */

const TILE_TONES = ['#1f6f78', '#b7791f', '#3c5a6b', '#2b7a8a', '#6b4f9e'] as const;

/**
 * A drawn portrait "photo" of a doctor (SVG): head and shoulders, with or
 * without a white apron. Stands in for real `practitioner_photo` uploads.
 */
export function doctorPhotoSvg(seed: number, apron: boolean): string {
  const bg = TILE_TONES[seed % TILE_TONES.length]!;
  const coat = apron ? '#f5f7fa' : '#2a3442';
  // Unique ids: React Native draws these SVGs inline, where ids are shared.
  const gid = `doctor-bg-${seed}-${apron ? 'a' : 'n'}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#0f1f2a"/>
    </linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#${gid})"/>
  <path d="M40 400 C48 300 96 270 150 270 C204 270 252 300 260 400 Z" fill="${coat}"/>
  <path d="M128 272 L150 330 L172 272 Z" fill="#8fb3c9"/>
  <rect x="132" y="226" width="36" height="52" rx="14" fill="#c99a78"/>
  <ellipse cx="150" cy="186" rx="52" ry="62" fill="#d8a989"/>
  <path d="M98 176 C98 124 202 118 202 176 C190 150 112 150 98 176 Z" fill="#2d2420"/>
</svg>`;
}

/** A short, quiet sine tone as an 8 kHz, 8-bit WAV: the stand-in for a voice sample. */
export function toneWav(frequency: number, seconds = 1.5): Blob {
  const rate = 8000;
  const samples = Math.round(rate * seconds);
  const bytes = new Uint8Array(44 + samples);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
  };
  text(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true); // 8-bit
  text(36, 'data');
  view.setUint32(40, samples, true);
  for (let i = 0; i < samples; i += 1) {
    const fade = Math.min(1, i / 400, (samples - i) / 400);
    const wave = Math.sin((2 * Math.PI * frequency * i) / rate);
    view.setUint8(44 + i, 128 + Math.round(40 * fade * wave));
  }
  return new Blob([bytes], { type: 'audio/wav' });
}

type MockAsset = Schema<'AssetRead'> & { blob?: Blob };

interface MediaSeed {
  kind: 'practitioner_photo' | 'clinic_photo' | 'audio';
  name: string;
  state: Schema<'ApprovalState'>;
  comment?: string;
  daysAgo: number;
  blob: () => Blob;
}

const svgBlob = (svg: string) => new Blob([svg], { type: 'image/svg+xml' });
const doctor = (seed: number, apron: boolean) => () => svgBlob(doctorPhotoSvg(seed, apron));
const room = (seed: number) => () => svgBlob(clinicPhotoSvg(seed));

const SEEDS: ReadonlyArray<MediaSeed> = [
  {
    kind: 'practitioner_photo',
    name: 'doctor-apron-1.svg',
    state: 'approved',
    daysAgo: 9,
    blob: doctor(0, true),
  },
  {
    kind: 'practitioner_photo',
    name: 'doctor-apron-2.svg',
    state: 'redo_requested',
    comment: 'Slightly blurred, please retake in better light.',
    daysAgo: 8,
    blob: doctor(1, true),
  },
  {
    kind: 'practitioner_photo',
    name: 'doctor-apron-3.svg',
    state: 'approved',
    daysAgo: 8,
    blob: doctor(2, true),
  },
  {
    kind: 'practitioner_photo',
    name: 'doctor-apron-4.svg',
    state: 'submitted',
    daysAgo: 2,
    blob: doctor(3, true),
  },
  {
    kind: 'practitioner_photo',
    name: 'doctor-casual-1.svg',
    state: 'submitted',
    daysAgo: 1,
    blob: doctor(4, false),
  },
  {
    kind: 'clinic_photo',
    name: 'front-entrance.svg',
    state: 'approved',
    daysAgo: 12,
    blob: room(1),
  },
  { kind: 'clinic_photo', name: 'waiting-area.svg', state: 'submitted', daysAgo: 3, blob: room(2) },
  {
    kind: 'clinic_photo',
    name: 'consult-room.svg',
    state: 'rejected',
    comment: 'A patient is visible in the frame. Please use a photo without patients.',
    daysAgo: 5,
    blob: room(3),
  },
  {
    kind: 'audio',
    name: 'Clinic greeting.wav',
    state: 'approved',
    comment: 'Clear audio, no background noise. Ready to use.',
    daysAgo: 6,
    blob: () => toneWav(440),
  },
  {
    kind: 'audio',
    name: 'Reading sample 2.wav',
    state: 'redo_requested',
    comment: 'Noticeable background noise. Please re-record somewhere quiet.',
    daysAgo: 4,
    blob: () => toneWav(330),
  },
  {
    kind: 'audio',
    name: 'Reading sample 3.wav',
    state: 'submitted',
    daysAgo: 2,
    blob: () => toneWav(523),
  },
];

/** Sample media and approvals for one clinic. */
export function mockClinicMedia(
  clinicId: string,
  ownerUserId: string,
  reviewerUserId: string,
  id: (n: number, kind: 'asset' | 'approval') => string,
  ago: (days: number) => string,
): { assets: MockAsset[]; approvals: Array<Schema<'ApprovalRead'>> } {
  const assets: MockAsset[] = [];
  const approvals: Array<Schema<'ApprovalRead'>> = [];
  SEEDS.forEach((seed, i) => {
    const blob = seed.blob();
    const at = ago(seed.daysAgo);
    const assetId = id(i + 1, 'asset');
    assets.push({
      id: assetId,
      clinic_id: clinicId,
      kind: seed.kind,
      mime_type: blob.type,
      original_filename: seed.name,
      size_bytes: blob.size,
      status: 'uploaded',
      approval_state: seed.state,
      owner_user_id: ownerUserId,
      previous_version_id: null,
      provenance: {},
      version: 1,
      created_at: at,
      updated_at: at,
      blob,
    });
    const decided = seed.state !== 'submitted' && seed.state !== 'draft';
    approvals.push({
      id: id(i + 1, 'approval'),
      clinic_id: clinicId,
      // The contract publishes no resource_type values (backend gap 22);
      // the mocks use "asset" for files.
      resource_type: MOCK_ASSET_RESOURCE_TYPE,
      resource_id: assetId,
      state: seed.state,
      publication_state: 'unpublished',
      submitted_by_user_id: ownerUserId,
      decided_by_user_id: decided ? reviewerUserId : null,
      assignee_user_id: null,
      last_comment: seed.comment ?? null,
      created_at: at,
      updated_at: at,
    });
  });
  return { assets, approvals };
}

export const MOCK_ASSET_RESOURCE_TYPE = 'asset';

/** File kinds that go through review when uploaded (mock behaviour, gap 22). */
export const MOCK_REVIEWED_KINDS: ReadonlySet<Schema<'AssetKind'>> = new Set([
  'clinic_photo',
  'practitioner_photo',
  'logo',
  'audio',
]);

/** A blob as a `data:` URL (FileReader in browsers and React Native, base64 in Node). */
export async function blobToDataUrl(blob: Blob): Promise<string> {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return `data:${blob.type};base64,${btoa(binary)}`;
}
