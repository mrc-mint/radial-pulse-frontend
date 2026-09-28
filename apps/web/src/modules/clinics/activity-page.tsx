import { useClinicActivity, useUsers } from '@radial-pulse/api-client/react';
import { useCan, useClinicId, useCurrentSession } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Card,
  EmptyState,
  formatDateTime,
  formatRelativeTime,
  Pagination,
} from '@radial-pulse/ui/web';
import {
  Activity,
  ArrowRightLeft,
  Building2,
  ClipboardCheck,
  Link2,
  MessageCircle,
  Search,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { CardSkeleton, QueryError } from '../../app/page-kit';
import { activityText } from './activity';

const PAGE_SIZE = 20;

const RESOURCE_ICON: Record<string, LucideIcon> = {
  clinic: Building2,
  assignment: UserRound,
  presence_profile: Search,
  assessment: ClipboardCheck,
  connection: Link2,
  chat_message: MessageCircle,
};

/** The clinic's activity: who did what, newest first (contract audit events). */
export function ClinicActivityPage() {
  const clinicId = useClinicId();
  const session = useCurrentSession();
  const canSeeUsers = useCan('users:read');
  const users = useUsers({ limit: 200 }, { enabled: canSeeUsers });
  const [page, setPage] = useState(1);
  const activity = useClinicActivity(clinicId, {
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const personName = (id: string) =>
    id === session.user.id
      ? 'You'
      : (users.data?.items.find((u) => u.id === id)?.full_name ?? null);

  const actor = (e: Schema<'AuditEventRead'>) => {
    if (!e.actor_user_id) return 'Radial Pulse';
    return personName(e.actor_user_id) ?? 'A team member';
  };

  if (activity.isError) {
    return (
      <Card>
        <QueryError error={activity.error} onRetry={() => void activity.refetch()} />
      </Card>
    );
  }
  if (!activity.data) return <CardSkeleton lines={6} />;

  const events = activity.data.items;
  return (
    <Card title="Activity" description="Everything that happened for this clinic" padding="none">
      {events.length === 0 ? (
        <EmptyState title="No activity yet" description="Changes to this clinic appear here." />
      ) : (
        <ol className="rp-activity" aria-label="Clinic activity">
          {events.map((e) => {
            const Icon =
              RESOURCE_ICON[e.resource_type] ??
              (e.action.includes('stage') ? ArrowRightLeft : Activity);
            return (
              <li key={e.id} className="rp-activity__row">
                <span className="rp-activity__icon" aria-hidden="true">
                  <Icon size={16} />
                </span>
                <span className="rp-activity__text">
                  <span className="rp-activity__title">{activityText(e, personName)}</span>
                  <span className="rp-activity__meta">{actor(e)}</span>
                </span>
                <time
                  className="rp-activity__time"
                  dateTime={e.occurred_at}
                  title={formatDateTime(e.occurred_at) ?? undefined}
                >
                  {formatRelativeTime(e.occurred_at)}
                </time>
              </li>
            );
          })}
        </ol>
      )}
      {activity.data.total > PAGE_SIZE && (
        <div className="rp-activity__footer">
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={activity.data.total}
            itemLabel="events"
            onPageChange={setPage}
          />
        </div>
      )}
    </Card>
  );
}
