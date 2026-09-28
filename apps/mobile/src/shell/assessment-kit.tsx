import { tokens as t } from '@radial-pulse/design-tokens';
import type { Schema } from '@radial-pulse/shared-types';
import {
  COMPONENT_STATUS_TONES,
  FINDING_PRIORITY_TONES,
  fontStyle,
  formatDate,
  ScoreRing,
  textStyle,
} from '@radial-pulse/ui/native';
import {
  ASSESSMENT_COMPONENT_LABELS,
  FINDING_PRIORITY_LABELS,
  formatComponentScore,
  overallScoreEmptyLabel,
  showsComponentScore,
} from '@radial-pulse/utils';
import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COMPONENT_ICONS } from './icons';
import { IconBubble } from './kit';

/**
 * Presentation of the contract's assessment for the mobile screens (Home,
 * Insights, Reports). Everything shown is backend data: scores are never
 * computed, missing scores read their status, never 0.
 */

type Assessment = Schema<'AssessmentRead'>;
type Component = Schema<'ComponentDetail'>;
type Finding = Schema<'FindingRead'>;
export type ComponentKey = Schema<'AssessmentComponentKey'>;

/**
 * Clinic-facing explanation of a component without a score. The contract's
 * `status_reason` is a backend code (e.g. `no_engine_deployed`) with no
 * published list, so it is never shown; the status decides the copy.
 */
const STATUS_CAPTION: Readonly<Record<Schema<'ComponentStatus'>, string | null>> = {
  completed: null,
  pending: 'This part of your assessment is still in progress.',
  failed: 'This part of your assessment couldn’t be completed this time.',
  not_available: 'This part of your assessment isn’t available yet.',
};

/** Caption for a component card: the backend summary, else the status explanation. */
export function componentCaption(component: Pick<Component, 'summary' | 'status'>) {
  return component.summary ?? STATUS_CAPTION[component.status] ?? undefined;
}

export function publishedLabel(assessment: Pick<Assessment, 'published_at' | 'completed_at'>) {
  const date = assessment.published_at ?? assessment.completed_at;
  return date ? `Published ${formatDate(date)}` : 'Published';
}

/** The overall score as a ring beside its date and the backend summary. */
export function ScoreHero({ assessment, action }: { assessment: Assessment; action?: ReactNode }) {
  return (
    <View style={styles.hero}>
      <ScoreRing
        label="Overall Digital Presence Score"
        score={assessment.overall_score}
        emptyLabel={overallScoreEmptyLabel(assessment.status)}
      />
      <View style={styles.heroText}>
        <Text style={styles.heroMeta}>{publishedLabel(assessment)}</Text>
        {assessment.summary ? (
          <Text style={styles.heroSummary} numberOfLines={5}>
            {assessment.summary}
          </Text>
        ) : null}
        {action}
      </View>
    </View>
  );
}

/** One assessment component: icon, name and its score or status. */
export function ComponentTile({
  component,
  onPress,
}: {
  component: Component;
  onPress: () => void;
}) {
  const Icon = COMPONENT_ICONS[component.key];
  const label = ASSESSMENT_COMPONENT_LABELS[component.key];
  const scored = component.status === 'completed' && component.score !== null;
  const value = formatComponentScore(component);
  const tone = COMPONENT_STATUS_TONES[component.status];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${scored ? `${value} out of 100` : value}`}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <IconBubble tone={tone} size={36}>
        <Icon size={18} color={t.color.status[tone].fg} />
      </IconBubble>
      <Text style={styles.tileLabel} numberOfLines={2}>
        {label}
      </Text>
      {scored ? (
        <Text style={styles.tileScore}>
          {value}
          <Text style={styles.tileMax}>/100</Text>
        </Text>
      ) : (
        <Text style={styles.tileStatus}>{value}</Text>
      )}
    </Pressable>
  );
}

export function ComponentGrid({
  components,
  onSelect,
}: {
  components: ReadonlyArray<Component>;
  onSelect: (key: ComponentKey) => void;
}) {
  return (
    <View style={styles.grid}>
      {components
        .filter((c) => showsComponentScore(c.key))
        .map((c) => (
          <View key={c.key} style={styles.gridCell}>
            <ComponentTile component={c} onPress={() => onSelect(c.key)} />
          </View>
        ))}
    </View>
  );
}

/** Every finding of an assessment with the component it belongs to. */
export function allFindings(components: ReadonlyArray<Component>) {
  return components.flatMap((c) => c.findings.map((f) => ({ ...f, componentKey: c.key })));
}

/** A compact finding: priority, title and component. Opens the full finding. */
export function FindingRow({
  finding,
  componentKey,
  onPress,
  last,
}: {
  finding: Finding;
  componentKey: ComponentKey;
  onPress: () => void;
  last?: boolean;
}) {
  const colors = t.color.severity[FINDING_PRIORITY_TONES[finding.priority]];
  const priority = FINDING_PRIORITY_LABELS[finding.priority];
  const component = ASSESSMENT_COMPONENT_LABELS[componentKey];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${finding.title}. ${priority} priority. ${component}`}
      onPress={onPress}
      style={({ pressed }) => [styles.finding, !last && styles.divider, pressed && styles.pressed]}
    >
      <View style={[styles.priorityDot, { backgroundColor: colors.solid }]} />
      <View style={styles.findingText}>
        <Text style={styles.findingTitle} numberOfLines={2}>
          {finding.title}
        </Text>
        <Text style={styles.findingMeta}>
          <Text style={{ color: colors.fg }}>{priority} priority</Text> · {component}
        </Text>
      </View>
      <ChevronRight size={18} color={t.color.text.disabled} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: t.space[4] },
  heroText: { flex: 1, gap: t.space[1] },
  heroMeta: { ...textStyle('bodySm'), color: t.color.text.tertiary },
  heroSummary: { ...textStyle('body'), color: t.color.text.secondary },
  pressed: { opacity: 0.75 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -t.space['1.5'] },
  gridCell: { width: '50%', padding: t.space['1.5'] },
  tile: {
    gap: t.space[2],
    minHeight: 124,
    padding: t.space[3],
    borderRadius: t.radius.xl,
    borderWidth: 1,
    borderColor: t.color.border.default,
    backgroundColor: t.color.bg.surface,
    boxShadow: t.shadow.xs,
  },
  tileLabel: { ...textStyle('label'), color: t.color.text.secondary, minHeight: 36 },
  tileScore: { ...textStyle('h2'), color: t.color.text.primary, fontVariant: ['tabular-nums'] },
  tileMax: { ...textStyle('bodySm'), color: t.color.text.tertiary },
  tileStatus: { ...textStyle('body'), ...fontStyle(600), color: t.color.text.tertiary },
  finding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space[3],
    minHeight: 56,
    paddingVertical: t.space[3],
  },
  divider: { borderBottomWidth: 1, borderBottomColor: t.color.border.subtle },
  priorityDot: { width: 10, height: 10, borderRadius: t.radius.full },
  findingText: { flex: 1, gap: 2 },
  findingTitle: { ...textStyle('body'), ...fontStyle(600), color: t.color.text.primary },
  findingMeta: { ...textStyle('bodySm'), color: t.color.text.tertiary },
});
