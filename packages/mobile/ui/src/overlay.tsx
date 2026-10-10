import { Modal as RNModal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ModalBaseProps } from '@radial-pulse/ui-shared';
import { IconButton } from './button';
import { glyph, t, text } from './theme';

export interface ModalProps extends ModalBaseProps {
  /**
   * Extra bottom padding for the home indicator. The app passes the safe-area
   * inset (react-native-safe-area-context is an app dependency, not a UI one).
   */
  bottomInset?: number;
}

/**
 * Bottom sheet — the native presentation of a modal (clinic switcher,
 * pickers, confirmations). Android back and the scrim both close it.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  bottomInset = 0,
}: ModalProps) {
  return (
    <RNModal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View
          style={[styles.sheet, { paddingBottom: t.space[6] + bottomInset }]}
          accessibilityViewIsModal
          aria-modal
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.heading}>
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
              {description ? <Text style={styles.description}>{description}</Text> : null}
            </View>
            <IconButton
              label="Close"
              icon={<Text style={styles.closeGlyph}>{glyph.close}</Text>}
              onPress={onClose}
            />
          </View>
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            bounces={false}
          >
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: t.color.overlay },
  sheet: {
    maxHeight: '88%',
    backgroundColor: t.color.bg.surface,
    borderTopLeftRadius: t.radius['2xl'],
    borderTopRightRadius: t.radius['2xl'],
    boxShadow: t.shadow.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    marginTop: t.space[2],
    borderRadius: t.radius.full,
    backgroundColor: t.color.border.strong,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.space[2],
    paddingLeft: t.space[5],
    paddingRight: t.space[2],
    paddingTop: t.space[3],
  },
  heading: { flex: 1, gap: t.space[1], paddingTop: t.space[2] },
  title: { ...text('h2'), color: t.color.text.primary },
  description: { ...text('body'), color: t.color.text.tertiary },
  closeGlyph: { ...text('bodyLg'), color: t.color.text.secondary },
  body: { flexGrow: 0 },
  bodyContent: { paddingHorizontal: t.space[5], paddingVertical: t.space[4] },
  footer: {
    flexDirection: 'row',
    gap: t.space[3],
    paddingHorizontal: t.space[5],
    paddingTop: t.space[3],
  },
});
