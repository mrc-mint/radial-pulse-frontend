import { isApiError } from '@radial-pulse/api-client';
import { tokens as t, type StatusTone } from '@radial-pulse/design-tokens';
import { ErrorState, fontStyle, Skeleton, textStyle } from '@radial-pulse/ui/native';
import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * App-level building blocks shared by the mobile screens (not design-system
 * primitives): API error display, section headings, list rows, callouts.
 */

/** ErrorState for a failed query, quoting the request id for support. */
export function QueryErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const api = isApiError(error) ? error : null;
  const final = api?.kind === 'not_found' || api?.kind === 'forbidden';
  return (
    <ErrorState
      title={api?.kind === 'not_found' ? 'Not available' : undefined}
      description={api?.message}
      requestId={api?.requestId}
      onRetry={final ? undefined : onRetry}
    />
  );
}

export function mutationErrorMessage(error: unknown): string | null {
  if (!error) return null;
  return isApiError(error) ? error.message : 'Something went wrong. Please try again.';
}

export function fieldErrors(error: unknown): Readonly<Record<string, string[]>> {
  return (isApiError(error) && error.fieldErrors) || {};
}

/** A destructive-action confirmation (native alert; `window.confirm` in the web preview). */
export function confirmAction(title: string, message: string, action: string): Promise<boolean> {
  if (Platform.OS === 'web')
    return Promise.resolve(
      window.confirm(`${title}

${message}`),
    );
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: action, style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {action}
    </View>
  );
}

/** A text link-style button (≥44pt tall) for "View all" and similar. */
export function TextLink({
  label,
  onPress,
  a11yLabel,
}: {
  label: string;
  onPress: () => void;
  a11yLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={a11yLabel ?? label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.textLink, pressed && styles.pressed]}
    >
      <Text style={styles.textLinkLabel}>{label}</Text>
    </Pressable>
  );
}

/** A tappable row inside a card: icon, title, optional subtitle and trailing content. */
export function ListRow({
  icon,
  title,
  subtitle,
  trailing,
  onPress,
  a11yLabel,
  last,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string | null;
  trailing?: ReactNode;
  onPress?: () => void;
  a11yLabel?: string;
  last?: boolean;
}) {
  const content = (
    <>
      {icon ? <View style={styles.rowIcon}>{icon}</View> : null}
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {onPress ? <ChevronRight size={18} color={t.color.text.disabled} /> : null}
    </>
  );
  const style = [styles.row, !last && styles.rowDivider];
  if (!onPress) return <View style={style}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? [title, subtitle].filter(Boolean).join(', ')}
      onPress={onPress}
      style={({ pressed }) => [...style, pressed && styles.rowPressed]}
    >
      {content}
    </Pressable>
  );
}

/** A soft round icon holder (brand tint by default). */
export function IconBubble({
  children,
  tone = 'brand',
  size = 40,
}: {
  children: ReactNode;
  tone?: StatusTone;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.bubble,
        { width: size, height: size, backgroundColor: t.color.status[tone].bg },
      ]}
    >
      {children}
    </View>
  );
}

export function Callout({ tone = 'info', children }: { tone?: StatusTone; children: ReactNode }) {
  const c = t.color.status[tone];
  return (
    <View
      style={[styles.callout, { backgroundColor: c.bg, borderColor: c.border }]}
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}
    >
      <Text style={[styles.calloutText, { color: c.fg }]}>{children}</Text>
    </View>
  );
}

/** Label / value pairs. Missing values read "Not provided". */
export function DefinitionList({ items }: { items: Array<[string, string | null | undefined]> }) {
  return (
    <View>
      {items.map(([term, value], i) => (
        <View key={term} style={[styles.defRow, i < items.length - 1 && styles.rowDivider]}>
          <Text style={styles.defTerm}>{term}</Text>
          <Text style={[styles.defValue, !value && styles.defMissing]} selectable>
            {value || 'Not provided'}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <View style={styles.skeleton}>
      <Skeleton width="45%" height={18} />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '70%' : '100%'} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: t.space[2],
  },
  sectionTitle: { ...textStyle('h3'), color: t.color.text.primary },
  textLink: { minHeight: t.size.touchTarget, justifyContent: 'center' },
  textLinkLabel: { ...textStyle('label'), ...fontStyle(600), color: t.color.text.link },
  pressed: { opacity: 0.6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space[3],
    minHeight: 56,
    paddingVertical: t.space[3],
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: t.color.border.subtle },
  rowPressed: { opacity: 0.7 },
  rowIcon: { alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { ...textStyle('body'), ...fontStyle(600), color: t.color.text.primary },
  rowSubtitle: { ...textStyle('bodySm'), color: t.color.text.tertiary },
  bubble: { alignItems: 'center', justifyContent: 'center', borderRadius: t.radius.full },
  callout: {
    padding: t.space[3],
    borderWidth: 1,
    borderRadius: t.radius.lg,
  },
  calloutText: { ...textStyle('body') },
  defRow: { gap: 2, paddingVertical: t.space[3] },
  defTerm: { ...textStyle('bodySm'), color: t.color.text.tertiary },
  defValue: { ...textStyle('body'), color: t.color.text.primary },
  defMissing: { color: t.color.text.disabled },
  skeleton: {
    gap: t.space[3],
    padding: t.space[4],
    borderRadius: t.radius.xl,
    borderWidth: 1,
    borderColor: t.color.border.default,
    backgroundColor: t.color.bg.surface,
  },
});
