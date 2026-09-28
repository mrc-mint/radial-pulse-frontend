import { useChatInbox, useDashboardSummary } from '@radial-pulse/api-client/react';
import { useCurrentSession } from '@radial-pulse/platform-shell/core';
import {
  Avatar,
  Badge,
  BarList,
  Card,
  ColumnChart,
  EmptyState,
  formatRelativeTime,
  MetricCard,
  PageHeader,
  Skeleton,
} from '@radial-pulse/ui/web';
import { CLINIC_STAGE_LABELS } from '@radial-pulse/utils';
import { Link } from '@tanstack/react-router';
import {
  Building2,
  ClipboardCheck,
  Hourglass,
  ListTodo,
  MessageCircle,
  Rocket,
  Sparkles,
} from 'lucide-react';
import { QueryError } from '../../app/page-kit';
import './dashboard.css';
import { PlatformDashboard } from './platform-dashboard';

const MONTH = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });

/**
 * Dashboard. A Platform Administrator (`all_clinics`) sees the platform-wide
 * overview; a Digital Success Manager sees their clinics' work. The API scopes
 * every number to the clinics the caller can see.
 */
export function DashboardPage() {
  const session = useCurrentSession();
  return session.allClinics ? <PlatformDashboard /> : <ClinicWorkDashboard />;
}

/**
 * Digital Success Manager dashboard. Only contract fields are shown
 * (DashboardSummary, ChatInbox).
 */
function ClinicWorkDashboard() {
  const session = useCurrentSession();
  const summary = useDashboardSummary();
  const inbox = useChatInbox();
  const firstName = session.user.name.split(' ')[0];
  const data = summary.data;

  return (
    <div className="rp-page">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here is how your clinics are doing.`}
      />

      {summary.isError ? (
        <Card>
          <QueryError error={summary.error} onRetry={() => void summary.refetch()} />
        </Card>
      ) : (
        <>
          <div className="rp-grid rp-grid--tiles" aria-busy={summary.isLoading || undefined}>
            <MetricCard
              label="Total clinics"
              value={data?.total_clinics}
              icon={<Building2 size={20} />}
            />
            <MetricCard label="Prospects" value={data?.prospects} icon={<Sparkles size={20} />} />
            <MetricCard
              label="In progress"
              value={data?.in_progress}
              icon={<Hourglass size={20} />}
            />
            <MetricCard label="Active clients" value={data?.active} icon={<Rocket size={20} />} />
          </div>

          <div className="rp-grid rp-grid--tiles">
            <MetricCard
              label="Assessments awaiting review"
              value={data?.assessments_awaiting_review}
              icon={<ClipboardCheck size={20} />}
            />
            <MetricCard
              label="Open work items"
              value={data?.open_work_items}
              icon={<ListTodo size={20} />}
            />
            <MetricCard
              label="Unread chat messages"
              value={inbox.data?.unread_messages}
              hint={
                inbox.data
                  ? `${inbox.data.unread_threads} conversation${inbox.data.unread_threads === 1 ? '' : 's'}`
                  : undefined
              }
              icon={<MessageCircle size={20} />}
            />
          </div>

          <div className="rp-grid rp-grid--2">
            <Card title="Clinics by stage" description="Where each clinic is in the journey">
              {data ? (
                <BarList
                  label="Clinics by stage"
                  unit="clinics"
                  items={data.by_stage.map((s) => ({
                    id: s.stage,
                    label: CLINIC_STAGE_LABELS[s.stage],
                    value: s.count,
                  }))}
                />
              ) : (
                <ChartSkeleton />
              )}
            </Card>
            <Card title="New clinics" description="Clinics added per month">
              {data ? (
                <ColumnChart
                  label="New clinics per month"
                  unit="new clinics"
                  items={data.new_clinics_by_month.map((m) => ({
                    id: m.month,
                    label: MONTH.format(new Date(`${m.month}-01T00:00:00Z`)),
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

      <Card
        title="Recent conversations"
        description="Latest messages from your clinics"
        padding="none"
      >
        {inbox.isError ? (
          <QueryError error={inbox.error} onRetry={() => void inbox.refetch()} />
        ) : !inbox.data ? (
          <div className="rp-dashboard__threads-loading">
            <Skeleton height={40} />
            <Skeleton height={40} />
          </div>
        ) : inbox.data.items.length === 0 ? (
          <EmptyState
            title="No conversations yet"
            description="Chats with your clinics will appear here."
          />
        ) : (
          <ul className="rp-dashboard__threads">
            {inbox.data.items.slice(0, 5).map((thread) => (
              <li key={thread.clinic_id}>
                <Link
                  to="/clinics/$clinicId/chat"
                  params={{ clinicId: thread.clinic_id }}
                  className="rp-dashboard__thread"
                >
                  <Avatar name={thread.clinic_name} size="md" decorative />
                  <span className="rp-dashboard__thread-text">
                    <span className="rp-dashboard__thread-title">{thread.clinic_name}</span>
                    <span className="rp-dashboard__thread-preview">
                      {thread.last_message.sender_name}:{' '}
                      {thread.last_message.body ?? 'Sent an attachment'}
                    </span>
                  </span>
                  <span className="rp-dashboard__thread-meta">
                    <span>{formatRelativeTime(thread.last_message.created_at)}</span>
                    {thread.unread_count > 0 && (
                      <Badge tone="brand" size="sm">
                        {thread.unread_count} unread
                      </Badge>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
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
