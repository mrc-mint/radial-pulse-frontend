import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  displayHost,
  formatDateTime,
  type FindingCardBaseProps,
  type FindingEvidence,
} from '../shared';
import { glyph, severityColors, t, text, font } from './theme';

function EvidenceItem({ evidence }: { evidence: FindingEvidence }) {
  const observed = evidence.observedAt ? formatDateTime(evidence.observedAt) : null;
  const { sourceUrl } = evidence;
  return (
    <View style={styles.evidence}>
      {evidence.excerpt ? <Text style={styles.excerpt}>{evidence.excerpt}</Text> : null}
      <View style={styles.evidenceMeta}>
        {sourceUrl ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Open source: ${displayHost(sourceUrl)}`}
            hitSlop={8}
            onPress={() => void Linking.openURL(sourceUrl)}
          >
            <Text style={styles.link}>{displayHost(sourceUrl)} ↗</Text>
          </Pressable>
        ) : null}
        {evidence.provider ? <Text style={styles.metaText}>{evidence.provider}</Text> : null}
        {observed ? <Text style={styles.metaText}>Observed {observed}</Text> : null}
      </View>
    </View>
  );
}

export interface FindingCardProps extends FindingCardBaseProps {
  evidenceOpen?: boolean;
}

/** One published finding, rendered generically from the contract. */
export function FindingCard({
  title,
  description,
  priority,
  sectionLabel,
  recommendation,
  evidence = [],
  evidenceOpen = false,
}: FindingCardProps) {
  const [open, setOpen] = useState(evidenceOpen);
  const colors = severityColors(priority.tone);

  return (
    <View style={[styles.card, { borderLeftColor: colors.solid }]}>
      <View style={styles.meta}>
        <View
          style={[styles.severity, { backgroundColor: colors.bg }]}
          accessible
          accessibilityLabel={`Priority: ${priority.label}`}
        >
          <View style={[styles.dot, { backgroundColor: colors.solid }]} />
          <Text style={[styles.severityText, { color: colors.fg }]}>{priority.label}</Text>
        </View>
        {sectionLabel ? <Text style={styles.metaText}>{sectionLabel}</Text> : null}
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {recommendation ? (
        <View style={styles.recommendation}>
          <Text style={styles.overline}>Recommendation</Text>
          <Text style={styles.recommendationText}>{recommendation}</Text>
        </View>
      ) : null}
      {evidence.length > 0 ? (
        <View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            onPress={() => setOpen((o) => !o)}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>
              {open ? 'Hide' : 'Show'} evidence ({evidence.length}){' '}
              {open ? glyph.chevronDown : glyph.chevronRight}
            </Text>
          </Pressable>
          {open ? (
            <View style={styles.evidenceList}>
              {evidence.map((e, i) => (
                <EvidenceItem key={e.sourceUrl ?? i} evidence={e} />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: t.space[2],
    padding: t.space[4],
    backgroundColor: t.color.bg.surface,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: t.color.border.default,
    borderRadius: t.radius.xl,
  },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.space[2] },
  severity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space['1.5'],
    height: 24,
    paddingHorizontal: t.space[2],
    borderRadius: t.radius.full,
  },
  dot: { width: 6, height: 6, borderRadius: t.radius.full },
  severityText: { ...text('caption'), ...font(t.font.weight.semibold) },
  metaText: { ...text('caption'), color: t.color.text.tertiary },
  title: { ...text('h3'), color: t.color.text.primary },
  description: { ...text('body'), color: t.color.text.secondary },
  recommendation: {
    gap: t.space[1],
    padding: t.space[3],
    borderRadius: t.radius.md,
    backgroundColor: t.color.bg.subtle,
    borderWidth: 1,
    borderColor: t.color.border.subtle,
  },
  overline: {
    ...text('overline'),
    color: t.color.text.tertiary,
    textTransform: 'uppercase',
  },
  recommendationText: { ...text('body'), color: t.color.text.primary },
  toggle: { minHeight: t.size.touchTarget, justifyContent: 'center' },
  toggleText: {
    ...text('label'),
    color: t.color.text.link,
    ...font(t.font.weight.semibold),
  },
  evidenceList: { gap: t.space[3] },
  evidence: { gap: t.space['1.5'] },
  excerpt: {
    ...text('bodySm'),
    color: t.color.text.secondary,
    paddingLeft: t.space[3],
    borderLeftWidth: 2,
    borderLeftColor: t.color.border.strong,
  },
  evidenceMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.space[3] },
  link: { ...text('caption'), color: t.color.text.link, ...font(t.font.weight.medium) },
});
