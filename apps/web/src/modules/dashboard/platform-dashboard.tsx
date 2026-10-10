import { useClinics, useDashboardSummary } from '@radial-pulse/api-client-react';
import type { StatusTone } from '@radial-pulse/design-tokens';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Card,
  DonutChart,
  EmptyState,
  formatRelativeTime,
  LineChart,
  MetricCard,
  PageHeader,
  Select,
  Skeleton,
} from '@radial-pulse/web-ui';
import { Link } from '@tanstack/react-router';
import {
  ArrowRightLeft,
  BadgeCheck,
  Building2,
  CirclePause,
  Globe,
  Hourglass,
  Plus,
  Sparkles,
  UserRoundX,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { QueryError } from '../../app/page-kit';
import { clinicsAtMonthEnd } from './growth';
import { addedThisMonth, clinicActivity, websiteShare, type ActivityEvent } from './insights';
import './dashboard.css';

const MONTH = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const monthLabel = (month: string) => MONTH.format(new Date(`${month}-01T00:00:00Z`));

/**
 * Clinic groups from `DashboardSummary`: the backend's stage groups
 * (prospects, in_progress, active) plus archived clinics as "Inactive".
 * Each group keeps one colour on tiles and chart (colour follows the entity).
 */
const GROUPS = [
  {
    id: 'active',
    label: 'Active',
    color: 'var(--rp-color-chart-series2)',
  },
  {
    id: 'prospects',
    label: 'Prospective clients',
    color: 'var(--rp-color-chart-series1)',
  },
  {
    id: 'in_progress',
    label: 'In progress',
    color: 'var(--rp-color-chart-series3)',
  },
  {
    id: 'archived',
    label: 'Inactive',
    color: 'var(--rp-color-chart-neutral)',
  },
] as const;

type GrowthMetric = 'total' | 'new';

const GROWTH_OPTIONS: Array<{ value: GrowthMetric; label: string }> = [
  { value: 'total', label: 'Total client organizations' },
  { value: 'new', label: 'New client organizations' },
];

/** Every clinic row the feed and highlights need (the API's maximum page). */
const ALL_CLINICS = { limit: 200 } as const;
const PROSPECT_STAGES: Array<Schema<'ClinicStage'>> = ['prospective_client', 'profile_enriched'];
const PROSPECTS = { stage: PROSPECT_STAGES, limit: 200 };
const UNASSIGNED = { unassigned: true, limit: 1 } as const;

/**
 * Platform Administrator dashboard: platform-wide clinic counts, the status
 * mix, growth, recent clinic activity and highlights. Everything comes from
 * `DashboardSummary` and the clinics list. Period filters and change
 * percentages are not in the contract and are left out (gap 5).
 */
export function PlatformDashboard() {
  const summary = useDashboardSummary();
  const [metric, setMetric] = useState<GrowthMetric>('total');
  const data = summary.data;

  const growth = data
    ? metric === 'total'
      ? clinicsAtMonthEnd(data.total_clinics, data.new_clinics_by_month)
      : data.new_clinics_by_month
    : null;

  return (
    <div className="rp-page">
      <PageHeader
        className="rp-dashboard__header"
        title="Dashboard"
        description="Overview of client organizations, progress and impact"
      />

      {summary.isError ? (
        <Card>
          <QueryError error={summary.error} onRetry={() => void summary.refetch()} />
        </Card>
      ) : (
        <>
          <div className="rp-grid rp-dashboard__tiles" aria-busy={summary.isLoading || undefined}>
            <MetricCard
              label="Total client organizations"
              value={data?.total_clinics}
              icon={<Building2 size={20} />}
              iconTone="brand"
            />
            <MetricCard
              label="Active clients"
              value={data?.active}
              icon={<BadgeCheck size={20} />}
              iconTone="success"
            />
            <MetricCard
              label="Prospective clients"
              value={data?.prospects}
              icon={<Sparkles size={20} />}
              iconTone="info"
            />
            <MetricCard
              label="In progress"
              value={data?.in_progress}
              icon={<Hourglass size={20} />}
              iconTone="warning"
            />
            <MetricCard
              label="Inactive clients"
              value={data?.archived}
              icon={<CirclePause size={20} />}
              iconTone="neutral"
            />
          </div>

          <div className="rp-grid rp-grid--2">
            <Card title="Client status overview">
              {data ? (
                <DonutChart
                  label="Client organizations by status"
                  unit="client organizations"
                  centerLabel="All clients"
                  total={data.total_clinics + data.archived}
                  items={GROUPS.map((g) => ({
                    id: g.id,
                    label: g.label,
                    color: g.color,
                    value: data[g.id],
                  }))}
                />
              ) : (
                <ChartSkeleton />
              )}
            </Card>

            <Card
              title="Client growth trend"
              actions={
                <Select
                  label="Growth measure"
                  hideLabel
                  size="sm"
                  value={metric}
                  onChange={setMetric}
                  options={GROWTH_OPTIONS}
                />
              }
            >
              {growth ? (
                <LineChart
                  label={
                    metric === 'total'
                      ? 'Total client organizations by month'
                      : 'New client organizations by month'
                  }
                  unit={metric === 'total' ? 'client organizations' : 'new client organizations'}
                  items={growth.map((m) => ({
                    id: m.month,
                    label: monthLabel(m.month),
                    value: m.count,
                  }))}
                />
              ) : (
                <ChartSkeleton />
              )}
            </Card>
          </div>
        </>
      )}

      <div className="rp-grid rp-grid--2">
        <RecentActivity />
        <KeyHighlights />
      </div>
    </div>
  );
}

const ACTIVITY_ICON: Record<ActivityEvent['kind'], LucideIcon> = {
  added: Plus,
  stage: ArrowRightLeft,
};

function RecentActivity() {
  const clinics = useClinics(ALL_CLINICS);
  const events = clinics.data ? clinicActivity(clinics.data.items) : null;

  return (
    <Card
      title="Recent activity"
      padding="none"
      actions={
        <Link to="/clinics" className="rp-link rp-dashboard__view-all">
          View all
        </Link>
      }
    >
      {clinics.isError ? (
        <QueryError error={clinics.error} onRetry={() => void clinics.refetch()} />
      ) : !events ? (
        <ListSkeleton />
      ) : events.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="New client organizations and stage changes appear here."
        />
      ) : (
        <ul className="rp-dashboard__feed" aria-label="Recent activity">
          {events.map((event) => {
            const Icon = ACTIVITY_ICON[event.kind];
            return (
              <li key={event.id}>
                <Link
                  to="/clinics/$clinicId"
                  params={{ clinicId: event.clinicId }}
                  className="rp-dashboard__feed-row"
                >
                  <FeedIcon
                    tone={
                      event.kind === 'added'
                        ? 'brand'
                        : event.stage === 'active_client'
                          ? 'success'
                          : 'info'
                    }
                  >
                    <Icon size={16} />
                  </FeedIcon>
                  <span className="rp-dashboard__feed-text">{event.text}</span>
                  <time className="rp-dashboard__feed-time" dateTime={event.at}>
                    {formatRelativeTime(event.at)}
                  </time>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function KeyHighlights() {
  const prospects = useClinics(PROSPECTS);
  const unassigned = useClinics(UNASSIGNED);
  const error = prospects.error ?? unassigned.error;

  const rows: Array<{ id: string; icon: LucideIcon; tone: StatusTone; text: string }> = [];
  if (prospects.data) {
    const added = addedThisMonth(prospects.data.items);
    rows.push({
      id: 'new-prospects',
      icon: Sparkles,
      tone: 'info',
      text: `${added} new ${added === 1 ? 'prospect' : 'prospects'} added this month`,
    });
    const website = websiteShare(prospects.data.items, prospects.data.total);
    if (website) {
      rows.push({
        id: 'prospect-websites',
        icon: Globe,
        tone: 'success',
        text: `${website.percent}% of prospects have a website (${website.withWebsite} of ${website.total})`,
      });
    }
  }
  if (unassigned.data) {
    const count = unassigned.data.total;
    rows.push({
      id: 'unassigned',
      icon: UserRoundX,
      tone: count > 0 ? 'warning' : 'neutral',
      text: `${count} ${count === 1 ? 'client organization is' : 'client organizations are'} not allocated to a portfolio`,
    });
  }

  return (
    <Card title="Key highlights" padding="none">
      {error ? (
        <QueryError
          error={error}
          onRetry={() => void Promise.all([prospects.refetch(), unassigned.refetch()])}
        />
      ) : !prospects.data || !unassigned.data ? (
        <ListSkeleton />
      ) : (
        <ul className="rp-dashboard__feed" aria-label="Key highlights">
          {rows.map((row) => (
            <li key={row.id} className="rp-dashboard__feed-row">
              <FeedIcon tone={row.tone}>
                <row.icon size={16} />
              </FeedIcon>
              <span className="rp-dashboard__feed-text">{row.text}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function FeedIcon({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span className={`rp-dashboard__feed-icon rp-dashboard__feed-icon--${tone}`} aria-hidden="true">
      {children}
    </span>
  );
}

function ListSkeleton() {
  return (
    <div className="rp-dashboard__threads-loading" aria-hidden="true">
      <Skeleton height={32} />
      <Skeleton height={32} />
      <Skeleton height={32} />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rp-stack-sm" aria-hidden="true">
      {[80, 60, 70, 40, 55].map((w) => (
        <Skeleton key={w} width={`${w}%`} height={14} />
      ))}
    </div>
  );
}
