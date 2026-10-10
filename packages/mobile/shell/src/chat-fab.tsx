import { tokens as t } from '@radial-pulse/design-tokens';
import { fontStyle } from '@radial-pulse/mobile-ui';
import { MessageCircle } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const SIZE = 56;

/**
 * Floating chat button (V1: chat is a modal, never a tab). `unread` comes
 * from the API's chat inbox; the badge is hidden at 0.
 */
export function ChatFab({
  onPress,
  unread = 0,
  bottom,
}: {
  onPress: () => void;
  unread?: number;
  /** Distance from the bottom edge (above the tab bar). */
  bottom: number;
}) {
  const label =
    unread > 0
      ? `Chat with your Digital Success Manager, ${unread} unread`
      : 'Chat with your Digital Success Manager';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.fab, { bottom }, pressed && styles.pressed]}
    >
      <MessageCircle size={26} color={t.color.text.onAction} strokeWidth={2} />
      {unread > 0 ? (
        <View style={styles.badge} importantForAccessibility="no-hide-descendants">
          <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: t.space[5],
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
    backgroundColor: t.color.action.primary.bg,
    boxShadow: t.shadow.lg,
  },
  pressed: { backgroundColor: t.color.action.primary.bgActive },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
    borderWidth: 2,
    borderColor: t.color.bg.surface,
    backgroundColor: t.color.status.danger.solid,
  },
  badgeText: { ...fontStyle(700), fontSize: 11, lineHeight: 14, color: t.color.text.inverse },
});
