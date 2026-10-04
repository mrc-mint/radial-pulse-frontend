import {
  useAssetDownloadUrl,
  useClinic,
  useClinicApprovals,
  useClinicAssets,
} from '@radial-pulse/api-client/react';
import { useClinicCan, useClinicId } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import {
  APPROVAL_STATE_TONES,
  Badge,
  Card,
  EmptyState,
  formatRelativeTime,
  ProtectedImage,
  Select,
  Tabs,
} from '@radial-pulse/ui/web';
import {
  buildMediaBoard,
  CLINIC_PHOTO_CATEGORIES,
  currentAssets,
  DOCTOR_PHOTO_OUTFITS,
  MEDIA_ASSET_KINDS,
  MEDIA_REVIEW_LABELS,
  mediaReviewLabel,
  type DoctorPhotoOutfit,
  type MediaBoard,
} from '@radial-pulse/utils';
import { AudioLines, Check, Clock, ImageOff, RotateCcw, X, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CardSkeleton, QueryError } from '../../app/page-kit';
import { MediaReviewDialog } from './media-review';
import './media.css';

type Asset = Schema<'AssetRead'>;
type ApprovalState = Schema<'ApprovalState'>;
type Section = 'all' | 'doctor' | 'clinic' | 'voice';

const STATE_ICON: Record<ApprovalState, LucideIcon> = {
  draft: Clock,
  submitted: Clock,
  approved: Check,
  rejected: X,
  redo_requested: RotateCcw,
};

const STATES = Object.keys(MEDIA_REVIEW_LABELS) as ApprovalState[];

/**
 * Clinic media for Radial Pulse staff: doctor photos, hospital photos and
 * voice samples, laid out as on the clinic's Media board, with review.
 * Staff never upload, replace or delete here: this page has no upload code.
 * Review buttons follow `approvals:decide`; the backend decides every action.
 */
export function ClinicMediaPage() {
  const clinicId = useClinicId();
  const clinic = useClinic(clinicId);
  const assets = useClinicAssets(clinicId, MEDIA_ASSET_KINDS);
  const approvals = useClinicApprovals(clinicId);
  const canDecide = useClinicCan(clinicId, 'approvals:decide');
  const [section, setSection] = useState<Section>('all');
  const [state, setState] = useState<ApprovalState | 'all'>('all');
  const [open, setOpen] = useState<{ asset: Asset; title: string } | null>(null);

  const board = useMemo(
    () =>
      assets.data && clinic.data
        ? buildMediaBoard(assets.data, { coverAssetId: clinic.data.cover_asset_id })
        : null,
    [assets.data, clinic.data],
  );

  if (assets.isError || clinic.isError) {
    return (
      <Card>
        <QueryError
          error={assets.error ?? clinic.error}
          onRetry={() => void Promise.all([assets.refetch(), clinic.refetch()])}
        />
      </Card>
    );
  }
  if (!board || !assets.data) return <CardSkeleton lines={8} />;

  const current = currentAssets(assets.data);
  const counts = {
    doctor: current.filter((a) => a.kind === 'practitioner_photo').length,
    clinic: current.filter((a) => a.kind === 'clinic_photo' || a.kind === 'logo').length,
    voice: board.voice.length,
  };
  const awaiting = current.filter((a) => a.approval_state === 'submitted').length;
  const show = (s: Exclude<Section, 'all'>) => section === 'all' || section === s;
  const openAsset = (asset: Asset, title: string) => setOpen({ asset, title });
  const filter = state === 'all' ? null : state;

  return (
    <div className="rp-stack">
      <div className="rp-media-toolbar">
        <Tabs
          label="Media sections"
          value={section}
          onChange={setSection}
          items={[
            { value: 'all', label: 'All media', count: current.length },
            { value: 'doctor', label: 'Doctor photos', count: counts.doctor },
            { value: 'clinic', label: 'Hospital photos', count: counts.clinic },
            { value: 'voice', label: 'Voice samples', count: counts.voice },
          ]}
        />
        <div className="rp-media-toolbar__filter">
          <Select
            label="Review status"
            hideLabel
            value={state}
            onChange={setState}
            options={[
              { value: 'all', label: 'All statuses' },
              ...STATES.map((s) => ({ value: s, label: MEDIA_REVIEW_LABELS[s] })),
            ]}
          />
        </div>
      </div>
      <p className="rp-media-summary">
        {awaiting === 0
          ? 'Nothing is waiting for review.'
          : `${awaiting} ${awaiting === 1 ? 'file is' : 'files are'} waiting for review.`}
      </p>

      {show('doctor') && (
        <DoctorPhotos board={board} filter={filter} clinicId={clinicId} onOpen={openAsset} />
      )}
      {show('clinic') && (
        <HospitalPhotos board={board} filter={filter} clinicId={clinicId} onOpen={openAsset} />
      )}
      {show('voice') && <VoiceSamples board={board} filter={filter} onOpen={openAsset} />}

      {open && (
        <MediaReviewDialog
          clinicId={clinicId}
          asset={open.asset}
          title={open.title}
          approvals={approvals.data?.items ?? []}
          canDecide={canDecide}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

interface SectionProps {
  board: MediaBoard;
  filter: ApprovalState | null;
  clinicId: string;
  onOpen: (asset: Asset, title: string) => void;
}

const matches = (asset: Asset, filter: ApprovalState | null) =>
  filter === null || asset.approval_state === filter;

function DoctorPhotos({ board, filter, clinicId, onOpen }: SectionProps) {
  const [outfit, setOutfit] = useState<DoctorPhotoOutfit>('with_apron');
  const outfits = board.doctor[outfit];
  const unplaced = board.doctorUnplaced.filter((a) => matches(a, filter));
  const outfitLabel = DOCTOR_PHOTO_OUTFITS.find((o) => o.id === outfit)!.label;

  return (
    <Card title="Doctor photos" description="Five angles per outfit, apron and non-apron">
      <Tabs
        label="Outfit"
        value={outfit}
        onChange={setOutfit}
        items={DOCTOR_PHOTO_OUTFITS.map((o) => ({ value: o.id, label: o.label }))}
      />
      {outfits.map((o) => (
        <section key={o.number} className="rp-media-group">
          <MediaGroupHeader
            title={`Outfit ${o.number}`}
            hint={
              o.needsChanges > 0
                ? `${o.needsChanges} ${o.needsChanges === 1 ? 'needs' : 'need'} a retake`
                : o.uploaded === o.slots.length
                  ? 'All angles uploaded'
                  : `${o.slots.length - o.uploaded} still to upload`
            }
            count={o.uploaded}
            target={o.slots.length}
          />
          <div className="rp-media-grid rp-media-grid--portrait">
            {o.slots.map((slot) =>
              slot.asset && matches(slot.asset, filter) ? (
                <MediaTile
                  key={slot.angle}
                  clinicId={clinicId}
                  asset={slot.asset}
                  label={slot.label}
                  onOpen={() =>
                    onOpen(slot.asset!, `${outfitLabel} · Outfit ${o.number} · ${slot.label}`)
                  }
                />
              ) : (
                <EmptyTile key={slot.angle} label={slot.label} />
              ),
            )}
          </div>
        </section>
      ))}
      {unplaced.length > 0 && (
        <section className="rp-media-group">
          <MediaGroupHeader
            title="Uploaded doctor photos"
            hint="Not yet matched to an outfit and angle"
          />
          <div className="rp-media-grid rp-media-grid--portrait">
            {unplaced.map((asset) => (
              <MediaTile
                key={asset.id}
                clinicId={clinicId}
                asset={asset}
                onOpen={() => onOpen(asset, 'Doctor photo')}
              />
            ))}
          </div>
        </section>
      )}
    </Card>
  );
}

function HospitalPhotos({ board, filter, clinicId, onOpen }: SectionProps) {
  const unplaced = board.clinicUnplaced.filter((a) => matches(a, filter));
  return (
    <Card title="Hospital photos" description="Clinic photos for the Google listing">
      {CLINIC_PHOTO_CATEGORIES.map((category) => {
        const row = board.clinic.find((c) => c.id === category.id)!;
        const tiles =
          category.id === 'logo_cover'
            ? [
                { key: 'logo', label: 'Logo', asset: board.logo },
                { key: 'cover', label: 'Cover photo', asset: board.cover },
              ]
            : row.assets.map((a) => ({ key: a.id, label: undefined, asset: a }));
        return (
          <section key={category.id} className="rp-media-group">
            <MediaGroupHeader
              title={category.title}
              hint={category.hint}
              count={row.assets.length}
              target={category.target}
            />
            <div className="rp-media-grid rp-media-grid--landscape">
              {tiles.map((tile) =>
                tile.asset && matches(tile.asset, filter) ? (
                  <MediaTile
                    key={tile.key}
                    clinicId={clinicId}
                    asset={tile.asset}
                    label={tile.label}
                    onOpen={() =>
                      onOpen(tile.asset!, `${category.title} · ${tile.label ?? 'Photo'}`)
                    }
                  />
                ) : (
                  <EmptyTile key={tile.key} label={tile.label ?? 'Not uploaded'} />
                ),
              )}
              {category.id !== 'logo_cover' && tiles.length === 0 && (
                <EmptyTile label="Not uploaded" />
              )}
            </div>
          </section>
        );
      })}
      {unplaced.length > 0 && (
        <section className="rp-media-group">
          <MediaGroupHeader
            title="Uploaded hospital photos"
            hint="Not yet sorted into a category"
          />
          <div className="rp-media-grid rp-media-grid--landscape">
            {unplaced.map((asset) => (
              <MediaTile
                key={asset.id}
                clinicId={clinicId}
                asset={asset}
                onOpen={() => onOpen(asset, 'Hospital photo')}
              />
            ))}
          </div>
        </section>
      )}
    </Card>
  );
}

function VoiceSamples({ board, filter, onOpen }: Omit<SectionProps, 'clinicId'>) {
  const samples = board.voice.filter((a) => matches(a, filter));
  return (
    <Card
      title="Voice samples"
      description="Recordings for the clinic’s phone assistant"
      padding="none"
    >
      {samples.length === 0 ? (
        <EmptyState
          title="No voice samples"
          description={
            filter ? 'No voice samples with this status.' : 'The clinic has not uploaded any yet.'
          }
        />
      ) : (
        <ul className="rp-voice-list">
          {samples.map((asset) => (
            <li key={asset.id}>
              <button
                type="button"
                className="rp-voice-row"
                onClick={() => onOpen(asset, asset.original_filename ?? 'Voice sample')}
              >
                <span className="rp-voice-row__icon" aria-hidden="true">
                  <AudioLines size={20} />
                </span>
                <span className="rp-voice-row__body">
                  <span className="rp-voice-row__title">
                    {asset.original_filename ?? 'Voice sample'}
                  </span>
                  <span className="rp-voice-row__meta">
                    Uploaded {formatRelativeTime(asset.created_at)}
                    {asset.version > 1 ? ` · Version ${asset.version}` : ''}
                  </span>
                </span>
                <Badge tone={APPROVAL_STATE_TONES[asset.approval_state]} size="sm">
                  {mediaReviewLabel(asset.approval_state, asset.kind)}
                </Badge>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function MediaGroupHeader({
  title,
  hint,
  count,
  target,
}: {
  title: string;
  hint: string;
  count?: number;
  target?: number;
}) {
  return (
    <header className="rp-media-group__header">
      <div>
        <h3 className="rp-media-group__title">{title}</h3>
        <p className="rp-media-group__hint">{hint}</p>
      </div>
      {target !== undefined && (
        <Badge tone={count === target ? 'success' : 'warning'} size="sm">
          {count ?? 0}/{target}
        </Badge>
      )}
    </header>
  );
}

function MediaTile({
  clinicId,
  asset,
  label,
  onOpen,
}: {
  clinicId: string;
  asset: Asset;
  label?: string;
  onOpen: () => void;
}) {
  const url = useAssetDownloadUrl(clinicId, asset.id);
  const Icon = STATE_ICON[asset.approval_state];
  const status = mediaReviewLabel(asset.approval_state, asset.kind);
  return (
    <button
      type="button"
      className="rp-media-tile"
      onClick={onOpen}
      aria-label={`${label ?? asset.original_filename ?? 'Photo'}: ${status}. Open to review.`}
    >
      <ProtectedImage
        src={url.data?.url}
        alt=""
        placeholder={url.isError ? <ImageOff size={20} aria-hidden="true" /> : null}
      />
      <span
        className={`rp-media-tile__status rp-tone-${APPROVAL_STATE_TONES[asset.approval_state]}`}
        title={status}
      >
        <Icon size={12} aria-hidden="true" />
      </span>
      {label && <span className="rp-media-tile__label">{label}</span>}
    </button>
  );
}

function EmptyTile({ label }: { label: string }) {
  return (
    <div className="rp-media-tile rp-media-tile--empty">
      <span className="rp-media-tile__label">{label}</span>
      <span className="rp-sr-only">Not uploaded yet</span>
    </div>
  );
}
