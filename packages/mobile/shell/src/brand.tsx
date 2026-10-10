import { tokens as t } from '@radial-pulse/design-tokens';
import { fontStyle } from '@radial-pulse/mobile-ui';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/** Radial Pulse mark: concentric pulse rings (same geometry as the web mark). */
export function BrandMark({ size = 32 }: { size?: number }) {
  const brand = t.color.status.brand.solid;
  const accent = t.color.status.success.solid;
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx={16} cy={16} r={14} stroke={brand} strokeOpacity={0.35} strokeWidth={3} />
      <Path d="M16 2a14 14 0 0 1 14 14" stroke={accent} strokeWidth={3} strokeLinecap="round" />
      <Circle cx={16} cy={16} r={8} stroke={brand} strokeWidth={3} />
      <Circle cx={16} cy={16} r={3} fill={accent} />
    </Svg>
  );
}

/** Stacked brand lockup for the welcome and sign-in screens. */
export function BrandLockup({ size = 72 }: { size?: number }) {
  return (
    <View
      style={styles.lockup}
      accessible
      accessibilityRole="header"
      accessibilityLabel="Radial Pulse"
    >
      <BrandMark size={size} />
      <Text style={styles.name}>Radial Pulse</Text>
      <Text style={styles.tagline}>Grow Clinics. Greater Impact.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: { alignItems: 'center', gap: t.space[1] },
  name: {
    marginTop: t.space[2],
    ...fontStyle(700),
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
    color: t.color.bg.inverse,
  },
  tagline: {
    ...fontStyle(500),
    fontSize: 13,
    lineHeight: 18,
    color: t.color.text.secondary,
  },
});
