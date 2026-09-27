import { tokens as t } from '@radial-pulse/design-tokens';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Card,
  COMPONENT_STATUS_TONES,
  EmptyState,
  FindingCard,
  findingCardProps,
  ScoreCard,
  Select,
  sortByPriority,
  Tabs,
  textStyle,
} from '@radial-pulse/ui/native';
import { ASSESSMENT_COMPONENT_LABELS, formatComponentScore } from '@radial-pulse/utils';
import { FileSearch } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  allFindings,
  ComponentGrid,
  componentCaption,
  FindingRow,
  publishedLabel,
  ScoreHero,
  type ComponentKey,
} from '../../shell/assessment-kit';
import { useAssessmentDetail } from '../../shell/clinic-data';
import { CardSkeleton, QueryErrorState, SectionHeader } from '../../shell/kit';

type Tab = 'overview' | ComponentKey;

const COMPONENT_KEYS = Object.keys(ASSESSMENT_COMPONENT_LABELS) as ComponentKey[];

export function parseComponent(value: unknown): ComponentKey | null {
  return typeof value === 'string' && (COMPONENT_KEYS as string[]).includes(value)
    ? (value as ComponentKey)
    : null;
}

/**
 * The published Digital Presence Assessment: an overview, then one tab per
 * contract component with its backend findings, recommendations and evidence.
 * `assessmentId` null follows the latest published assessment, with a picker
 * for earlier ones.
 */
export function AssessmentView({
  assessmentId,
  component,
  renderScreen,
}: {
  assessmentId: string | null;
  /** Component tab to open (e.g. from Home). */
  component: ComponentKey | null;
  /** Wraps the content in the route's screen (header, refresh). */
  renderScreen: (props: {
    header: React.ReactNode;
    content: React.ReactNode;
    onRefresh: () => void;
    refreshing: boolean;
  }) => React.ReactElement;
}) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const { list, detail, none, isLoading, error, refetch } = useAssessmentDetail(
    assessmentId ?? pickedId,
  );
  const [tab, setTab] = useState<Tab>(component ?? 'overview');
  useEffect(() => {
    if (component) setTab(component);
  }, [component]);

  const assessment = detail.data;
  const tabs = useMemo(
    () => [
      { value: 'overview' as Tab, label: 'Overview' },
      ...(assessment?.components ?? []).map((c) => ({
        value: c.key as Tab,
        label: ASSESSMENT_COMPONENT_LABELS[c.key],
      })),
    ],
    [assessment],
  );

  const published = list.data?.items ?? [];
  const picker =
    assessmentId === null && published.length > 1 ? (
      <Select
        label="Assessment"
        value={pickedId ?? published[0]!.id}
        onChange={(id) => {
          setPickedId(id);
          setTab('overview');
        }}
        options={published.map((a, i) => ({
          value: a.id,
          label: `${publishedLabel(a)}${i === 0 ? ' · Latest' : ''}`,
        }))}
      />
    ) : null;

  const header = assessment ? (
    <View style={styles.header}>
      {picker}
      <Tabs
        variant="scroll"
        label="Assessment sections"
        items={tabs}
        value={tab}
        onChange={setTab}
      />
    </View>
  ) : null;

  let content: React.ReactNode;
  if (isLoading) {
    content = <CardSkeleton lines={5} />;
  } else if (error) {
    content = (
      <Card>
        <QueryErrorState error={error} onRetry={() => void refetch()} />
      </Card>
    );
  } else if (none || !assessment) {
    content = (
      <Card>
        <EmptyState
          icon={<FileSearch size={22} color={t.color.text.tertiary} />}
          title="No published assessment yet"
          description="Your Digital Success Manager will publish your clinic’s Digital Presence Assessment here when it’s ready."
        />
      </Card>
    );
  } else if (tab === 'overview') {
    content = <Overview assessment={assessment} onSelect={setTab} />;
  } else {
    const selected = assessment.components.find((c) => c.key === tab);
    content = selected ? (
      <ComponentSection component={selected} />
    ) : (
      <Card>
        <EmptyState title="This section isn’t in this assessment" />
      </Card>
    );
  }

  return renderScreen({
    header,
    content,
    onRefresh: () => void refetch(),
    refreshing: list.isRefetching || detail.isRefetching,
  });
}

function Overview({
  assessment,
  onSelect,
}: {
  assessment: Schema<'AssessmentDetail'>;
  onSelect: (key: ComponentKey) => void;
}) {
  const findings = sortByPriority(allFindings(assessment.components));
  return (
    <>
      <Card title="Overall Digital Presence Score">
        <ScoreHero assessment={assessment} />
      </Card>
      <SectionHeader title="Components" />
      <ComponentGrid components={assessment.components} onSelect={onSelect} />
      <SectionHeader title={`All findings (${findings.length})`} />
      <Card padding="sm">
        {findings.length === 0 ? (
          <Text style={styles.muted}>This assessment has no findings.</Text>
        ) : (
          <View style={styles.inset}>
            {findings.map((f, i) => (
              <FindingRow
                key={f.id}
                finding={f}
                componentKey={f.componentKey}
                onPress={() => onSelect(f.componentKey)}
                last={i === findings.length - 1}
              />
            ))}
          </View>
        )}
      </Card>
    </>
  );
}

function ComponentSection({ component }: { component: Schema<'ComponentDetail'> }) {
  const label = ASSESSMENT_COMPONENT_LABELS[component.key];
  const findings = sortByPriority(component.findings);
  return (
    <>
      <ScoreCard
        label={label}
        score={component.status === 'completed' ? component.score : null}
        emptyLabel={formatComponentScore(component)}
        tone={COMPONENT_STATUS_TONES[component.status]}
        caption={componentCaption(component)}
      />
      <SectionHeader title={`Findings and recommendations (${findings.length})`} />
      {findings.length === 0 ? (
        <Card>
          <EmptyState
            title={`No findings for ${label}`}
            description={
              component.status === 'completed'
                ? 'Nothing needs attention in this area right now.'
                : undefined
            }
          />
        </Card>
      ) : (
        findings.map((f) => <FindingCard key={f.id} {...findingCardProps(f)} />)
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: { gap: t.space[3], paddingTop: t.space[1] },
  inset: { paddingHorizontal: t.space[1] },
  muted: { ...textStyle('body'), color: t.color.text.tertiary, padding: t.space[2] },
});
