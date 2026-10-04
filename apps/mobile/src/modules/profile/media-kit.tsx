import { useAssetDownloadUrl } from '@radial-pulse/api-client/react';
import { tokens as t } from '@radial-pulse/design-tokens';
import type { Schema } from '@radial-pulse/shared-types';
import { APPROVAL_STATE_TONES, Card, ProtectedImage, textStyle } from '@radial-pulse/ui/native';
import { mediaReviewLabel } from '@radial-pulse/utils';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Pencil,
  Plus,
  RotateCcw,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

type Asset = Schema<'AssetRead'>;
type ApprovalState = Schema<'ApprovalState'>;

/** Building blocks of the Media tab: collapsible cards, photo tiles, counters. */

const STATE_ICON: Record<ApprovalState, LucideIcon> = {
  draft: Clock,
  submitted: Clock,
  approved: Check,
  rejected: X,
  redo_requested: RotateCcw,
};

export function CollapsibleCard({
  title,
  subtitle,
  children,
  initiallyOpen = true,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}. ${subtitle}`}
        onPress={() => setOpen((o) => !o)}
        style={styles.cardHeader}
      >
        <View style={styles.cardHeading}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <Chevron size={20} color={t.color.text.secondary} />
      </Pressable>
      {open ? <View style={styles.cardBody}>{children}</View> : null}
    </Card>
  );
}

/** A row heading with a "2/3" counter. */
export function GroupHeader({
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
  const done = count !== undefined && target !== undefined && count >= target;
  const tone = t.color.status[done ? 'success' : 'warning'];
  return (
    <View style={styles.groupHeader}>
      <View style={styles.cardHeading}>
        <Text style={styles.groupTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{hint}</Text>
      </View>
      {target !== undefined ? (
        <View style={[styles.counter, { backgroundColor: tone.bg }]}>
          <Text style={[styles.counterText, { color: tone.fg }]}>
            {count ?? 0}/{target}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export type TileShape = 'portrait' | 'landscape';

/**
 * An uploaded photo: protected viewer, review status pip, slot label and a
 * pencil to replace it. There is no remove control: the contract has no
 * delete operation for clinic files.
 */
export function PhotoTile({
  clinicId,
  asset,
  label,
  shape,
  busy,
  onReplace,
}: {
  clinicId: string;
  asset: Asset;
  label?: string;
  shape: TileShape;
  busy?: boolean;
  onReplace?: () => void;
}) {
  const url = useAssetDownloadUrl(clinicId, asset.id);
  const Icon = STATE_ICON[asset.approval_state];
  const tone = t.color.status[APPROVAL_STATE_TONES[asset.approval_state]];
  const status = mediaReviewLabel(asset.approval_state, asset.kind);
  return (
    <View style={[styles.tile, shape === 'portrait' ? styles.portrait : styles.landscape]}>
      <ProtectedImage
        src={url.data?.url}
        alt={`${label ?? 'Photo'}: ${status}`}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[styles.pip, { backgroundColor: tone.bg }]}
        accessibilityLabel={status}
        accessible
      >
        <Icon size={12} color={tone.fg} />
      </View>
      {onReplace ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Replace ${label ?? 'photo'}`}
          onPress={onReplace}
          disabled={busy}
          hitSlop={6}
          style={styles.replace}
        >
          {busy ? (
            <ActivityIndicator size="small" color={t.color.text.secondary} />
          ) : (
            <Pencil size={14} color={t.color.text.primary} />
          )}
        </Pressable>
      ) : null}
      {label ? <Text style={styles.tileLabel}>{label}</Text> : null}
    </View>
  );
}

/** An empty frame: tap to upload (or a plain placeholder without upload rights). */
export function AddTile({
  label,
  shape,
  busy,
  onPress,
}: {
  label?: string;
  shape: TileShape;
  busy?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      {busy ? (
        <ActivityIndicator color={t.color.text.secondary} />
      ) : onPress ? (
        <Plus size={22} color={t.color.text.secondary} />
      ) : null}
      {label ? <Text style={[styles.tileLabel, styles.tileLabelEmpty]}>{label}</Text> : null}
    </>
  );
  const style = [
    styles.tile,
    styles.empty,
    shape === 'portrait' ? styles.portrait : styles.landscape,
  ];
  if (!onPress) return <View style={style}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ? `Upload ${label}` : 'Upload a photo'}
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [...style, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

/** Tips that expand under a section ("Shooting tips", "Best practices"). */
export function Tips({ title, tips }: { title: string; tips: ReadonlyArray<string> }) {
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <View style={styles.tips}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        style={styles.tipsHeader}
      >
        <Text style={styles.groupTitle}>{title}</Text>
        <Chevron size={18} color={t.color.text.secondary} />
      </Pressable>
      {open
        ? tips.map((tip) => (
            <Text key={tip} style={styles.tip}>
              • {tip}
            </Text>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: t.space[3] },
  cardHeading: { flex: 1, gap: t.space[0.5] },
  cardTitle: { ...textStyle('h3'), color: t.color.text.primary },
  cardSubtitle: { ...textStyle('bodySm'), color: t.color.text.tertiary },
  cardBody: { marginTop: t.space[4], gap: t.space[5] },
  groupHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: t.space[3] },
  groupTitle: { ...textStyle('label'), color: t.color.text.primary },
  counter: {
    paddingHorizontal: t.space[2],
    paddingVertical: t.space[0.5],
    borderRadius: t.radius.full,
  },
  counterText: { ...textStyle('caption') },
  tile: {
    overflow: 'hidden',
    borderRadius: t.radius.lg,
    backgroundColor: t.color.bg.subtle,
  },
  portrait: { width: '31%', aspectRatio: 3 / 4 },
  landscape: { width: 140, aspectRatio: 4 / 3 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: t.color.border.default,
  },
  pressed: { opacity: 0.7 },
  pip: {
    position: 'absolute',
    top: t.space[2],
    left: t.space[2],
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replace: {
    position: 'absolute',
    top: t.space[1.5],
    right: t.space[1.5],
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.color.bg.surface,
  },
  tileLabel: {
    position: 'absolute',
    left: t.space[2],
    bottom: t.space[2],
    ...textStyle('caption'),
    ...{ fontWeight: '600' as const },
    color: t.color.text.inverse,
  },
  tileLabelEmpty: { color: t.color.text.tertiary },
  tips: { gap: t.space[2] },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  tip: { ...textStyle('bodySm'), color: t.color.text.secondary },
});
