import {
  useClinic,
  useClinicAssignments,
  useSetClinicAssignment,
  useUsers,
  useWorkItems,
} from '@radial-pulse/api-client/react';
import {
  useCan,
  useClinicCan,
  useClinicId,
  useCurrentSession,
} from '@radial-pulse/platform-shell/core';
import {
  Avatar,
  Badge,
  Button,
  Card,
  displayHost,
  EmptyState,
  formatDate,
  formatRelativeTime,
  Select,
  WORK_ITEM_PRIORITY_TONES,
  WORK_ITEM_STATUS_TONES,
} from '@radial-pulse/ui/web';
import {
  WORK_AREA_LABELS,
  WORK_ITEM_PRIORITY_LABELS,
  WORK_ITEM_STATUS_LABELS,
} from '@radial-pulse/utils';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import {
  CardSkeleton,
  ClinicStatusBadge,
  DefinitionList,
  ExternalLink,
  mutationErrorMessage,
  QueryError,
} from '../../app/page-kit';
import { EditClinicDrawer } from './edit-clinic-drawer';

export function ClinicOverviewPage() {
  const clinicId = useClinicId();
  return (
    <div className="rp-grid rp-grid--main-aside">
      <div className="rp-stack">
        <ClinicInformation clinicId={clinicId} />
        <OpenWork clinicId={clinicId} />
      </div>
      <div className="rp-stack">
        <ManagerCard clinicId={clinicId} />
        <StageCard clinicId={clinicId} />
      </div>
    </div>
  );
}

function ClinicInformation({ clinicId }: { clinicId: string }) {
  const clinic = useClinic(clinicId);
  const canEdit = useClinicCan(clinicId, 'clinics:write');
  const [editing, setEditing] = useState(false);

  if (clinic.isError) {
    return (
      <Card title="Clinic information">
        <QueryError error={clinic.error} onRetry={() => void clinic.refetch()} />
      </Card>
    );
  }
  const c = clinic.data;
  if (!c) return <CardSkeleton lines={6} />;

  return (
    <Card
      title="Clinic information"
      actions={
        canEdit && (
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Pencil size={14} />}
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        )
      }
    >
      <DefinitionList
        items={[
          ['Clinic name', c.name],
          ['Specialty', c.specialty],
          ['Description', c.description],
          ['Phone', c.phone],
          ['Email', c.email],
          [
            'Website',
            c.website_url && (
              <ExternalLink href={c.website_url}>{displayHost(c.website_url)}</ExternalLink>
            ),
          ],
          [
            'Address',
            [c.address_line, c.city, c.state, c.postal_code].filter(Boolean).join(', ') || null,
          ],
          ['Added', formatDate(c.created_at)],
          ['Last updated', formatRelativeTime(c.updated_at)],
        ]}
      />
      <EditClinicDrawer clinic={c} open={editing} onClose={() => setEditing(false)} />
    </Card>
  );
}

function ManagerCard({ clinicId }: { clinicId: string }) {
  const session = useCurrentSession();
  const canAssign = useCan('assignments:manage');
  const canSeeUsers = useCan('users:read');
  const assignments = useClinicAssignments(clinicId);
  const managers = useUsers(
    { platform_role: 'digital_success_manager', is_active: true, limit: 200 },
    { enabled: canSeeUsers },
  );
  const setAssignment = useSetClinicAssignment(clinicId);
  const current = assignments.data?.find((a) => a.is_active) ?? null;
  const [choice, setChoice] = useState<string | null>(null);

  const manager = current ? managers.data?.items.find((u) => u.id === current.user_id) : undefined;
  const isMe = current?.user_id === session.user.id;
  const name = isMe ? session.user.name : (manager?.full_name ?? manager?.email ?? null);
  const selected = choice ?? current?.user_id ?? null;

  return (
    <Card
      title="Digital Success Manager"
      description="Responsible for this clinic’s digital presence"
    >
      {assignments.isError ? (
        <QueryError error={assignments.error} onRetry={() => void assignments.refetch()} />
      ) : !assignments.data ? (
        <CardSkeleton lines={1} />
      ) : current ? (
        <span className="rp-person">
          <Avatar name={name ?? 'Digital Success Manager'} size="md" decorative />
          <span className="rp-cell-title">
            <span>{name ?? 'Assigned'}</span>
            <span>
              {isMe ? 'You · ' : ''}since {formatDate(current.created_at)}
            </span>
          </span>
        </span>
      ) : (
        <Badge tone="warning">No Digital Success Manager yet</Badge>
      )}

      {canAssign && (
        <form
          className="rp-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (selected && selected !== current?.user_id) {
              setAssignment.mutate(selected, { onSuccess: () => setChoice(null) });
            }
          }}
        >
          <Select
            label={current ? 'Change Digital Success Manager' : 'Assign a Digital Success Manager'}
            value={selected}
            placeholder="Choose a manager"
            onChange={setChoice}
            options={(managers.data?.items ?? []).map((u) => ({
              value: u.id,
              label: `${u.full_name ?? u.email} · ${u.assigned_clinic_count} clinics`,
            }))}
            disabled={!managers.data}
          />
          {setAssignment.isError && (
            <p className="rp-form__error" role="alert">
              {mutationErrorMessage(setAssignment.error)}
            </p>
          )}
          <Button
            type="submit"
            variant="secondary"
            fullWidth
            loading={setAssignment.isPending}
            disabled={!selected || selected === current?.user_id}
          >
            {current ? 'Update assignment' : 'Assign'}
          </Button>
        </form>
      )}
    </Card>
  );
}

function StageCard({ clinicId }: { clinicId: string }) {
  const clinic = useClinic(clinicId);
  const c = clinic.data;
  return (
    <Card title="Status">
      {c ? (
        <div className="rp-stack-sm">
          <ClinicStatusBadge clinic={c} />
          <span className="rp-muted rp-small">Since {formatDate(c.stage_changed_at)}</span>
        </div>
      ) : (
        <CardSkeleton lines={1} />
      )}
    </Card>
  );
}

const DONE = new Set(['done', 'cancelled']);

function OpenWork({ clinicId }: { clinicId: string }) {
  const work = useWorkItems(clinicId, { limit: 50 });
  const open = work.data?.items.filter((w) => !DONE.has(w.status)) ?? [];

  return (
    <Card title="Open work" description="Actions for this clinic, from its assessments">
      {work.isError ? (
        <QueryError error={work.error} onRetry={() => void work.refetch()} />
      ) : !work.data ? (
        <CardSkeleton lines={3} />
      ) : open.length === 0 ? (
        <EmptyState title="Nothing open" description="All actions for this clinic are done." />
      ) : (
        <ul className="rp-work-list">
          {open.map((w) => (
            <li key={w.id}>
              <span className="rp-cell-title">
                <span className="rp-work-list__title">{w.title}</span>
                <span className="rp-work-list__meta">
                  {WORK_AREA_LABELS[w.area]}
                  {w.due_at ? ` · due ${formatDate(w.due_at)}` : ''}
                </span>
              </span>
              <span className="rp-row">
                <Badge tone={WORK_ITEM_PRIORITY_TONES[w.priority]} size="sm">
                  {WORK_ITEM_PRIORITY_LABELS[w.priority]}
                </Badge>
                <Badge tone={WORK_ITEM_STATUS_TONES[w.status]} size="sm" dot>
                  {WORK_ITEM_STATUS_LABELS[w.status]}
                </Badge>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
