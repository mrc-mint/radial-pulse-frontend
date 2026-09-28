import { tokens as t } from '@radial-pulse/design-tokens';
import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Horizontal gutter of every mobile screen. */
export const SCREEN_GUTTER = t.space[5];

/**
 * Space kept free at the bottom of tab screens so the last card clears the
 * floating chat button.
 */
export const FAB_CLEARANCE = 88;

/**
 * A mobile screen body: safe-area aware, scrolling, with pull-to-refresh when
 * `onRefresh` is given. Screens compose cards inside; the shell owns spacing.
 */
export function Screen({
  children,
  header,
  onRefresh,
  refreshing = false,
  topInset = true,
  fabClearance = true,
}: {
  children: ReactNode;
  /** Pinned above the scrolling content (e.g. tabs). */
  header?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** False when a navigation header already handles the top safe area. */
  topInset?: boolean;
  fabClearance?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, topInset && { paddingTop: insets.top }]}>
      {header ? <View style={styles.header}>{header}</View> : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (fabClearance ? FAB_CLEARANCE : t.space[6]) + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={t.color.action.primary.bg}
              colors={[t.color.action.primary.bg]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.color.bg.app },
  header: {
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: t.space[3],
    backgroundColor: t.color.bg.app,
  },
  scroll: { flex: 1 },
  content: { gap: t.space[4], paddingHorizontal: SCREEN_GUTTER, paddingTop: t.space[3] },
});
