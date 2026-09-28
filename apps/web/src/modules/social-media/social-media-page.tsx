import { useConnections, useLatestSnapshots } from '@radial-pulse/api-client/react';
import { useClinicCan, useClinicId } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Badge,
  Card,
  CONNECTION_STATUS_TONES,
  EmptyState,
  formatRelativeTime,
  MetricCard,
} from '@radial-pulse/ui/web';
import {
  CONNECTION_STATUS_LABELS,
  formatMetric,
  metricLabel,
  metricRank,
  PRESENCE_PLATFORM_LABELS,
} from '@radial-pulse/utils';
import { CardSkeleton, QueryError, Section } from '../../app/page-kit';
import './social-media.css';

/**
 * Social Media for one clinic: connected accounts (`ConnectionRead`) and the
 * latest value of each platform metric (`MetricSnapshotRead`, `latest=true`).
 * Metric keys have no published catalogue yet (gap 6): known ones get a label,
 * others show their key. Values are shown as the API sent them.
 */
export function SocialMediaPage() {
  const clinicId = useClinicId();
  const connections = useConnections(clinicId);

  return (
    <div className="rp-stack">
      <Section title="Connected accounts">
        {connections.isError ? (
          <Card>
            <QueryError error={connections.error} onRetry={() => void connections.refetch()} />
          </Card>
        ) : !connections.data ? (
          <CardSkeleton lines={3} />
        ) : (
          <ul className="rp-social__grid" aria-label="Connected accounts">
            {connections.data.map((c) => {
              const synced = c.last_synced_at ? formatRelativeTime(c.last_synced_at) : null;
              return (
                <li key={c.platform} className="rp-social__card">
                  <div className="rp-social__top">
                    <h3 className="rp-social__name">{c.label}</h3>
                    {c.available ? (
                      <Badge tone={CONNECTION_STATUS_TONES[c.status]} dot>
                        {CONNECTION_STATUS_LABELS[c.status]}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">Coming later</Badge>
                    )}
                  </div>
                  {c.external_account_name && (
                    <p className="rp-social__account">{c.external_account_name}</p>
                  )}
                  <p className="rp-muted rp-small">
                    {synced
                      ? `Last synced ${synced}`
                      : c.available
                        ? 'The clinic connects this account from the mobile app.'
                        : 'This platform isn’t supported yet.'}
                  </p>
                  {c.last_error && (
                    <p className="rp-callout rp-callout--warning" role="note">
                      {c.last_error}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Performance">
        <Performance clinicId={clinicId} />
      </Section>
    </div>
  );
}

type Snapshot = Schema<'MetricSnapshotRead'>;
type Source = Schema<'DataSource'>;

const SOURCE_LABEL = (source: Source) =>
  source in PRESENCE_PLATFORM_LABELS
    ? PRESENCE_PLATFORM_LABELS[source as keyof typeof PRESENCE_PLATFORM_LABELS]
    : source.replace(/_/g, ' ');

const SOCIAL_SOURCES: ReadonlyArray<Source> = ['instagram', 'facebook', 'youtube', 'linkedin'];

function Performance({ clinicId }: { clinicId: string }) {
  const canRead = useClinicCan(clinicId, 'snapshots:read');
  const snapshots = useLatestSnapshots(clinicId, { enabled: canRead });

  if (!canRead) return null;
  if (snapshots.isError) {
    return (
      <Card>
        <QueryError error={snapshots.error} onRetry={() => void snapshots.refetch()} />
      </Card>
    );
  }
  if (!snapshots.data) return <CardSkeleton lines={3} />;

  const bySource = new Map<Source, Snapshot[]>();
  for (const s of snapshots.data.items) {
    if (!SOCIAL_SOURCES.includes(s.source)) continue;
    bySource.set(s.source, [...(bySource.get(s.source) ?? []), s]);
  }
  if (bySource.size === 0) {
    return (
      <Card>
        <EmptyState
          title="No social metrics yet"
          description="Metrics appear once the clinic connects an account and it has synced."
        />
      </Card>
    );
  }

  return (
    <div className="rp-stack">
      {[...bySource].map(([source, rows]) => {
        const newest = rows.reduce((a, b) => (a.fetched_at > b.fetched_at ? a : b));
        return (
          <Card
            key={source}
            title={SOURCE_LABEL(source)}
            description={`Updated ${formatRelativeTime(newest.fetched_at)}`}
          >
            <div className="rp-social__metrics">
              {[...rows]
                .sort((a, b) => metricRank(a.metric_key) - metricRank(b.metric_key))
                .map((s) => (
                  <MetricCard
                    key={s.id}
                    label={metricLabel(s.metric_key)}
                    value={s.status === 'error' ? null : formatMetric(s.metric_key, s.value_number)}
                    hint={s.status === 'stale' ? 'Not refreshed recently' : undefined}
                  />
                ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
