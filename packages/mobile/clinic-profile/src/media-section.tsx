import type { UploadFile, UploadLabels } from '@radial-pulse/api-client';
import {
  useClinic,
  useClinicAssets,
  useMediaTaxonomy,
  usePractitioners,
  useSetClinicPhoto,
  useUploadAsset,
} from '@radial-pulse/api-client-react';
import { tokens as t } from '@radial-pulse/design-tokens';
import { useClinicCan, useClinicId } from '@radial-pulse/shell-core';
import type { Schema } from '@radial-pulse/shared-types';
import { Tabs, textStyle } from '@radial-pulse/mobile-ui';
import {
  buildMediaBoard,
  CLINIC_PHOTO_TARGET,
  LOGO_COVER_ROW,
  MEDIA_ASSET_KINDS,
  mediaLabels,
} from '@radial-pulse/utils';
import { Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Callout,
  CardSkeleton,
  mutationErrorMessage,
  QueryErrorState,
} from '@radial-pulse/clinic-kit';
import { AddTile, CollapsibleCard, GroupHeader, PhotoTile, Tips } from './media-kit';
import { pickAudio, pickPhoto } from './pick-media';
import { VoiceSamples } from './voice-samples';

type Asset = Schema<'AssetRead'>;
type MediaKind = 'practitioner_photo' | 'clinic_photo' | 'logo' | 'audio';

const SHOOTING_TIPS = [
  'Use daylight from a window in front of you; avoid harsh overhead light.',
  'Plain, uncluttered background; stand about two metres away.',
  'Hold the phone at eye level, in portrait orientation.',
  'Turn for each angle: 90° and 45° to the left, straight on, then 45° and 90° to the right.',
];

/**
 * Profile → Media (Clinic Administrator): practitioner photos by apron, outfit and
 * angle, hospital photos by category and voice samples, all laid out from the
 * media taxonomy (`GET /media/taxonomy`). Each upload carries its labels and
 * the main practitioner. Uploading needs `media:upload`; reviewing belongs to
 * Radial Pulse staff on the web, so there are no review controls here.
 */
export function MediaSection() {
  const clinicId = useClinicId();
  const canUpload = useClinicCan(clinicId, 'media:upload');
  const canSetCover = useClinicCan(clinicId, 'clinics:write');
  const clinic = useClinic(clinicId);
  const taxonomy = useMediaTaxonomy();
  const assets = useClinicAssets(clinicId, MEDIA_ASSET_KINDS);
  const practitioners = usePractitioners(clinicId);
  const upload = useUploadAsset(clinicId);
  const setCover = useSetClinicPhoto(clinicId);
  const [apronCode, setApronCode] = useState<string | null>(null);
  const [outfitsShown, setOutfitsShown] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const labels = useMemo(
    () => (taxonomy.data ? mediaLabels(taxonomy.data) : null),
    [taxonomy.data],
  );
  const board = useMemo(
    () =>
      assets.data && clinic.data && labels
        ? buildMediaBoard(
            assets.data,
            labels,
            { coverAssetId: clinic.data.cover_asset_id },
            outfitsShown,
          )
        : null,
    [assets.data, clinic.data, labels, outfitsShown],
  );

  if (assets.isError || clinic.isError || taxonomy.isError) {
    return (
      <QueryErrorState
        error={assets.error ?? clinic.error ?? taxonomy.error}
        onRetry={() => void Promise.all([assets.refetch(), clinic.refetch(), taxonomy.refetch()])}
      />
    );
  }
  if (!board || !labels) return <CardSkeleton lines={6} />;

  // V1: media belongs to the clinic's main practitioner.
  const practitionerId =
    practitioners.data?.items.find((p) => p.is_primary && p.is_active)?.id ?? null;

  /** Pick a file, then run the upload; `key` marks the busy frame. */
  async function run(
    key: string,
    pick: () => Promise<UploadFile | null>,
    send: (file: UploadFile) => Promise<unknown>,
  ) {
    setError(null);
    try {
      const file = await pick();
      if (!file) return;
      setBusy(key);
      await send(file);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(null);
    }
  }
  const uploader =
    (kind: MediaKind, pick: () => Promise<UploadFile | null>) =>
    (key: string, labels: UploadLabels, replaces?: Asset | null) =>
      canUpload
        ? () =>
            void run(key, pick, (file) =>
              upload.mutateAsync({ kind, file, labels, replaces: replaces?.id }),
            )
        : undefined;
  const uploadDoctor = uploader('practitioner_photo', pickPhoto);
  const uploadClinic = uploader('clinic_photo', pickPhoto);
  const uploadLogo = uploader('logo', pickPhoto);
  const uploadCover =
    canUpload && canSetCover
      ? () => void run('cover', pickPhoto, (file) => setCover.mutateAsync(file))
      : undefined;
  const uploadVoice = (category: string, replaces: Asset | null) =>
    void run(replaces?.id ?? `new-${category}`, pickAudio, (file) =>
      upload.mutateAsync({
        kind: 'audio',
        file,
        labels: { category, practitioner_id: practitionerId },
        replaces: replaces?.id,
      }),
    );

  const apron = board.practitioner.find((d) => d.apron.code === apronCode) ?? board.practitioner[0];
  const views = apron ? apron.outfits.reduce((n, o) => n + o.uploaded, 0) : 0;
  const frames = apron ? apron.outfits.length * labels.angles.length : 0;

  return (
    <View style={styles.stack}>
      {error ? <Callout tone="danger">{mutationErrorMessage(error)}</Callout> : null}

      <CollapsibleCard
        title="Practitioner photos"
        subtitle="Five angles per outfit, apron and non-apron"
      >
        <Text style={styles.intro}>
          {canUpload
            ? 'Five fixed angles per outfit. Tap a frame to upload, the pencil to replace.'
            : 'Five fixed angles per outfit.'}
        </Text>
        {apron ? (
          <>
            <Tabs
              label="Apron"
              value={apron.apron.code}
              onChange={setApronCode}
              items={board.practitioner.map((d) => ({ value: d.apron.code, label: d.apron.label }))}
            />
            <Text style={styles.caption}>
              {apron.apron.label} · {apron.outfits.length}{' '}
              {apron.outfits.length === 1 ? 'outfit' : 'outfits'} · {views} of {frames} views
              uploaded
            </Text>
            {apron.outfits.map((o) => (
              <View key={o.outfit.code} style={styles.group}>
                <GroupHeader
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
                <View style={styles.grid}>
                  {o.slots.map((slot) => {
                    const key = `${apron.apron.code}-${o.outfit.code}-${slot.angle.code}`;
                    const slotLabels: UploadLabels = {
                      apron: apron.apron.code,
                      outfit: o.outfit.code,
                      angle: slot.angle.code,
                      practitioner_id: practitionerId,
                    };
                    return slot.asset ? (
                      <PhotoTile
                        key={key}
                        clinicId={clinicId}
                        asset={slot.asset}
                        label={slot.angle.label}
                        shape="portrait"
                        busy={busy === key}
                        onReplace={uploadDoctor(key, slotLabels, slot.asset)}
                      />
                    ) : (
                      <AddTile
                        key={key}
                        label={slot.angle.label}
                        shape="portrait"
                        busy={busy === key}
                        onPress={uploadDoctor(key, slotLabels)}
                      />
                    );
                  })}
                </View>
              </View>
            ))}
            {canUpload && apron.hasMoreOutfits ? (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setOutfitsShown((c) => ({ ...c, [apron.apron.code]: apron.outfits.length + 1 }))
                }
                style={({ pressed }) => [styles.addOutfit, pressed && styles.pressed]}
              >
                <View style={styles.addOutfitIcon}>
                  <Plus size={18} color={t.color.status.brand.fg} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.groupTitle}>Add outfit</Text>
                  <Text style={styles.hint}>Five fresh angles for a new outfit</Text>
                </View>
              </Pressable>
            ) : null}
          </>
        ) : null}
        {board.practitionerUnplaced.length > 0 ? (
          <View style={styles.group}>
            <GroupHeader title="Other photos" hint="No outfit or angle recorded" />
            <View style={styles.grid}>
              {board.practitionerUnplaced.map((asset) => (
                <PhotoTile
                  key={asset.id}
                  clinicId={clinicId}
                  asset={asset}
                  shape="portrait"
                  busy={busy === asset.id}
                  onReplace={uploadDoctor(asset.id, { practitioner_id: practitionerId }, asset)}
                />
              ))}
            </View>
          </View>
        ) : null}
        <Tips title="Shooting tips" tips={SHOOTING_TIPS} />
      </CollapsibleCard>

      <CollapsibleCard title="Hospital photos" subtitle="Clinic photos for your Google listing">
        <Text style={styles.intro}>
          These show on Google Maps beside your reviews. {CLINIC_PHOTO_TARGET} per category is the
          target. Swipe each row.
        </Text>
        {board.clinic.map((row) => (
          <View key={row.category.code} style={styles.group}>
            <GroupHeader
              title={row.category.label}
              hint={row.hint ?? ''}
              count={row.assets.length}
              target={CLINIC_PHOTO_TARGET}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.row}>
                {row.assets.map((asset) => (
                  <PhotoTile
                    key={asset.id}
                    clinicId={clinicId}
                    asset={asset}
                    shape="landscape"
                    busy={busy === asset.id}
                    onReplace={uploadClinic(asset.id, { category: row.category.code }, asset)}
                  />
                ))}
                {row.assets.length < CLINIC_PHOTO_TARGET ? (
                  <AddTile
                    label="Add"
                    shape="landscape"
                    busy={busy === row.category.code}
                    onPress={uploadClinic(row.category.code, { category: row.category.code })}
                  />
                ) : null}
              </View>
            </ScrollView>
          </View>
        ))}
        <View style={styles.group}>
          <GroupHeader
            title={LOGO_COVER_ROW.title}
            hint={LOGO_COVER_ROW.hint}
            count={[board.logo, board.cover].filter(Boolean).length}
            target={LOGO_COVER_ROW.target}
          />
          <View style={styles.row}>
            {board.logo ? (
              <PhotoTile
                clinicId={clinicId}
                asset={board.logo}
                label="Logo"
                shape="landscape"
                busy={busy === 'logo'}
                onReplace={uploadLogo('logo', {}, board.logo)}
              />
            ) : (
              <AddTile
                label="Logo"
                shape="landscape"
                busy={busy === 'logo'}
                onPress={uploadLogo('logo', {})}
              />
            )}
            {board.cover ? (
              <PhotoTile
                clinicId={clinicId}
                asset={board.cover}
                label="Cover"
                shape="landscape"
                busy={busy === 'cover'}
                onReplace={uploadCover}
              />
            ) : (
              <AddTile
                label="Cover"
                shape="landscape"
                busy={busy === 'cover'}
                onPress={uploadCover}
              />
            )}
          </View>
        </View>
        {board.clinicUnplaced.length > 0 ? (
          <View style={styles.group}>
            <GroupHeader title="Other photos" hint="No category recorded" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.row}>
                {board.clinicUnplaced.map((asset) => (
                  <PhotoTile
                    key={asset.id}
                    clinicId={clinicId}
                    asset={asset}
                    shape="landscape"
                    busy={busy === asset.id}
                    onReplace={uploadClinic(asset.id, {}, asset)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        ) : null}
      </CollapsibleCard>

      <CollapsibleCard title="Voice samples" subtitle="Recordings for your phone assistant">
        <VoiceSamples
          clinicId={clinicId}
          samples={board.voice}
          sampleTypes={labels.voiceSamples}
          playingId={playingId}
          onPlay={setPlayingId}
          canUpload={canUpload}
          busyId={busy}
          onUpload={uploadVoice}
        />
      </CollapsibleCard>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: t.space[4] },
  flex: { flex: 1 },
  intro: { ...textStyle('bodySm'), color: t.color.text.secondary },
  caption: { ...textStyle('bodySm'), color: t.color.text.tertiary },
  group: { gap: t.space[3] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space[2] },
  row: { flexDirection: 'row', gap: t.space[2] },
  groupTitle: { ...textStyle('label'), color: t.color.text.primary },
  hint: { ...textStyle('bodySm'), color: t.color.text.tertiary },
  addOutfit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space[3],
    padding: t.space[3],
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.color.border.subtle,
  },
  addOutfitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.color.status.brand.bg,
  },
  pressed: { opacity: 0.7 },
});
