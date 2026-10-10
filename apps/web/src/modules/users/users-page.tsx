import { useCreateUser, useResendInvite, useUsers } from '@radial-pulse/api-client-react';
import { useCan } from '@radial-pulse/shell-core';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  formatRelativeTime,
  Input,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  Table,
  USER_STATUS_TONES,
  type TableColumn,
} from '@radial-pulse/web-ui';
import { PLATFORM_ROLE_LABELS, USER_STATUS_LABELS } from '@radial-pulse/utils';
import { UserPlus } from 'lucide-react';
import { useDeferredValue, useState, type FormEvent } from 'react';
import { fieldErrors, mutationErrorMessage, QueryError } from '../../app/page-kit';

type User = Schema<'UserListItem'>;
type Role = Schema<'PlatformRole'>;

const PAGE_SIZE = 10;
/** Staff roles a Platform Administrator can invite on the web (clinic users are added per clinic). */
const INVITABLE: Role[] = ['digital_success_manager', 'platform_administrator'];

export function UsersPage() {
  const canManage = useCan('users:manage');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | 'all'>('all');
  const [active, setActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [inviting, setInviting] = useState(false);
  const q = useDeferredValue(search.trim());
  const users = useUsers({
    q: q || undefined,
    platform_role: role === 'all' ? undefined : role,
    is_active: active === 'all' ? undefined : active === 'active',
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const resend = useResendInvite();

  const columns: TableColumn<User>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (u) => (
        <span className="rp-person">
          <Avatar name={u.full_name ?? u.email} size="sm" decorative />
          <span className="rp-cell-title">
            <span>{u.full_name ?? u.email}</span>
            <span>{u.email}</span>
          </span>
        </span>
      ),
    },
    { id: 'role', header: 'Role', cell: (u) => PLATFORM_ROLE_LABELS[u.platform_role] },
    {
      id: 'status',
      header: 'Status',
      cell: (u) => (
        <Badge tone={USER_STATUS_TONES[u.status]} dot>
          {USER_STATUS_LABELS[u.status]}
        </Badge>
      ),
    },
    {
      id: 'clinics',
      header: 'Client portfolio',
      align: 'end',
      cell: (u) =>
        u.platform_role === 'digital_success_manager' ? (
          u.assigned_clinic_count
        ) : (
          <span className="rp-muted">—</span>
        ),
    },
    {
      id: 'login',
      header: 'Last sign-in',
      cell: (u) =>
        u.last_login_at ? (
          formatRelativeTime(u.last_login_at)
        ) : (
          <span className="rp-muted">Never</span>
        ),
    },
    ...(canManage
      ? [
          {
            id: 'actions',
            header: '',
            headerLabel: 'Actions',
            align: 'end' as const,
            cell: (u: User) =>
              u.status === 'invited' ? (
                <Button
                  size="sm"
                  variant="ghost"
                  loading={resend.isPending && resend.variables === u.id}
                  onClick={() => resend.mutate(u.id)}
                >
                  {resend.isSuccess && resend.variables === u.id ? 'Invite sent' : 'Resend invite'}
                </Button>
              ) : null,
          },
        ]
      : []),
  ];

  const reset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };

  return (
    <div className="rp-page">
      <PageHeader
        title="Users"
        description="Radial Pulse staff and their access"
        actions={
          canManage && (
            <Button leadingIcon={<UserPlus size={16} />} onClick={() => setInviting(true)}>
              Invite user
            </Button>
          )
        }
      />
      {resend.isError && (
        <p className="rp-form__error" role="alert">
          {mutationErrorMessage(resend.error)}
        </p>
      )}
      <Card padding="none">
        <div className="rp-toolbar">
          <div className="rp-grow">
            <SearchInput
              label="Search users"
              placeholder="Search by name or email"
              value={search}
              onValueChange={reset(setSearch)}
            />
          </div>
          <div className="rp-fixed">
            <Select
              label="Role"
              value={role}
              onChange={reset(setRole)}
              options={[
                { value: 'all', label: 'All roles' },
                ...(Object.keys(PLATFORM_ROLE_LABELS) as Role[]).map((r) => ({
                  value: r,
                  label: PLATFORM_ROLE_LABELS[r],
                })),
              ]}
            />
          </div>
          <div className="rp-fixed">
            <Select
              label="Access"
              value={active}
              onChange={reset(setActive)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active accounts' },
                { value: 'inactive', label: 'Deactivated accounts' },
              ]}
            />
          </div>
        </div>
        <Table
          caption="Users"
          columns={columns}
          rows={users.data?.items ?? []}
          getRowKey={(u) => u.id}
          loading={users.isLoading}
          error={
            users.isError ? (
              <QueryError error={users.error} onRetry={() => void users.refetch()} />
            ) : undefined
          }
          empty={<EmptyState title="No users match these filters" />}
          footer={
            users.data && users.data.total > 0 ? (
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                totalItems={users.data.total}
                itemLabel="users"
                onPageChange={setPage}
              />
            ) : undefined
          }
        />
      </Card>
      <InviteUserModal open={inviting} onClose={() => setInviting(false)} />
    </div>
  );
}

function InviteUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('digital_success_manager');
  const errors = fieldErrors(create.error);

  function close() {
    setName('');
    setEmail('');
    setRole('digital_success_manager');
    create.reset();
    onClose();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate(
      { email: email.trim(), full_name: name.trim() || null, platform_role: role },
      { onSuccess: close },
    );
  }

  const generalError =
    create.isError && Object.keys(errors).length === 0 ? mutationErrorMessage(create.error) : null;

  return (
    <Modal
      open={open}
      onClose={close}
      title="Invite user"
      description="They receive an email with a temporary password, sign in with this address and choose their own password."
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="invite-user-form" loading={create.isPending}>
            Send invite
          </Button>
        </>
      }
    >
      <form id="invite-user-form" className="rp-form" onSubmit={submit} noValidate>
        <Input
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.full_name?.[0]}
        />
        <Input
          label="Work email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email?.[0]}
        />
        <Select
          label="Role"
          value={role}
          onChange={setRole}
          options={INVITABLE.map((r) => ({ value: r, label: PLATFORM_ROLE_LABELS[r] }))}
          error={errors.platform_role?.[0]}
        />
        {generalError && (
          <p className="rp-form__error" role="alert">
            {generalError}
          </p>
        )}
      </form>
    </Modal>
  );
}
