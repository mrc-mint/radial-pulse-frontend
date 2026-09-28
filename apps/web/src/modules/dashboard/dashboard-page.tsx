import {
  useChatInbox,
  useClinics,
  useClinicsActivity,
  useClinicsAssessments,
  useClinicsPresence,
  useDashboardSummary,
} from '@radial-pulse/api-client/react';
import { useCurrentSession } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  formatRelativeTime,
  MetricCard,
  PageHeader,
  Skeleton,
} from '@radial-pulse/ui/web';
import { Link } from '@tanstack/react-router';
import {
  Activity,
  Building2,
  ClipboardCheck,
  Link2,
  ListTodo,
  MessageCircle,
  Search,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useMemo } from 'react';
import { activityText } from '../../app/activity-text';
import { ClinicPhoto } from '../../app/clinic-photo';
import { QueryError } from '../../app/page-kit';
import { clinicsNeedingAttention } from './attention';
import './dashboard.css';
import { PlatformDashboard } from './platform-dashboard';

/**
 * Dashboard. A Platform Administrator (`all_clinics`) sees the platform-wide
 * overview; a Digital Success Manager sees what needs attention in their
 * clinics. The API scopes every number to the clinics the caller can see.
 */
export function DashboardPage() {
  const session = useCurrentSession();
  return session.allClinics ? <PlatformDashboard /> : <ClinicWorkDashboard />;
}

const DAY = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** The caller's clinics, for the per-clinic panels (the API's maximum page). */
const MY_CLINICS = { limit: 200 } as const;

/**
 * Digital Success Manager dashboard: headline counts, clinics that need
 * attention, recent activity and conversations. Contract data only
 * (`DashboardSummary`, clinics, assessments, presence profiles, audit events,
 * chat inbox).
 */
function ClinicWorkDashboard() {
  const session = useCurrentSession();
  const summary = useDashboardSummary();
  const inbox = useChatInbox();
  const clinics = useClinics(MY_CLINICS);
  const firstName = session.user.name.split(' ')[0];
  const data = summary.data;
  const ids = useMemo(() => clinics.data?.items.map((c) => c.id) ?? [], [clinics.data]);
  const unread = inbox.data?.unread_messages;

  return (
    <div className="rp-page">
      <PageHeader
        className="rp-dashboard__header"
        title={`${greeting()}, ${firstName}!`}
        description="Here’s what needs your attention today."
        actions={<span className="rp-dashboard__date">{DAY.format(new Date())}</span>}
      />

      {summary.isError ? (
        <Card>
          <QueryError error={summary.error} onRetry={() => void summary.refetch()} />
        </Card>
      ) : (
        <div className="rp-grid rp-grid--tiles" aria-busy={summary.isLoading || undefined}>
          <MetricCard
            label="My clinics"
            value={data?.total_clinics}
            icon={<Building2 size={20} />}
            iconTone="brand"
          />
          <MetricCard
            label="Audits ready"
            value={data?.assessments_awaiting_review}
            hint="Waiting for your review"
            icon={<ClipboardCheck size={20} />}
            iconTone="success"
          />
          <MetricCard
            label="Open work items"
            value={data?.open_work_items}
            icon={<ListTodo size={20} />}
            iconTone="warning"
          />
          <MetricCard
            label="Unread chats"
            value={unread}
            hint={
              inbox.data
                ? `${inbox.data.unread_threads} ${inbox.data.unread_threads === 1 ? 'conversation' : 'conversations'}`
                : undefined
            }
            icon={<MessageCircle size={20} />}
            iconTone={unread ? 'danger' : 'info'}
          />
        </div>
      )}

      <div className="rp-grid rp-grid--2">
        <ClinicsNeedingAttention
          clinics={clinics.data?.items}
          ids={ids}
          inbox={inbox.data}
          error={clinics.error}
          onRetry={() => void clinics.refetch()}
        />
        <RecentActivity clinics={clinics.data?.items} ids={ids} />
      </div>

      <RecentConversations inbox={inbox} />
    </div>
  );
}

function ClinicsNeedingAttention({
  clinics,
  ids,
  inbox,
  error,
  onRetry,
}: {
  clinics: ReadonlyArray<Schema<'ClinicListItem'>> | undefined;
  ids: ReadonlyArray<string>;
  inbox: Schema<'ChatInbox'> | undefined;
  error: unknown;
  onRetry: () => void;
}) {
  const assessments = useClinicsAssessments(ids);
  const presence = useClinicsPresence(ids);

  const items = clinics
    ? clinicsNeedingAttention(
        clinics.map((clinic, i) => ({
          clinic,
          assessments: assessments[i]?.data?.items,
          profiles: presence[i]?.data?.items,
          thread: inbox?.items.find((t) => t.clinic_id === clinic.id),
        })),
      )
    : null;

  return (
    <Card
      title="Clinics needing attention"
      padding="none"
      actions={
        <Link to="/clinics" className="rp-link rp-dashboard__view-all">
          View all
        </Link>
      }
    >
      {error ? (
        <QueryError error={error} onRetry={onRetry} />
      ) : !items ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          title="All caught up"
          description="None of your clinics needs anything right now."
        />
      ) : (
        <ul className="rp-dashboard__feed" aria-label="Clinics needing attention">
          {items.map((item) => (
            <li key={item.clinic.id}>
              <Link
                to="/clinics/$clinicId"
                params={{ clinicId: item.clinic.id }}
                className="rp-dashboard__feed-row"
              >
                <ClinicPhoto
                  className="rp-dashboard__thumb"
                  clinicId={item.clinic.id}
                  assetId={item.clinic.cover_asset_id}
                  name={item.clinic.name}
                />
                <span className="rp-dashboard__feed-text">
                  <span className="rp-dashboard__feed-title">{item.clinic.name}</span>
                  <span className="rp-dashboard__feed-sub">{item.reasons.join(' • ')}</span>
                </span>
                <time className="rp-dashboard__feed-time" dateTime={item.at}>
                  {formatRelativeTime(item.at)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const RESOURCE_ICON: Record<string, LucideIcon> = {
  clinic: Building2,
  assignment: UserRound,
  presence_profile: Search,
  assessment: ClipboardCheck,
  connection: Link2,
  chat_message: MessageCircle,
};

function RecentActivity({
  clinics,
  ids,
}: {
  clinics: ReadonlyArray<Schema<'ClinicListItem'>> | undefined;
  ids: ReadonlyArray<string>;
}) {
  const session = useCurrentSession();
  const results = useClinicsActivity(ids);
  const loading = !clinics || results.some((r) => r.isLoading);
  const events = results
    .flatMap((r) => r.data?.items ?? [])
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    .slice(0, 6);
  const nameOf = (clinicId: string | null) =>
    clinics?.find((c) => c.id === clinicId)?.name ?? 'A clinic';
  const personName = (id: string) => (id === session.user.id ? 'You' : null);

  return (
    <Card title="Recent activity" padding="none">
      {loading ? (
        <ListSkeleton />
      ) : events.length === 0 ? (
        <EmptyState title="No activity yet" description="Changes to your clinics appear here." />
      ) : (
        <ul className="rp-dashboard__feed" aria-label="Recent activity">
          {events.map((e) => {
            const Icon = RESOURCE_ICON[e.resource_type] ?? Activity;
            const mine = e.actor_user_id === session.user.id;
            return (
              <li key={e.id}>
                <Link
                  to="/clinics/$clinicId/activity"
                  params={{ clinicId: e.clinic_id ?? '' }}
                  className="rp-dashboard__feed-row"
                >
                  <span
                    className="rp-dashboard__feed-icon rp-dashboard__feed-icon--brand"
                    aria-hidden="true"
                  >
                    <Icon size={16} />
                  </span>
                  <span className="rp-dashboard__feed-text">
                    <span className="rp-dashboard__feed-title">{activityText(e, personName)}</span>
                    <span className="rp-dashboard__feed-sub">
                      {nameOf(e.clinic_id)}
                      {mine ? ' · You' : ''}
                    </span>
                  </span>
                  <time className="rp-dashboard__feed-time" dateTime={e.occurred_at}>
                    {formatRelativeTime(e.occurred_at)}
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

function RecentConversations({ inbox }: { inbox: ReturnType<typeof useChatInbox> }) {
  return (
    <Card
      title="Recent conversations"
      description="Latest messages from your clinics"
      padding="none"
    >
      {inbox.isError ? (
        <QueryError error={inbox.error} onRetry={() => void inbox.refetch()} />
      ) : !inbox.data ? (
        <ListSkeleton />
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
  );
}

function ListSkeleton() {
  return (
    <div className="rp-dashboard__threads-loading" aria-hidden="true">
      <Skeleton height={40} />
      <Skeleton height={40} />
      <Skeleton height={40} />
    </div>
  );
}
