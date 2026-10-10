import { tokens as t } from '@radial-pulse/design-tokens';
import { LoadingState, textStyle } from '@radial-pulse/mobile-ui';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark } from './brand';

/** Whole-screen loading (session restore, first clinic load). */
export function FullScreenLoading({ label = 'Loading Radial Pulse…' }: { label?: string }) {
  return (
    <View style={styles.root}>
      <LoadingState label={label} />
    </View>
  );
}

/**
 * Whole-screen message with the brand mark: wrong app for this account, no
 * clinic access, session errors. `actions` are app-provided buttons.
 */
export function FullScreenMessage({
  title,
  description,
  icon,
  actions,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.body}>
        {icon ?? <BrandMark size={56} />}
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', backgroundColor: t.color.bg.app },
  body: { alignItems: 'center', gap: t.space[3], paddingHorizontal: t.space[8] },
  title: { ...textStyle('h1'), color: t.color.text.primary, textAlign: 'center' },
  description: { ...textStyle('bodyLg'), color: t.color.text.secondary, textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: t.space[3], marginTop: t.space[4] },
});
