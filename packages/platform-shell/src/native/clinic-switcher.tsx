import { tokens as t } from '@radial-pulse/design-tokens';
import { Modal, textStyle } from '@radial-pulse/ui/native';
import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useClinicSelection } from '../core/clinic-context';

/**
 * The selected clinic's name, opening a sheet to switch clinics. Only
 * interactive when the Clinic Administrator has more than one clinic; with
 * one clinic it is a plain label (architecture: ClinicSelectionProvider).
 */
export function ClinicSwitcher({ subtitle }: { subtitle?: (clinicId: string) => string | null }) {
  const { clinics, selectedClinic, hasMultipleClinics, selectClinic } = useClinicSelection();
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  if (!selectedClinic) return null;

  if (!hasMultipleClinics) {
    return <Text style={styles.name}>{selectedClinic.name}</Text>;
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Clinic: ${selectedClinic.name}. Switch clinic`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        hitSlop={8}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <Text style={styles.name} numberOfLines={1}>
          {selectedClinic.name}
        </Text>
        <ChevronDown size={18} color={t.color.text.secondary} />
      </Pressable>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Switch clinic"
        description="You manage more than one clinic. Everything in the app shows the clinic you pick."
        bottomInset={insets.bottom}
      >
        <View accessibilityRole="radiogroup">
          {clinics.map((clinic) => {
            const selected = clinic.id === selectedClinic.id;
            const detail = subtitle?.(clinic.id);
            return (
              <Pressable
                key={clinic.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => {
                  selectClinic(clinic.id);
                  setOpen(false);
                }}
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              >
                <View style={styles.optionText}>
                  <Text style={[styles.optionName, selected && styles.optionSelected]}>
                    {clinic.name}
                  </Text>
                  {detail ? <Text style={styles.optionDetail}>{detail}</Text> : null}
                </View>
                {selected ? <Check size={20} color={t.color.text.link} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: t.space[1],
    minHeight: t.size.touchTarget,
  },
  pressed: { opacity: 0.7 },
  name: { ...textStyle('bodyLg'), color: t.color.text.secondary, flexShrink: 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space[3],
    minHeight: t.size.touchTarget + t.space[2],
    paddingVertical: t.space[2],
    borderBottomWidth: 1,
    borderBottomColor: t.color.border.subtle,
  },
  optionText: { flex: 1, gap: 2 },
  optionName: { ...textStyle('bodyLg'), color: t.color.text.primary },
  optionSelected: { ...textStyle('h3'), color: t.color.text.link },
  optionDetail: { ...textStyle('bodySm'), color: t.color.text.tertiary },
});
