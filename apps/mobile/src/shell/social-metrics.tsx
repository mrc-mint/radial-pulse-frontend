import { useLatestSnapshots } from '@radial-pulse/api-client/react';
import { tokens as t } from '@radial-pulse/design-tokens';
import { useClinicCan, useClinicId } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Card,
  EmptyState,
  formatRelativeTime,
  MetricCard,
  textStyle,
} from '@radial-pulse/ui/native';
import {
  formatMetric,
  metricLabel,
  metricRank,
  PRESENCE_PLATFORM_LABELS,
} from '@radial-pulse/utils';
import { ChartColumn } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { PLATFORM_ICONS } from './icons';
import { CardSkeleton, IconBubble, QueryErrorState } from './kit';

type Snapshot = Schema<'MetricSnapshotRead'>;
type Social = 'instagram' | 'facebook' | 'youtube' | 'linkedin';

const SOCIAL: ReadonlyArray<Social> = ['instagram', 'facebook', 'youtube', 'linkedin'];

/**
 * Latest social metrics per connected platform (`MetricSnapshotRead`,
 * `latest=true`). Values are shown as the API sent them; metric keys have no
 * published catalogue yet (gap 6), so unknown keys show their own name.
 */
export function SocialMetrics({ platform }: { platform?: Social }) {
  const clinicId = useClinicId();
  const canRead = useClinicCan(clinicId, 'snapshots:read');
  const snapshots = useLatestSnapshots(clinicId, { enabled: canRead });

  if (!canRead) return null;
  if (snapshots.isLoading) return <CardSkeleton lines={3} />;
  if (snapshots.error) {
    return (
      <Card>
        <QueryErrorState error={snapshots.error} onRetry={() => void snapshots.refetch()} />
      </Card>
    );
  }

  const groups = SOCIAL.filter((s) => !platform || s === platform)
    .map((source) => ({
      source,
      rows: (snapshots.data?.items ?? [])
        .filter((s) => s.source === source)
        .sort((a, b) => metricRank(a.metric_key) - metricRank(b.metric_key)),
    }))
    .filter((g) => g.rows.length > 0);

  if (groups.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<ChartColumn size={22} color={t.color.text.tertiary} />}
          title="No numbers yet"
          description="Followers and engagement appear once an account is connected and has synced."
        />
      </Card>
    );
  }

  return (
    <View style={styles.stack}>
      {groups.map(({ source, rows }) => (
        <PlatformMetrics key={source} source={source} rows={rows} showHeader={!platform} />
      ))}
    </View>
  );
}

function PlatformMetrics({
  source,
  rows,
  showHeader,
}: {
  source: Social;
  rows: Snapshot[];
  showHeader: boolean;
}) {
  const Icon = PLATFORM_ICONS[source];
  const newest = rows.reduce((a, b) => (a.fetched_at > b.fetched_at ? a : b));
  return (
    <Card padding="sm">
      {showHeader ? (
        <View style={styles.header}>
          <IconBubble size={32}>
            <Icon size={16} color={t.color.status.brand.fg} />
          </IconBubble>
          <Text style={styles.title}>{PRESENCE_PLATFORM_LABELS[source]}</Text>
          <Text style={styles.updated}>Updated {formatRelativeTime(newest.fetched_at)}</Text>
        </View>
      ) : null}
      <View style={styles.grid}>
        {rows.map((s) => (
          <View key={s.id} style={styles.cell}>
            <MetricCard
              label={metricLabel(s.metric_key)}
              value={s.status === 'error' ? null : formatMetric(s.metric_key, s.value_number)}
              hint={s.status === 'stale' ? 'Not refreshed recently' : undefined}
            />
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: t.space[3] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space[2],
    paddingHorizontal: t.space[1],
    paddingBottom: t.space[2],
  },
  title: { ...textStyle('h3'), flex: 1, color: t.color.text.primary },
  updated: { ...textStyle('caption'), color: t.color.text.tertiary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -t.space[1] },
  cell: { width: '50%', padding: t.space[1] },
});
