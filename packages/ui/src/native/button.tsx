import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { ButtonBaseProps, ButtonVariant, ControlSize, IconButtonBaseProps } from '../shared';
import { t, text, font } from './theme';

const VARIANT = {
  primary: {
    bg: t.color.action.primary.bg,
    pressed: t.color.action.primary.bgActive,
    fg: t.color.action.primary.fg,
    border: 'transparent',
  },
  secondary: {
    bg: t.color.action.secondary.bg,
    pressed: t.color.action.secondary.bgActive,
    fg: t.color.action.secondary.fg,
    border: t.color.action.secondary.border,
  },
  ghost: {
    bg: 'transparent',
    pressed: t.color.action.ghost.bgActive,
    fg: t.color.action.ghost.fg,
    border: 'transparent',
  },
  danger: {
    bg: t.color.action.danger.bg,
    pressed: t.color.action.danger.bgActive,
    fg: t.color.action.danger.fg,
    border: 'transparent',
  },
} as const satisfies Record<
  ButtonVariant,
  { bg: string; pressed: string; fg: string; border: string }
>;

const HEIGHT: Record<ControlSize, number> = t.size.controlNative;

type NativePressable = Omit<PressableProps, 'children' | 'style' | 'disabled'> & {
  style?: StyleProp<ViewStyle>;
};

export interface ButtonProps extends ButtonBaseProps, NativePressable {}

/** Plain text children, including interpolations like `Connect {label}` (an array). */
function isTextContent(children: ReactNode): boolean {
  const parts = Array.isArray(children) ? children : [children];
  return parts.every((p) => typeof p === 'string' || typeof p === 'number');
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth,
  leadingIcon,
  trailingIcon,
  children,
  style,
  ...rest
}: ButtonProps) {
  const v = VARIANT[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      hitSlop={size === 'sm' ? 4 : undefined}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        {
          height: HEIGHT[size],
          paddingHorizontal: size === 'sm' ? t.space[3] : t.space[5],
          backgroundColor: pressed ? v.pressed : v.bg,
          borderColor: v.border,
        },
        variant === 'secondary' && styles.raised,
        fullWidth && styles.full,
        disabled && !loading && styles.disabled,
        style,
      ]}
    >
      {/* Content stays laid out while loading so the button keeps its width. */}
      {loading && <ActivityIndicator color={v.fg} size="small" style={styles.spinner} />}
      <View style={[styles.content, loading && styles.hidden]}>
        {leadingIcon}
        {isTextContent(children) ? (
          <Text
            style={[size === 'sm' ? styles.labelSm : styles.label, { color: v.fg }]}
            numberOfLines={1}
          >
            {children}
          </Text>
        ) : (
          children
        )}
        {trailingIcon}
      </View>
    </Pressable>
  );
}

export interface IconButtonProps extends IconButtonBaseProps, NativePressable {}

/** Square icon control; always at least the 44pt touch target. */
export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  disabled,
  style,
  ...rest
}: IconButtonProps) {
  const v = VARIANT[variant];
  const dimension = Math.max(HEIGHT[size], t.size.touchTarget);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        styles.icon,
        {
          width: dimension,
          height: dimension,
          backgroundColor: pressed ? v.pressed : v.bg,
          borderColor: v.border,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: t.radius.lg,
  },
  raised: { boxShadow: t.shadow.xs },
  icon: { paddingHorizontal: 0, borderRadius: t.radius.full },
  full: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'center', gap: t.space[2] },
  hidden: { opacity: 0 },
  spinner: { position: 'absolute' },
  label: { ...text('bodyLg'), ...font(t.font.weight.semibold) },
  labelSm: { ...text('label'), ...font(t.font.weight.semibold) },
});
