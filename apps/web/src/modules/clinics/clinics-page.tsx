import { useClinics, useDashboardSummary, useUsers } from '@radial-pulse/api-client/react';
import { useCan, useCurrentSession } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Avatar,
  Badge,
  Button,
  buttonClassName,
  Card,
  displayHost,
  DropdownMenu,
  EmptyState,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  Table,
  Tabs,
  type TableColumn,
} from '@radial-pulse/ui/web';
import {
  CLINIC_STATUS_GROUP_LABELS,
  CLINIC_STATUS_STAGES,
  CLINIC_STATUSES,
  type ClinicStatus,
} from '@radial-pulse/utils';
import { Link, useNavigate } from '@tanstack/react-router';
import { MapPin, Plus } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { ClinicStatusBadge, ExternalLink, mapsUrl, QueryError } from '../../app/page-kit';
import { useNavLabel } from '../../app/shell';
import { AddClinicDrawer } from './add-clinic-drawer';

type ClinicRow = Schema<'ClinicListItem'>;
type StatusFilter = 'all' | ClinicStatus;

const PAGE_SIZE = 10;
const UNASSIGNED = '__unassigned';

/** `DashboardSummary` field holding each status's count. */
const COUNT_FIELD = {
  active: 'active',
  prospect: 'prospects',
  in_progress: 'in_progress',
  inactive: 'archived',
} as const satisfies Record<ClinicStatus, keyof Schema<'DashboardSummary'>>;

/** List query for a status: its stage group, or archived clinics for Inactive. */
function statusQuery(status: StatusFilter) {
  if (status === 'all') return {};
  if (status === 'inactive') return { archived: true };
  return { stage: CLINIC_STATUS_STAGES[status] };
}

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  ...CLINIC_STATUSES.map((s) => ({ value: s, label: CLINIC_STATUS_GROUP_LABELS[s] })),
];

/**
 * Clinics (Platform Administrator) / My Clinics (Digital Success Manager).
 * One screen: the API scopes the list to the clinics the caller can see.
 * Clinics show a status (the backend's stage groups, or Inactive when
 * archived); the tabs and the Status filter select the same thing.
 */
export function ClinicsPage() {
  const title = useNavLabel('clinics', 'Clinics');
  const session = useCurrentSession();
  const canCreate = useCan('clinics:create');
  const canSeeUsers = useCan('users:read');
  const navigate = useNavigate();

  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [dsm, setDsm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const q = useDeferredValue(search.trim());

  const summary = useDashboardSummary();
  const managers = useUsers(
    { platform_role: 'digital_success_manager', is_active: true, limit: 200 },
    { enabled: canSeeUsers },
  );
  const clinics = useClinics({
    q: q || undefined,
    ...statusQuery(status),
    dsm_user_id: dsm && dsm !== UNASSIGNED ? dsm : undefined,
    unassigned: dsm === UNASSIGNED || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const resetPage =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };
  const filtered = Boolean(q) || status !== 'all' || dsm !== null;
  const reset = () => {
    setSearch('');
    setStatus('all');
    setDsm(null);
    setPage(1);
  };

  const columns: TableColumn<ClinicRow>[] = [
    {
      id: 'number',
      header: '#',
      width: 48,
      cell: (_, index) => (
        <span className="rp-muted rp-nowrap">{(page - 1) * PAGE_SIZE + index + 1}</span>
      ),
    },
    {
      id: 'name',
      header: 'Clinic name',
      cell: (c) => (
        <Link to="/clinics/$clinicId" params={{ clinicId: c.id }} className="rp-link rp-nowrap">
          {c.name}
        </Link>
      ),
    },
    {
      id: 'doctor',
      header: 'Doctor name',
      cell: (c) =>
        c.primary_practitioner_name ? (
          <span className="rp-nowrap">{c.primary_practitioner_name}</span>
        ) : (
          <span className="rp-muted">Not set</span>
        ),
    },
    {
      id: 'website',
      header: 'Website',
      cell: (c) =>
        c.website_url ? (
          <ExternalLink href={c.website_url}>{displayHost(c.website_url)}</ExternalLink>
        ) : (
          <span className="rp-muted">None</span>
        ),
    },
    {
      id: 'location',
      header: 'Map location',
      cell: (c) => {
        const url = mapsUrl(c);
        return url ? (
          <ExternalLink href={url}>
            <MapPin size={14} aria-hidden="true" /> View map
            <span className="rp-sr-only"> for {c.name}</span>
          </ExternalLink>
        ) : (
          <span className="rp-muted">Not set</span>
        );
      },
    },
    ...(session.allClinics
      ? [
          {
            id: 'dsm',
            header: 'Assigned user',
            cell: (c: ClinicRow) =>
              c.dsm ? (
                <span className="rp-person">
                  <Avatar name={c.dsm.full_name ?? c.dsm.email} size="sm" decorative />
                  {c.dsm.full_name ?? c.dsm.email}
                </span>
              ) : (
                <Badge tone="warning" size="sm">
                  Unassigned
                </Badge>
              ),
          },
        ]
      : []),
    {
      id: 'status',
      header: 'Status',
      cell: (c) => <ClinicStatusBadge clinic={c} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      width: 72,
      align: 'center',
      cell: (c) => (
        <DropdownMenu
          label={`Actions for ${c.name}`}
          items={[
            {
              id: 'open',
              label: 'Open clinic',
              onSelect: () =>
                void navigate({ to: '/clinics/$clinicId', params: { clinicId: c.id } }),
            },
            {
              id: 'audit',
              label: 'Audit Report',
              onSelect: () =>
                void navigate({ to: '/clinics/$clinicId/audit', params: { clinicId: c.id } }),
            },
            ...(session.allClinics
              ? []
              : [
                  {
                    id: 'chat',
                    label: 'Chat',
                    onSelect: () =>
                      void navigate({ to: '/clinics/$clinicId/chat', params: { clinicId: c.id } }),
                  },
                ]),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="rp-page">
      <PageHeader
        title={title}
        description={
          session.allClinics
            ? 'Manage all clinics and prospects'
            : 'The clinics you are responsible for'
        }
        actions={
          canCreate && (
            <Button leadingIcon={<Plus size={16} />} onClick={() => setAdding(true)}>
              Add clinic
            </Button>
          )
        }
      />

      <Card padding="none">
        <div className="rp-clinics__tabs">
          <Tabs
            label="Filter by status"
            value={status}
            onChange={resetPage(setStatus)}
            items={[
              {
                value: 'all',
                label: session.allClinics ? 'All clinics' : 'All',
                count: summary.data?.total_clinics,
              },
              ...CLINIC_STATUSES.map((s) => ({
                value: s,
                label: CLINIC_STATUS_GROUP_LABELS[s],
                count: summary.data?.[COUNT_FIELD[s]],
              })),
            ]}
          />
        </div>
        <div className="rp-toolbar">
          <div className="rp-grow">
            <SearchInput
              label="Search clinics"
              placeholder="Search by clinic name, doctor name or website"
              value={search}
              onValueChange={resetPage(setSearch)}
            />
          </div>
          <div className="rp-fixed">
            <Select
              label="Status"
              value={status}
              onChange={resetPage(setStatus)}
              options={STATUS_OPTIONS}
            />
          </div>
          {canSeeUsers && (
            <div className="rp-fixed">
              <Select
                label="Assigned user"
                value={dsm ?? 'all'}
                onChange={(v) => resetPage(setDsm)(v === 'all' ? null : v)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: UNASSIGNED, label: 'Unassigned' },
                  ...(managers.data?.items ?? []).map((u) => ({
                    value: u.id,
                    label: u.full_name ?? u.email,
                  })),
                ]}
              />
            </div>
          )}
          <Button variant="secondary" onClick={reset} disabled={!filtered}>
            Reset
          </Button>
        </div>
        <Table
          caption={title}
          columns={columns}
          rows={clinics.data?.items ?? []}
          getRowKey={(c) => c.id}
          loading={clinics.isLoading}
          error={
            clinics.isError ? (
              <QueryError error={clinics.error} onRetry={() => void clinics.refetch()} />
            ) : undefined
          }
          empty={
            filtered ? (
              <EmptyState
                title="No clinics match these filters"
                description="Try a different search or status."
                action={
                  <button
                    type="button"
                    className={buttonClassName({ variant: 'secondary', size: 'sm' })}
                    onClick={reset}
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
              <EmptyState
                title={session.allClinics ? 'No clinics yet' : 'No clinics assigned to you yet'}
                description={
                  canCreate
                    ? 'Add a clinic to start its digital presence assessment.'
                    : 'Clinics assigned to you will appear here.'
                }
              />
            )
          }
          footer={
            clinics.data && clinics.data.total > 0 ? (
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                totalItems={clinics.data.total}
                itemLabel="clinics"
                onPageChange={setPage}
              />
            ) : undefined
          }
        />
      </Card>

      <AddClinicDrawer
        open={adding}
        onClose={() => setAdding(false)}
        onCreated={(clinic) =>
          void navigate({ to: '/clinics/$clinicId', params: { clinicId: clinic.id } })
        }
      />
    </div>
  );
}
