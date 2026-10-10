import { useAssetDownloadUrl } from '@radial-pulse/api-client-react';
import { tokens as t } from '@radial-pulse/design-tokens';
import type { Schema } from '@radial-pulse/shared-types';
import {
  APPROVAL_STATE_TONES,
  Badge,
  formatRelativeTime,
  textStyle,
} from '@radial-pulse/mobile-ui';
import { mediaReviewLabel, needsChanges, type MediaLabel } from '@radial-pulse/utils';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { AudioLines, Mic, Pause, Play, Plus, RefreshCw } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Tips } from './media-kit';

type Asset = Schema<'AssetRead'>;

const VOICE_TIPS = [
  'Record in a quiet room, away from fans, traffic and the reception area.',
  'Hold the phone about a hand’s width from your mouth.',
  'Speak naturally, at your usual pace, for a few minutes in total.',
  'Read the clinic greeting and a short passage about your services.',
];

/**
 * Voice samples: one upload button per sample type from the media taxonomy,
 * then one row per sample with its review status and the message from the
 * reviewer, playback, and re-upload when a re-record is asked.
 */
export function VoiceSamples({
  clinicId,
  samples,
  sampleTypes,
  playingId,
  onPlay,
  canUpload,
  busyId,
  onUpload,
}: {
  clinicId: string;
  samples: ReadonlyArray<{ asset: Asset; title: string }>;
  /** `voice_sample` values of the media taxonomy, in display order. */
  sampleTypes: ReadonlyArray<MediaLabel>;
  playingId: string | null;
  onPlay: (assetId: string | null) => void;
  canUpload: boolean;
  /** `new-<type>` while a new sample uploads, or the id of the sample being replaced. */
  busyId: string | null;
  onUpload: (category: string, replaces: Asset | null) => void;
}) {
  return (
    <View style={styles.list}>
      {canUpload ? (
        <View style={styles.drop}>
          <Mic size={22} color={t.color.text.secondary} />
          <Text style={styles.dropHint}>A few clear minutes of you speaking naturally.</Text>
          <View style={styles.types}>
            {sampleTypes.map((type) => (
              <Pressable
                key={type.code}
                accessibilityRole="button"
                accessibilityLabel={`Upload a ${type.label} recording`}
                onPress={() => onUpload(type.code, null)}
                disabled={busyId !== null}
                style={({ pressed }) => [styles.type, pressed && styles.pressed]}
              >
                {busyId === `new-${type.code}` ? (
                  <ActivityIndicator size="small" color={t.color.text.link} />
                ) : (
                  <Plus size={16} color={t.color.text.link} />
                )}
                <Text style={styles.dropTitle}>{type.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {samples.length === 0 ? (
        <Text style={styles.empty}>No voice samples yet.</Text>
      ) : (
        samples.map(({ asset, title }) => (
          <SampleRow
            key={asset.id}
            clinicId={clinicId}
            asset={asset}
            title={title}
            playing={playingId === asset.id}
            onPlay={() => onPlay(playingId === asset.id ? null : asset.id)}
            busy={busyId === asset.id}
            onReplace={
              canUpload && asset.category && needsChanges(asset.approval_state)
                ? () => onUpload(asset.category!, asset)
                : undefined
            }
          />
        ))
      )}

      <Tips title="Best practices for voice samples" tips={VOICE_TIPS} />
    </View>
  );
}

function SampleRow({
  clinicId,
  asset,
  title,
  playing,
  onPlay,
  busy,
  onReplace,
}: {
  clinicId: string;
  asset: Asset;
  title: string;
  playing: boolean;
  onPlay: () => void;
  busy: boolean;
  onReplace?: () => void;
}) {
  const tone = APPROVAL_STATE_TONES[asset.approval_state];
  const note = asset.review?.clinic_message ?? null;
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: t.color.status[tone].bg }]}>
        <AudioLines size={22} color={t.color.status[tone].fg} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Badge tone={tone} size="sm">
          {mediaReviewLabel(asset.approval_state, asset.kind)}
        </Badge>
        <Text style={styles.meta}>
          {note ?? `Uploaded ${formatRelativeTime(asset.created_at)}`}
        </Text>
        <View style={styles.actions}>
          {playing ? (
            <Player clinicId={clinicId} assetId={asset.id} title={title} onStop={onPlay} />
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Play ${title}`}
              onPress={onPlay}
              style={styles.action}
            >
              <Play size={16} color={t.color.text.link} />
              <Text style={styles.actionText}>Play</Text>
            </Pressable>
          )}
          {onReplace ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Upload a new recording of ${title}`}
              onPress={onReplace}
              disabled={busy}
              style={styles.action}
            >
              {busy ? (
                <ActivityIndicator size="small" color={t.color.text.link} />
              ) : (
                <RefreshCw size={16} color={t.color.text.link} />
              )}
              <Text style={styles.actionText}>Re-upload</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/** Plays one sample from its short-lived URL (mounted only while playing). */
function Player({
  clinicId,
  assetId,
  title,
  onStop,
}: {
  clinicId: string;
  assetId: string;
  title: string;
  onStop: () => void;
}) {
  const url = useAssetDownloadUrl(clinicId, assetId);
  if (!url.data) {
    return url.isError ? (
      <Text style={styles.meta}>This recording could not be loaded.</Text>
    ) : (
      <ActivityIndicator size="small" color={t.color.text.link} />
    );
  }
  return <LoadedPlayer uri={url.data.url} title={title} onStop={onStop} />;
}

function LoadedPlayer({ uri, title, onStop }: { uri: string; title: string; onStop: () => void }) {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);
  const playing = status.playing;
  const toggle = () => {
    if (playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration)) {
      void player.seekTo(0);
    }
    player.play();
  };
  return (
    <View style={styles.actions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playing ? `Pause ${title}` : `Play ${title}`}
        onPress={toggle}
        style={styles.action}
      >
        {playing ? (
          <Pause size={16} color={t.color.text.link} />
        ) : (
          <Play size={16} color={t.color.text.link} />
        )}
        <Text style={styles.actionText}>
          {playing ? 'Pause' : 'Play'}
          {status.duration > 0
            ? ` · ${Math.round(status.currentTime)}/${Math.round(status.duration)}s`
            : ''}
        </Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onStop} style={styles.action}>
        <Text style={styles.actionText}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: t.space[3] },
  types: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: t.space[2] },
  type: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space[1],
    minHeight: 40,
    paddingHorizontal: t.space[3],
    borderRadius: t.radius.full,
    borderWidth: 1,
    borderColor: t.color.border.default,
    backgroundColor: t.color.bg.surface,
  },
  drop: {
    alignItems: 'center',
    gap: t.space[1],
    padding: t.space[5],
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: t.color.border.strong,
    backgroundColor: t.color.bg.subtle,
  },
  pressed: { opacity: 0.7 },
  dropTitle: { ...textStyle('label'), color: t.color.text.link },
  dropHint: { ...textStyle('bodySm'), color: t.color.text.tertiary, textAlign: 'center' },
  empty: { ...textStyle('bodySm'), color: t.color.text.tertiary },
  row: {
    flexDirection: 'row',
    gap: t.space[3],
    padding: t.space[3],
    borderRadius: t.radius.lg,
    backgroundColor: t.color.bg.subtle,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: t.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: t.space[1], alignItems: 'flex-start' },
  title: { ...textStyle('label'), color: t.color.text.primary },
  meta: { ...textStyle('bodySm'), color: t.color.text.secondary },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space[4] },
  action: { flexDirection: 'row', alignItems: 'center', gap: t.space[1], minHeight: 36 },
  actionText: { ...textStyle('label'), color: t.color.text.link },
});
