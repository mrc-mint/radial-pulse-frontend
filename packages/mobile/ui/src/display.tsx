import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  avatarToneFor,
  getInitials,
  type AvatarBaseProps,
  type BadgeBaseProps,
  type CardBaseProps,
  type PageHeaderBaseProps,
  type TabsBaseProps,
} from '@radial-pulse/ui-shared';
import { statusColors, t, text, font } from './theme';

// ── Card ────────────────────────────────────────────────────────────────────

export interface CardProps extends CardBaseProps {
  /** Makes the whole card a button (e.g. a platform tile that opens detail). */
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const CARD_PADDING = { none: 0, sm: t.space[3], md: t.space[4], lg: t.space[5] } as const;

export function Card({
  title,
  description,
  actions,
  padding = 'md',
  children,
  onPress,
  accessibilityLabel,
  style,
}: CardProps) {
  const content = (
    <>
      {(title || actions) && (
        <View style={styles.cardHeader}>
          <View style={styles.cardHeading}>
            {title ? (
              <Text style={styles.cardTitle} accessibilityRole="header">
                {title}
              </Text>
            ) : null}
            {description ? <Text style={styles.cardDescription}>{description}</Text> : null}
          </View>
          {actions}
        </View>
      )}
      {children}
    </>
  );
  const base = [styles.card, { padding: CARD_PADDING[padding] }, style];

  if (!onPress) return <View style={base}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [...base, pressed && styles.cardPressed]}
    >
      {content}
    </Pressable>
  );
}

// ── Badge ───────────────────────────────────────────────────────────────────

export type BadgeProps = BadgeBaseProps;

export function Badge({ tone = 'neutral', dot, size = 'md', children }: BadgeProps) {
  const c = statusColors(tone);
  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        { backgroundColor: c.bg, borderColor: c.border },
      ]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: c.solid }]} /> : null}
      <Text style={[styles.badgeText, { color: c.fg }]}>{children}</Text>
    </View>
  );
}

// ── Avatar ──────────────────────────────────────────────────────────────────

export interface AvatarProps extends AvatarBaseProps {
  decorative?: boolean;
}

export function Avatar({ name, src, size = 'md', decorative }: AvatarProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const dimension = t.size.avatar[size];
  const showImage = Boolean(src) && failed !== src;
  return (
    <View
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : name}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'auto'}
      style={[
        styles.avatar,
        {
          width: dimension,
          height: dimension,
          backgroundColor: t.color.avatar[avatarToneFor(name)],
        },
      ]}
    >
      {showImage && src ? (
        <Image
          source={{ uri: src }}
          style={StyleSheet.absoluteFill}
          onError={() => setFailed(src)}
        />
      ) : (
        <Text style={[styles.avatarText, size === 'lg' && styles.avatarTextLg]}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}

// ── Tabs (segmented control) ────────────────────────────────────────────────

export interface TabsProps<V extends string = string> extends TabsBaseProps<V> {
  /**
   * `segmented` (default) fits a few tabs in one row; `scroll` is a
   * horizontally scrolling underline bar for longer lists.
   */
  variant?: 'segmented' | 'scroll';
}

/** In-screen tabs: a segmented control, or a scrolling underline bar. */
export function Tabs<V extends string = string>({ variant = 'segmented', ...props }: TabsProps<V>) {
  return variant === 'scroll' ? <ScrollTabs {...props} /> : <SegmentedTabs {...props} />;
}

function ScrollTabs<V extends string>({ label, items, value, onChange }: TabsBaseProps<V>) {
  const scroller = useRef<ScrollView>(null);
  const offsets = useRef(new Map<V, number>());
  const reveal = (x: number, animated: boolean) =>
    scroller.current?.scrollTo({ x: Math.max(0, x - t.space[4]), animated });

  // Keep the selected tab in view when it changes from outside (e.g. a link).
  useEffect(() => {
    const x = offsets.current.get(value);
    if (x !== undefined) reveal(x, true);
  }, [value]);

  return (
    <View style={styles.scrollTabs}>
      <ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollTabsContent}
        accessibilityRole="tablist"
        accessibilityLabel={label}
      >
        {items.map((item) => {
          const selected = item.value === value;
          return (
            <Pressable
              key={item.value}
              accessibilityRole="tab"
              accessibilityState={{ selected, disabled: Boolean(item.disabled) }}
              disabled={item.disabled}
              onPress={() => onChange(item.value)}
              onLayout={(e) => {
                const { x } = e.nativeEvent.layout;
                offsets.current.set(item.value, x);
                // Opened on a tab further along: show it once it is measured.
                if (selected) reveal(x, false);
              }}
              style={styles.scrollTab}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.scrollTabText,
                  selected && styles.scrollTabTextSelected,
                  item.disabled && styles.segmentTextDisabled,
                ]}
              >
                {item.label}
                {item.count !== undefined ? ` ${item.count.toLocaleString()}` : ''}
              </Text>
              <View style={[styles.scrollTabBar, selected && styles.scrollTabBarSelected]} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function SegmentedTabs<V extends string>({ label, items, value, onChange }: TabsBaseProps<V>) {
  return (
    <View style={styles.segmented} accessibilityRole="tablist" accessibilityLabel={label}>
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled: Boolean(item.disabled) }}
            disabled={item.disabled}
            onPress={() => onChange(item.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.segmentText,
                selected && styles.segmentTextSelected,
                item.disabled && styles.segmentTextDisabled,
              ]}
            >
              {item.label}
              {item.count !== undefined ? ` ${item.count.toLocaleString()}` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── PageHeader ──────────────────────────────────────────────────────────────

export type PageHeaderProps = PageHeaderBaseProps;

/** Large-title screen header. `back` and `actions` are app-provided controls. */
export function PageHeader({ title, description, actions, back }: PageHeaderProps) {
  return (
    <View style={styles.pageHeader}>
      {back || actions ? (
        <View style={styles.pageHeaderBar}>
          <View>{back}</View>
          <View style={styles.pageHeaderActions}>{actions}</View>
        </View>
      ) : null}
      <Text style={styles.pageTitle} accessibilityRole="header">
        {title}
      </Text>
      {description ? <Text style={styles.pageDescription}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: t.space[3],
    backgroundColor: t.color.bg.surface,
    borderWidth: 1,
    borderColor: t.color.border.default,
    borderRadius: t.radius.xl,
    boxShadow: t.shadow.xs,
  },
  cardPressed: { backgroundColor: t.color.bg.hover },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: t.space[3] },
  cardHeading: { flex: 1, gap: t.space['0.5'] },
  cardTitle: { ...text('h3'), color: t.color.text.primary },
  cardDescription: { ...text('bodySm'), color: t.color.text.tertiary },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: t.space['1.5'],
    height: 24,
    paddingHorizontal: t.space[2],
    borderWidth: 1,
    borderRadius: t.radius.full,
  },
  badgeSm: { height: 20, paddingHorizontal: t.space['1.5'] },
  dot: { width: 6, height: 6, borderRadius: t.radius.full },
  badgeText: { ...text('caption'), ...font(t.font.weight.medium) },

  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: t.radius.full,
  },
  avatarText: {
    ...text('caption'),
    color: t.color.text.inverse,
    ...font(t.font.weight.semibold),
  },
  avatarTextLg: { ...text('bodyLg'), ...font(t.font.weight.semibold) },

  segmented: {
    flexDirection: 'row',
    padding: t.space['0.5'],
    borderRadius: t.radius.lg,
    backgroundColor: t.color.bg.muted,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: t.size.controlNative.sm,
    paddingHorizontal: t.space[2],
    borderRadius: t.radius.md,
  },
  segmentSelected: { backgroundColor: t.color.bg.surface, boxShadow: t.shadow.sm },
  segmentText: {
    ...text('label'),
    color: t.color.text.secondary,
  },
  segmentTextSelected: { color: t.color.text.primary, ...font(t.font.weight.semibold) },
  segmentTextDisabled: { color: t.color.text.disabled },

  scrollTabs: { borderBottomWidth: 1, borderBottomColor: t.color.border.default },
  scrollTabsContent: { gap: t.space[5] },
  scrollTab: { justifyContent: 'flex-end', minHeight: t.size.touchTarget },
  scrollTabText: {
    ...text('label'),
    color: t.color.text.tertiary,
    paddingBottom: t.space[2],
  },
  scrollTabTextSelected: { ...font(t.font.weight.semibold), color: t.color.text.link },
  scrollTabBar: { height: 2, borderRadius: t.radius.full, backgroundColor: 'transparent' },
  scrollTabBarSelected: { backgroundColor: t.color.action.primary.bg },

  pageHeader: { gap: t.space[1], paddingBottom: t.space[2] },
  pageHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: t.size.touchTarget,
  },
  pageHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: t.space[1] },
  pageTitle: { ...text('display'), color: t.color.text.primary },
  pageDescription: { ...text('bodyLg'), color: t.color.text.tertiary },
});
