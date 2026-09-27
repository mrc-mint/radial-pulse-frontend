import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import type { ControlSize, FieldBaseProps, SelectBaseProps } from '../shared';
import { Modal } from './overlay';
import { glyph, t, text, weight } from './theme';

function FieldFrame({
  label,
  hideLabel,
  hint,
  error,
  required,
  children,
}: FieldBaseProps & { children: ReactNode }) {
  return (
    <View style={styles.field}>
      {!hideLabel && (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      )}
      {children}
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

export interface InputProps extends FieldBaseProps, Omit<TextInputProps, 'editable' | 'style'> {
  size?: ControlSize;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function Input({
  label,
  hideLabel,
  hint,
  error,
  required,
  disabled,
  size = 'md',
  leading,
  trailing,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <FieldFrame {...{ label, hideLabel, hint, error, required }}>
      <View
        style={[
          styles.control,
          { minHeight: t.size.controlNative[size] },
          focused && styles.focused,
          Boolean(error) && styles.invalid,
          disabled && styles.disabledControl,
        ]}
      >
        {leading}
        <TextInput
          placeholderTextColor={t.color.text.disabled}
          {...rest}
          editable={!disabled}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          accessibilityState={{ disabled: Boolean(disabled) }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={styles.input}
        />
        {trailing}
      </View>
    </FieldFrame>
  );
}

export interface SelectProps<V extends string = string> extends SelectBaseProps<V> {
  size?: ControlSize;
  bottomInset?: number;
}

/** A field that opens a bottom sheet of options. */
export function Select<V extends string = string>({
  label,
  hideLabel,
  hint,
  error,
  required,
  disabled,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  size = 'md',
  bottomInset,
}: SelectProps<V>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <FieldFrame {...{ label, hideLabel, hint, error, required }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        accessibilityHint={error ?? hint}
        accessibilityState={{ disabled: Boolean(disabled), expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.control,
          { minHeight: t.size.controlNative[size] },
          pressed && styles.pressed,
          Boolean(error) && styles.invalid,
          disabled && styles.disabledControl,
        ]}
      >
        <Text
          style={[styles.input, styles.selectValue, !selected && styles.placeholder]}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Text style={styles.chevron}>{glyph.chevronDown}</Text>
      </Pressable>
      <Modal open={open} onClose={() => setOpen(false)} title={label} bottomInset={bottomInset}>
        <View accessibilityRole="radiogroup">
          {options.map((o) => {
            const isSelected = o.value === value;
            return (
              <Pressable
                key={o.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected, disabled: Boolean(o.disabled) }}
                disabled={o.disabled}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionSelected,
                    o.disabled && styles.optionDisabled,
                  ]}
                >
                  {o.label}
                </Text>
                {isSelected ? <Text style={styles.check}>{glyph.check}</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </FieldFrame>
  );
}

const styles = StyleSheet.create({
  field: { gap: t.space['1.5'] },
  label: { ...text('label'), color: t.color.text.primary },
  required: { color: t.color.status.danger.fg },
  hint: { ...text('caption'), color: t.color.text.tertiary },
  error: { ...text('caption'), color: t.color.status.danger.fg },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space[2],
    paddingHorizontal: t.space[4],
    borderWidth: 1,
    borderColor: t.color.border.default,
    borderRadius: t.radius.lg,
    backgroundColor: t.color.bg.surface,
  },
  focused: { borderColor: t.color.border.focus, boxShadow: t.shadow.focus },
  invalid: { borderColor: t.color.status.danger.solid },
  disabledControl: { backgroundColor: t.color.bg.muted, opacity: 0.7 },
  pressed: { backgroundColor: t.color.bg.hover },
  input: {
    flex: 1,
    ...text('bodyLg'),
    color: t.color.text.primary,
    paddingVertical: t.space[2],
  },
  selectValue: { paddingVertical: 0 },
  placeholder: { color: t.color.text.disabled },
  chevron: { ...text('bodyLg'), color: t.color.text.tertiary },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: t.size.touchTarget + t.space[2],
    paddingHorizontal: t.space[2],
    borderRadius: t.radius.md,
  },
  optionLabel: { ...text('bodyLg'), color: t.color.text.primary },
  optionSelected: { color: t.color.text.link, fontWeight: weight(t.font.weight.semibold) },
  optionDisabled: { color: t.color.text.disabled },
  check: { ...text('bodyLg'), color: t.color.text.link },
});
