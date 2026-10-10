import { formatScore, NOT_AVAILABLE_LABEL } from '@radial-pulse/utils';
import { StyleSheet, Text, View } from 'react-native';
import {
  formatMetricValue,
  type MetricCardBaseProps,
  type ScoreCardBaseProps,
} from '@radial-pulse/ui-shared';
import { glyph, statusColors, t, text, font } from './theme';

const TREND_WORD = { up: 'Up', down: 'Down', flat: 'No change' } as const;

export type MetricCardProps = MetricCardBaseProps;

/** One backend-provided figure (followers, reach, profile views…). */
export function MetricCard({ label, value, icon, change, hint }: MetricCardProps) {
  const missing = value === null || value === undefined || value === '';
  const formatted = formatMetricValue(value);
  const tone = statusColors(change?.tone ?? 'neutral');
  const a11y = [
    `${label}: ${formatted}`,
    change && !missing ? `${TREND_WORD[change.direction]} ${change.label}` : null,
    change?.period && !missing ? change.period : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={styles.metric} accessible accessibilityLabel={a11y}>
      <View style={styles.metricTop}>
        <Text style={styles.metricLabel} numberOfLines={1}>
          {label}
        </Text>
        {icon}
      </View>
      <Text style={[styles.metricValue, missing && styles.metricMissing]} numberOfLines={1}>
        {formatted}
      </Text>
      {change && !missing ? (
        <View style={styles.changeRow}>
          <Text style={[styles.change, { color: tone.fg }]}>
            {glyph[change.direction]} {change.label}
          </Text>
          {change.period ? <Text style={styles.period}>{change.period}</Text> : null}
        </View>
      ) : null}
      {hint ? <Text style={styles.period}>{hint}</Text> : null}
    </View>
  );
}

export type ScoreCardProps = ScoreCardBaseProps;

/**
 * Overall (or section) assessment score as a large figure with a progress
 * bar. `not_available` reads "Not Available", never 0; tone comes from the caller.
 */
export function ScoreCard({
  label,
  score,
  emptyLabel = NOT_AVAILABLE_LABEL,
  max = 100,
  tone = 'brand',
  caption,
  comparison,
}: ScoreCardProps) {
  const available = score !== null;
  const fraction = score !== null ? Math.min(Math.max(score / max, 0), 1) : 0;
  const formatted = formatScore(score, emptyLabel);
  const colors = statusColors(tone);

  return (
    <View
      style={styles.score}
      accessible
      accessibilityLabel={`${label}: ${available ? `${formatted} out of ${max}` : formatted}`}
    >
      <Text style={styles.scoreLabel}>{label}</Text>
      {available ? (
        <Text style={styles.scoreFigure}>
          <Text style={styles.scoreValue}>{formatted}</Text>
          <Text style={styles.scoreMax}> / {max}</Text>
        </Text>
      ) : (
        <Text style={styles.scoreNa}>{formatted}</Text>
      )}
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${fraction * 100}%`, backgroundColor: colors.solid }]}
        />
      </View>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {comparison ? (
        <View style={styles.comparison}>
          <Text style={styles.comparisonLabel}>{comparison.label}</Text>
          <Text style={styles.comparisonValue}>
            {formatScore(comparison.score, comparison.emptyLabel)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const surface = {
  backgroundColor: t.color.bg.surface,
  borderWidth: 1,
  borderColor: t.color.border.default,
  borderRadius: t.radius.xl,
  boxShadow: t.shadow.xs,
} as const;

const styles = StyleSheet.create({
  metric: { ...surface, flex: 1, gap: t.space[1], padding: t.space[4] },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.space[2],
  },
  metricLabel: { ...text('label'), flexShrink: 1, color: t.color.text.secondary },
  metricValue: { ...text('metric'), color: t.color.text.primary, fontVariant: ['tabular-nums'] },
  metricMissing: { ...text('bodyLg'), color: t.color.text.tertiary, paddingVertical: t.space[1] },
  changeRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.space['1.5'] },
  change: { ...text('caption'), ...font(t.font.weight.semibold) },
  period: { ...text('caption'), color: t.color.text.tertiary },

  score: { ...surface, gap: t.space[3], padding: t.space[5] },
  scoreLabel: { ...text('h3'), color: t.color.text.primary },
  scoreFigure: { color: t.color.text.primary },
  scoreValue: { ...text('hero'), fontVariant: ['tabular-nums'] },
  scoreMax: { ...text('bodyLg'), color: t.color.text.tertiary },
  scoreNa: { ...text('h2'), color: t.color.text.tertiary },
  track: {
    height: 8,
    overflow: 'hidden',
    borderRadius: t.radius.full,
    backgroundColor: t.color.bg.muted,
  },
  fill: { height: '100%', borderRadius: t.radius.full },
  caption: { ...text('body'), color: t.color.text.secondary },
  comparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: t.space[2],
    paddingHorizontal: t.space[3],
    borderRadius: t.radius.md,
    backgroundColor: t.color.bg.subtle,
    borderWidth: 1,
    borderColor: t.color.border.subtle,
  },
  comparisonLabel: { ...text('body'), color: t.color.text.secondary },
  comparisonValue: { ...text('h3'), color: t.color.text.primary, fontVariant: ['tabular-nums'] },
});
