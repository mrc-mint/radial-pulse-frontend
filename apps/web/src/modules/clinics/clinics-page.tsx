import { useClinics, useDashboardSummary, useUsers } from '@radial-pulse/api-client/react';
import { useCan, useCurrentSession } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Avatar,
  Badge,
  Button,
  buttonClassName,
  Card,
  CLINIC_STAGE_TONES,
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
import { CLINIC_STAGE_LABELS } from '@radial-pulse/utils';
import { Link, useNavigate } from '@tanstack/react-router';
import { MapPin, Plus } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { ExternalLink, mapsUrl, QueryError } from '../../app/page-kit';
import { useNavLabel } from '../../app/shell';
import { AddClinicDrawer } from './add-clinic-drawer';

type ClinicRow = Schema<'ClinicListItem'>;
type Stage = Schema<'ClinicStage'>;

const PAGE_SIZE = 10;
const STAGES = Object.keys(CLINIC_STAGE_LABELS) as Stage[];
const UNASSIGNED = '__unassigned';

/**
 * Clinics (Platform Administrator) / My Clinics (Digital Success Manager).
 * One screen: the API scopes the list to the clinics the caller can see.
 */
export function ClinicsPage() {
  const title = useNavLabel('clinics', 'Clinics');
  const session = useCurrentSession();
  const canCreate = useCan('clinics:create');
  const canSeeUsers = useCan('users:read');
  const navigate = useNavigate();

  const [stage, setStage] = useState<'all' | Stage>('all');
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
    stage: stage === 'all' ? undefined : [stage],
    dsm_user_id: dsm && dsm !== UNASSIGNED ? dsm : undefined,
    unassigned: dsm === UNASSIGNED || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const counts = new Map(summary.data?.by_stage.map((s) => [s.stage, s.count]));
  const resetPage =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };

  const columns: TableColumn<ClinicRow>[] = [
    {
      id: 'name',
      header: 'Clinic',
      cell: (c) => (
        <span className="rp-cell-title">
          <Link to="/clinics/$clinicId" params={{ clinicId: c.id }} className="rp-link">
            {c.name}
          </Link>
          <span>{c.specialty ?? 'Specialty not set'}</span>
        </span>
      ),
    },
    {
      id: 'doctor',
      header: 'Doctor',
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
      header: 'Location',
      cell: (c) => {
        const url = mapsUrl(c);
        return (
          <span className="rp-cell-title">
            <span>{c.city ?? '—'}</span>
            {url && (
              <ExternalLink href={url}>
                <MapPin size={12} aria-hidden="true" /> View map
              </ExternalLink>
            )}
          </span>
        );
      },
    },
    ...(session.allClinics
      ? [
          {
            id: 'dsm',
            header: 'Digital Success Manager',
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
      id: 'stage',
      header: 'Stage',
      cell: (c) => (
        <Badge tone={CLINIC_STAGE_TONES[c.stage]} dot>
          {CLINIC_STAGE_LABELS[c.stage]}
        </Badge>
      ),
    },
    {
      id: 'work',
      header: 'Open work',
      align: 'end',
      cell: (c) => {
        const open = c.open_work.reduce((n, a) => n + a.open_count, 0);
        return open > 0 ? open : <span className="rp-muted">0</span>;
      },
    },
    {
      id: 'actions',
      header: '',
      headerLabel: 'Actions',
      width: 56,
      align: 'end',
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
              label: 'Unified Audit',
              onSelect: () =>
                void navigate({ to: '/clinics/$clinicId/audit', params: { clinicId: c.id } }),
            },
            {
              id: 'chat',
              label: 'Chat',
              onSelect: () =>
                void navigate({ to: '/clinics/$clinicId/chat', params: { clinicId: c.id } }),
            },
          ]}
        />
      ),
    },
  ];

  const filtered = Boolean(q) || stage !== 'all' || dsm !== null;

  return (
    <div className="rp-page">
      <PageHeader
        title={title}
        description={
          session.allClinics
            ? 'All clinics and prospects on Radial Pulse'
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
            label="Filter by stage"
            value={stage}
            onChange={resetPage(setStage)}
            items={[
              { value: 'all', label: 'All', count: summary.data?.total_clinics },
              ...STAGES.map((s) => ({
                value: s,
                label: CLINIC_STAGE_LABELS[s],
                count: counts.get(s),
              })),
            ]}
          />
        </div>
        <div className="rp-toolbar">
          <div className="rp-grow">
            <SearchInput
              label="Search clinics"
              placeholder="Search by clinic, doctor or website"
              value={search}
              onValueChange={resetPage(setSearch)}
            />
          </div>
          {canSeeUsers && (
            <div className="rp-fixed">
              <Select
                label="Digital Success Manager"
                value={dsm ?? 'all'}
                onChange={(v) => resetPage(setDsm)(v === 'all' ? null : v)}
                options={[
                  { value: 'all', label: 'All managers' },
                  { value: UNASSIGNED, label: 'Unassigned' },
                  ...(managers.data?.items ?? []).map((u) => ({
                    value: u.id,
                    label: u.full_name ?? u.email,
                  })),
                ]}
              />
            </div>
          )}
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
                description="Try a different search or stage."
                action={
                  <button
                    type="button"
                    className={buttonClassName({ variant: 'secondary', size: 'sm' })}
                    onClick={() => {
                      setSearch('');
                      setStage('all');
                      setDsm(null);
                      setPage(1);
                    }}
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
