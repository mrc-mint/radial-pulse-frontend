import type { UploadFile } from '@radial-pulse/api-client';
import {
  useClinic,
  useClinicApprovals,
  useClinicAssets,
  useSetClinicPhoto,
  useUploadAsset,
} from '@radial-pulse/api-client/react';
import { tokens as t } from '@radial-pulse/design-tokens';
import { useClinicCan, useClinicId } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import { Tabs, textStyle } from '@radial-pulse/ui/native';
import {
  approvalForResource,
  buildMediaBoard,
  CLINIC_PHOTO_CATEGORIES,
  DOCTOR_PHOTO_OUTFITS,
  MEDIA_ASSET_KINDS,
  type DoctorPhotoOutfit,
} from '@radial-pulse/utils';
import { Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Callout, CardSkeleton, mutationErrorMessage, QueryErrorState } from '../../shell/kit';
import { AddTile, CollapsibleCard, GroupHeader, PhotoTile, Tips } from './media-kit';
import { pickAudio, pickPhoto } from './pick-media';
import { VoiceSamples } from './voice-samples';

type Asset = Schema<'AssetRead'>;

const SHOOTING_TIPS = [
  'Use daylight from a window in front of you; avoid harsh overhead light.',
  'Plain, uncluttered background; stand about two metres away.',
  'Hold the phone at eye level, in portrait orientation.',
  'Turn for each angle: 90° and 45° to the left, straight on, then 45° and 90° to the right.',
];

/**
 * Profile → Media (Clinic Administrator): doctor photos by outfit and angle,
 * hospital photos by category and voice samples, laid out as in the product
 * reference. The Clinic Administrator uploads and replaces; reviewing belongs
 * to Radial Pulse staff on the web, so there are no review controls here.
 *
 * The contract has no angle, outfit or category fields yet (backend gap 20):
 * uploads are stored with their kind only and appear under "Uploaded …" until
 * the backend can place them. Outfit frames added here are layout only.
 */
export function MediaSection() {
  const clinicId = useClinicId();
  const canUpload = useClinicCan(clinicId, 'assets:upload');
  const canSetCover = useClinicCan(clinicId, 'clinics:write');
  const clinic = useClinic(clinicId);
  const assets = useClinicAssets(clinicId, MEDIA_ASSET_KINDS);
  const approvals = useClinicApprovals(clinicId);
  const upload = useUploadAsset(clinicId);
  const setCover = useSetClinicPhoto(clinicId);
  const [outfit, setOutfit] = useState<DoctorPhotoOutfit>('with_apron');
  const [outfitCounts, setOutfitCounts] = useState<Partial<Record<DoctorPhotoOutfit, number>>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const board = useMemo(
    () =>
      assets.data && clinic.data
        ? buildMediaBoard(assets.data, { coverAssetId: clinic.data.cover_asset_id }, outfitCounts)
        : null,
    [assets.data, clinic.data, outfitCounts],
  );
  const notes = useMemo(() => {
    const map = new Map<string, string>();
    for (const asset of assets.data ?? []) {
      const comment = approvalForResource(approvals.data?.items ?? [], asset.id)?.last_comment;
      if (comment) map.set(asset.id, comment);
    }
    return map;
  }, [assets.data, approvals.data]);

  if (assets.isError || clinic.isError) {
    return (
      <QueryErrorState
        error={assets.error ?? clinic.error}
        onRetry={() => void Promise.all([assets.refetch(), clinic.refetch()])}
      />
    );
  }
  if (!board) return <CardSkeleton lines={6} />;

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
  const uploadPhoto = (
    key: string,
    kind: 'practitioner_photo' | 'clinic_photo' | 'logo',
    replaces?: Asset | null,
  ) =>
    canUpload
      ? () =>
          void run(key, pickPhoto, (file) =>
            upload.mutateAsync({ kind, file, replaces: replaces?.id }),
          )
      : undefined;
  const uploadCover = (key: string) =>
    canUpload && canSetCover
      ? () => void run(key, pickPhoto, (file) => setCover.mutateAsync(file))
      : undefined;
  const uploadVoice = (replaces: Asset | null) =>
    void run(replaces?.id ?? 'new', pickAudio, (file) =>
      upload.mutateAsync({ kind: 'audio', file, replaces: replaces?.id }),
    );

  const outfits = board.doctor[outfit];
  const outfitLabel = DOCTOR_PHOTO_OUTFITS.find((o) => o.id === outfit)!.label;
  const views = outfits.reduce((n, o) => n + o.uploaded, 0);
  const frames = outfits.length * 5;

  return (
    <View style={styles.stack}>
      {error ? <Callout tone="danger">{mutationErrorMessage(error)}</Callout> : null}

      <CollapsibleCard title="Doctor photos" subtitle="Five angles per outfit, apron and non-apron">
        <Text style={styles.intro}>
          {canUpload
            ? 'Five fixed angles per outfit. Tap a frame to upload, the pencil to replace.'
            : 'Five fixed angles per outfit.'}
        </Text>
        <Tabs
          label="Outfit"
          value={outfit}
          onChange={setOutfit}
          items={DOCTOR_PHOTO_OUTFITS.map((o) => ({ value: o.id, label: o.label }))}
        />
        <Text style={styles.caption}>
          {outfitLabel} · {outfits.length} {outfits.length === 1 ? 'outfit' : 'outfits'} · {views}{' '}
          of {frames} views uploaded
        </Text>
        {outfits.map((o) => (
          <View key={o.number} style={styles.group}>
            <GroupHeader
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
            <View style={styles.grid}>
              {o.slots.map((slot) => {
                const key = `${outfit}-${o.number}-${slot.angle}`;
                return slot.asset ? (
                  <PhotoTile
                    key={key}
                    clinicId={clinicId}
                    asset={slot.asset}
                    label={slot.label}
                    shape="portrait"
                    busy={busy === key}
                    onReplace={uploadPhoto(key, 'practitioner_photo', slot.asset)}
                  />
                ) : (
                  <AddTile
                    key={key}
                    label={slot.label}
                    shape="portrait"
                    busy={busy === key}
                    onPress={uploadPhoto(key, 'practitioner_photo')}
                  />
                );
              })}
            </View>
          </View>
        ))}
        {canUpload ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setOutfitCounts((c) => ({ ...c, [outfit]: outfits.length + 1 }))}
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
        {board.doctorUnplaced.length > 0 ? (
          <View style={styles.group}>
            <GroupHeader title="Uploaded photos" hint="Not yet matched to an outfit and angle" />
            <View style={styles.grid}>
              {board.doctorUnplaced.map((asset) => (
                <PhotoTile
                  key={asset.id}
                  clinicId={clinicId}
                  asset={asset}
                  shape="portrait"
                  busy={busy === asset.id}
                  onReplace={uploadPhoto(asset.id, 'practitioner_photo', asset)}
                />
              ))}
            </View>
          </View>
        ) : null}
        <Tips title="Shooting tips" tips={SHOOTING_TIPS} />
      </CollapsibleCard>

      <CollapsibleCard title="Hospital photos" subtitle="Clinic photos for your Google listing">
        <Text style={styles.intro}>
          These show on Google Maps beside your reviews. Three per category is the target. Swipe
          each row.
        </Text>
        {CLINIC_PHOTO_CATEGORIES.map((category) => {
          const row = board.clinic.find((c) => c.id === category.id)!;
          return (
            <View key={category.id} style={styles.group}>
              <GroupHeader
                title={category.title}
                hint={category.hint}
                count={row.assets.length}
                target={category.target}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.row}>
                  {category.id === 'logo_cover' ? (
                    <>
                      {board.logo ? (
                        <PhotoTile
                          clinicId={clinicId}
                          asset={board.logo}
                          label="Logo"
                          shape="landscape"
                          busy={busy === 'logo'}
                          onReplace={uploadPhoto('logo', 'logo', board.logo)}
                        />
                      ) : (
                        <AddTile
                          label="Logo"
                          shape="landscape"
                          busy={busy === 'logo'}
                          onPress={uploadPhoto('logo', 'logo')}
                        />
                      )}
                      {board.cover ? (
                        <PhotoTile
                          clinicId={clinicId}
                          asset={board.cover}
                          label="Cover"
                          shape="landscape"
                          busy={busy === 'cover'}
                          onReplace={uploadCover('cover')}
                        />
                      ) : (
                        <AddTile
                          label="Cover"
                          shape="landscape"
                          busy={busy === 'cover'}
                          onPress={uploadCover('cover')}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {row.assets.map((asset) => (
                        <PhotoTile
                          key={asset.id}
                          clinicId={clinicId}
                          asset={asset}
                          shape="landscape"
                          busy={busy === asset.id}
                          onReplace={uploadPhoto(asset.id, 'clinic_photo', asset)}
                        />
                      ))}
                      {row.assets.length < category.target ? (
                        <AddTile
                          label="Add"
                          shape="landscape"
                          busy={busy === category.id}
                          onPress={uploadPhoto(category.id, 'clinic_photo')}
                        />
                      ) : null}
                    </>
                  )}
                </View>
              </ScrollView>
            </View>
          );
        })}
        {board.clinicUnplaced.length > 0 ? (
          <View style={styles.group}>
            <GroupHeader title="Uploaded photos" hint="Not yet sorted into a category" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.row}>
                {board.clinicUnplaced.map((asset) => (
                  <PhotoTile
                    key={asset.id}
                    clinicId={clinicId}
                    asset={asset}
                    shape="landscape"
                    busy={busy === asset.id}
                    onReplace={uploadPhoto(asset.id, 'clinic_photo', asset)}
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
          notes={notes}
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
