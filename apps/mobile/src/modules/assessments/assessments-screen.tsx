import { tokens as t } from '@radial-pulse/design-tokens';
import { Screen } from '@radial-pulse/mobile-shell';
import { Badge, Card, EmptyState, fontStyle, PageHeader, textStyle } from '@radial-pulse/mobile-ui';
import { formatScore, overallScoreEmptyLabel } from '@radial-pulse/utils';
import { useRouter } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { publishedLabel } from '../../shell/assessment-kit';
import { usePublishedAssessments } from '../../shell/clinic-data';
import { CardSkeleton, IconBubble, QueryErrorState } from '../../shell/kit';

/**
 * Assessments: the clinic's published Digital Presence Assessments, newest
 * first (V1 scope). The API returns only published ones to a Clinic
 * Administrator. No downloads: the contract has no assessment export.
 */
export function AssessmentsScreen() {
  const router = useRouter();
  const list = usePublishedAssessments();
  const items = list.data?.items ?? [];

  return (
    <Screen
      onRefresh={() => void list.refetch()}
      refreshing={list.isRefetching}
      header={
        <PageHeader title="Assessments" description="Your published Digital Presence Assessments" />
      }
    >
      {list.isLoading ? (
        <>
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
        </>
      ) : list.error ? (
        <Card>
          <QueryErrorState error={list.error} onRetry={() => void list.refetch()} />
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText size={22} color={t.color.text.tertiary} />}
            title="No assessments yet"
            description="Assessments your Digital Success Manager publishes will appear here."
          />
        </Card>
      ) : (
        items.map((a, i) => {
          const score = formatScore(a.overall_score, overallScoreEmptyLabel(a.status));
          const scored = a.overall_score !== null;
          return (
            <Card
              key={a.id}
              onPress={() =>
                router.push({
                  pathname: '/assessment/[assessmentId]',
                  params: { assessmentId: a.id },
                })
              }
              accessibilityLabel={`Digital Presence Assessment, ${publishedLabel(a)}. Overall score ${
                scored ? `${score} out of 100` : score
              }${i === 0 ? '. Latest' : ''}`}
            >
              <View style={styles.row}>
                <IconBubble>
                  <FileText size={20} color={t.color.status.brand.fg} />
                </IconBubble>
                <View style={styles.text}>
                  <Text style={styles.title}>Digital Presence Assessment</Text>
                  <Text style={styles.meta}>{publishedLabel(a)}</Text>
                </View>
                {i === 0 ? (
                  <Badge tone="brand" size="sm">
                    Latest
                  </Badge>
                ) : null}
              </View>
              {a.summary ? (
                <Text style={styles.summary} numberOfLines={3}>
                  {a.summary}
                </Text>
              ) : null}
              <View style={styles.footer}>
                <Text style={styles.scoreLabel}>Overall score</Text>
                <Text style={[styles.score, !scored && styles.scoreMissing]}>
                  {score}
                  {scored ? <Text style={styles.scoreMax}>/100</Text> : null}
                </Text>
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space[3] },
  text: { flex: 1, gap: 2 },
  title: { ...textStyle('h3'), color: t.color.text.primary },
  meta: { ...textStyle('bodySm'), color: t.color.text.tertiary },
  summary: { ...textStyle('body'), color: t.color.text.secondary },
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: t.space[3],
    borderTopWidth: 1,
    borderTopColor: t.color.border.subtle,
  },
  scoreLabel: { ...textStyle('label'), color: t.color.text.secondary },
  score: { ...textStyle('h2'), color: t.color.text.primary, fontVariant: ['tabular-nums'] },
  scoreMissing: { ...textStyle('body'), ...fontStyle(600), color: t.color.text.tertiary },
  scoreMax: { ...textStyle('bodySm'), color: t.color.text.tertiary },
});
