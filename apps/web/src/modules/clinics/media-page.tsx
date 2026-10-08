import {
  useAssetDownloadUrl,
  useClinic,
  useClinicAssets,
  useMediaTaxonomy,
} from '@radial-pulse/api-client/react';
import { useClinicId } from '@radial-pulse/platform-shell/core';
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
  CLINIC_PHOTO_TARGET,
  currentAssets,
  LOGO_COVER_ROW,
  MEDIA_ASSET_KINDS,
  MEDIA_REVIEW_LABELS,
  mediaLabels,
  mediaReviewLabel,
  type MediaBoard,
} from '@radial-pulse/utils';
import { AudioLines, Check, Clock, ImageOff, RotateCcw, X, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CardSkeleton, QueryError } from '../../app/page-kit';
import { STUDIO_FEATURES } from '../../app/release';
import { MediaReviewDialog } from './media-review';
import './media.css';

type Asset = Schema<'AssetRead'>;
type ApprovalState = Schema<'ApprovalState'>;
type Section = 'all' | 'practitioner' | 'clinic' | 'voice';

/** V1 media is photos only: voice samples (`audio`) are V2 (STUDIO_FEATURES). */
const VOICE = STUDIO_FEATURES.voiceSamples;
const KINDS = VOICE ? MEDIA_ASSET_KINDS : MEDIA_ASSET_KINDS.filter((k) => k !== 'audio');

const STATE_ICON: Record<ApprovalState, LucideIcon> = {
  draft: Clock,
  submitted: Clock,
  approved: Check,
  rejected: X,
  redo_requested: RotateCcw,
};

const STATES = Object.keys(MEDIA_REVIEW_LABELS) as ApprovalState[];

/**
 * Clinic media for Radial Pulse staff: practitioner photos, hospital photos and
 * voice samples, laid out from the media taxonomy (`GET /media/taxonomy`),
 * with review. Staff never upload, replace or delete here: this page has no
 * upload code. Review buttons are the API's `review.available_actions`.
 */
export function ClinicMediaPage() {
  const clinicId = useClinicId();
  const clinic = useClinic(clinicId);
  const taxonomy = useMediaTaxonomy();
  const assets = useClinicAssets(clinicId, KINDS);
  const [section, setSection] = useState<Section>('all');
  const [state, setState] = useState<ApprovalState | 'all'>('all');
  const [openId, setOpenId] = useState<{ id: string; title: string } | null>(null);

  const board = useMemo(
    () =>
      assets.data && clinic.data && taxonomy.data
        ? buildMediaBoard(assets.data, mediaLabels(taxonomy.data), {
            coverAssetId: clinic.data.cover_asset_id,
          })
        : null,
    [assets.data, clinic.data, taxonomy.data],
  );

  if (assets.isError || clinic.isError || taxonomy.isError) {
    return (
      <Card>
        <QueryError
          error={assets.error ?? clinic.error ?? taxonomy.error}
          onRetry={() => void Promise.all([assets.refetch(), clinic.refetch(), taxonomy.refetch()])}
        />
      </Card>
    );
  }
  if (!board || !assets.data) return <CardSkeleton lines={8} />;

  const current = currentAssets(assets.data);
  const counts = {
    practitioner: current.filter((a) => a.kind === 'practitioner_photo').length,
    clinic: current.filter((a) => a.kind === 'clinic_photo' || a.kind === 'logo').length,
    voice: board.voice.length,
  };
  const awaiting = current.filter((a) => a.approval_state === 'submitted').length;
  const show = (s: Exclude<Section, 'all'>) => section === 'all' || section === s;
  const onOpen = (asset: Asset, title: string) => setOpenId({ id: asset.id, title });
  const filter = state === 'all' ? null : state;
  // The dialog follows the list, so it shows the review state after an action.
  const open = openId ? current.find((a) => a.id === openId.id) : undefined;

  return (
    <div className="rp-stack">
      <div className="rp-media-toolbar">
        <Tabs
          label="Media sections"
          value={section}
          onChange={setSection}
          items={[
            { value: 'all', label: 'All media', count: current.length },
            { value: 'practitioner', label: 'Practitioner photos', count: counts.practitioner },
            { value: 'clinic', label: 'Hospital photos', count: counts.clinic },
            ...(VOICE
              ? [{ value: 'voice' as const, label: 'Voice samples', count: counts.voice }]
              : []),
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

      {show('practitioner') && (
        <DoctorPhotos board={board} filter={filter} clinicId={clinicId} onOpen={onOpen} />
      )}
      {show('clinic') && (
        <HospitalPhotos board={board} filter={filter} clinicId={clinicId} onOpen={onOpen} />
      )}
      {VOICE && show('voice') && <VoiceSamples board={board} filter={filter} onOpen={onOpen} />}

      {open && openId && (
        <MediaReviewDialog
          clinicId={clinicId}
          asset={open}
          title={openId.title}
          onClose={() => setOpenId(null)}
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
  const [apronCode, setApronCode] = useState(board.practitioner[0]?.apron.code ?? '');
  const apron = board.practitioner.find((d) => d.apron.code === apronCode) ?? board.practitioner[0];
  const unplaced = board.practitionerUnplaced.filter((a) => matches(a, filter));

  return (
    <Card title="Practitioner photos" description="Five angles per outfit, apron and non-apron">
      {apron ? (
        <>
          <Tabs
            label="Apron"
            value={apron.apron.code}
            onChange={setApronCode}
            items={board.practitioner.map((d) => ({ value: d.apron.code, label: d.apron.label }))}
          />
          {apron.outfits.map((o) => (
            <section key={o.outfit.code} className="rp-media-group">
              <MediaGroupHeader
                title={o.outfit.label}
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
                      key={slot.angle.code}
                      clinicId={clinicId}
                      asset={slot.asset}
                      label={slot.angle.label}
                      onOpen={() =>
                        onOpen(
                          slot.asset!,
                          `${apron.apron.label} · ${o.outfit.label} · ${slot.angle.label}`,
                        )
                      }
                    />
                  ) : (
                    <EmptyTile key={slot.angle.code} label={slot.angle.label} />
                  ),
                )}
              </div>
            </section>
          ))}
        </>
      ) : null}
      {unplaced.length > 0 && (
        <section className="rp-media-group">
          <MediaGroupHeader title="Other practitioner photos" hint="No outfit or angle recorded" />
          <div className="rp-media-grid rp-media-grid--portrait">
            {unplaced.map((asset) => (
              <MediaTile
                key={asset.id}
                clinicId={clinicId}
                asset={asset}
                onOpen={() => onOpen(asset, 'Practitioner photo')}
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
  const logoCover = [
    { key: 'logo', label: 'Logo', asset: board.logo },
    { key: 'cover', label: 'Cover photo', asset: board.cover },
  ];
  return (
    <Card title="Hospital photos" description="Photos for the client’s Google listing">
      {board.clinic.map((row) => (
        <section key={row.category.code} className="rp-media-group">
          <MediaGroupHeader
            title={row.category.label}
            hint={row.hint}
            count={row.assets.length}
            target={CLINIC_PHOTO_TARGET}
          />
          <div className="rp-media-grid rp-media-grid--landscape">
            {row.assets
              .filter((a) => matches(a, filter))
              .map((asset) => (
                <MediaTile
                  key={asset.id}
                  clinicId={clinicId}
                  asset={asset}
                  onOpen={() => onOpen(asset, row.category.label)}
                />
              ))}
            {row.assets.length === 0 && <EmptyTile label="Not uploaded" />}
          </div>
        </section>
      ))}
      <section className="rp-media-group">
        <MediaGroupHeader
          title={LOGO_COVER_ROW.title}
          hint={LOGO_COVER_ROW.hint}
          count={logoCover.filter((t) => t.asset).length}
          target={LOGO_COVER_ROW.target}
        />
        <div className="rp-media-grid rp-media-grid--landscape">
          {logoCover.map((tile) =>
            tile.asset && matches(tile.asset, filter) ? (
              <MediaTile
                key={tile.key}
                clinicId={clinicId}
                asset={tile.asset}
                label={tile.label}
                onOpen={() => onOpen(tile.asset!, `${LOGO_COVER_ROW.title} · ${tile.label}`)}
              />
            ) : (
              <EmptyTile key={tile.key} label={tile.label} />
            ),
          )}
        </div>
      </section>
      {unplaced.length > 0 && (
        <section className="rp-media-group">
          <MediaGroupHeader title="Other hospital photos" hint="No category recorded" />
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
  const samples = board.voice.filter((v) => matches(v.asset, filter));
  return (
    <Card
      title="Voice samples"
      description="Recordings for the client’s phone assistant"
      padding="none"
    >
      {samples.length === 0 ? (
        <EmptyState
          title="No voice samples"
          description={
            filter ? 'No voice samples with this status.' : 'The client has not uploaded any yet.'
          }
        />
      ) : (
        <ul className="rp-voice-list">
          {samples.map(({ asset, title }) => (
            <li key={asset.id}>
              <button type="button" className="rp-voice-row" onClick={() => onOpen(asset, title)}>
                <span className="rp-voice-row__icon" aria-hidden="true">
                  <AudioLines size={20} />
                </span>
                <span className="rp-voice-row__body">
                  <span className="rp-voice-row__title">{title}</span>
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
  hint: string | null;
  count?: number;
  target?: number;
}) {
  return (
    <header className="rp-media-group__header">
      <div>
        <h3 className="rp-media-group__title">{title}</h3>
        {hint && <p className="rp-media-group__hint">{hint}</p>}
      </div>
      {target !== undefined && (
        <Badge tone={(count ?? 0) >= target ? 'success' : 'warning'} size="sm">
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
