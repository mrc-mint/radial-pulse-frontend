import type { StatusTone } from '@radial-pulse/design-tokens';
import { formatScore, NOT_AVAILABLE_LABEL } from '@radial-pulse/utils';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { statusColors, t, text } from './theme';

export interface ScoreRingProps {
  /** Accessible name, e.g. "Overall Digital Presence Score". */
  label: string;
  /** Backend score. Null draws an empty ring with `emptyLabel`, never 0. */
  score: number | null;
  emptyLabel?: string;
  max?: number;
  /** Diameter in points. */
  size?: number;
  /** Visual tone supplied by the caller from backend data; never derived from the number. */
  tone?: StatusTone;
}

const STROKE = 10;

/** A backend score as a ring (mobile hero). Display only: the score is never computed here. */
export function ScoreRing({
  label,
  score,
  emptyLabel = NOT_AVAILABLE_LABEL,
  max = 100,
  size = 132,
  tone = 'brand',
}: ScoreRingProps) {
  const available = score !== null;
  const fraction = available ? Math.min(Math.max(score / max, 0), 1) : 0;
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const formatted = formatScore(score, emptyLabel);

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${label}: ${available ? `${formatted} out of ${max}` : formatted}`}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={t.color.bg.muted}
          strokeWidth={STROKE}
          fill="none"
        />
        {available && fraction > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={statusColors(tone).solid}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - fraction)}
            // Start at 12 o'clock.
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {available ? (
          <Text style={styles.figure}>
            <Text style={styles.value}>{formatted}</Text>
            <Text style={styles.max}>/{max}</Text>
          </Text>
        ) : (
          <Text style={styles.empty}>{formatted}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: STROKE + t.space[2],
  },
  figure: { color: t.color.text.primary },
  value: { ...text('display'), fontVariant: ['tabular-nums'] },
  max: { ...text('bodyLg'), color: t.color.text.tertiary },
  empty: { ...text('label'), color: t.color.text.tertiary, textAlign: 'center' },
});
