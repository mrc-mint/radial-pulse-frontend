import type { Permission, Schema } from '@radial-pulse/shared-types';
import { delay, http, HttpResponse, type HttpResponseResolver } from 'msw';
import { createMockDb, mockNow, mockStageGroup, nextTimestamp, type MockDb } from './data';
import {
  blobToDataUrl,
  MOCK_ASSET_RESOURCE_TYPE,
  MOCK_MEDIA_KINDS,
  mockAvailableActions,
  type MockApproval,
  type MockAsset,
} from './media';
import {
  CLINIC_ADMIN_CLINIC,
  DSM_CLINIC,
  DSM_GLOBAL,
  PLATFORM_ADMIN_GLOBAL,
  personaFromToken,
  type MockPersona,
} from './personas';

/**
 * DEV/TEST ONLY. MSW handlers for operations in the published contract
 * (contracts/api/openapi.json 0.1.0). Responses are typed by the generated
 * schemas, errors are problem+json, and access follows the backend's rules:
 * 404 for a clinic the caller cannot reach, clinic users see published
 * assessments only. Listed in ./README.md.
 */

export interface MockOptions {
  /** The API Gateway base URL the app is configured with. */
  baseUrl: string;
  /** Artificial latency so loading states are visible (0 in tests). */
  latencyMs?: number;
  db?: MockDb;
  /**
   * Return photos and audio as `data:` URLs from download-url (React Native,
   * where no service worker can answer the mock storage URL).
   */
  inlineMedia?: boolean;
}

/** Approval transitions the mocks allow; null means 409 Conflict. */
function approvalTransition(
  state: Schema<'ApprovalState'>,
  action: Schema<'ApprovalAction'>,
): Schema<'ApprovalState'> | null {
  switch (action) {
    case 'submit':
      return state === 'draft' || state === 'redo_requested' || state === 'rejected'
        ? 'submitted'
        : null;
    case 'approve':
      return state === 'submitted' ? 'approved' : null;
    case 'reject':
      return state === 'submitted' ? 'rejected' : null;
    case 'redo':
      return state === 'submitted' ? 'redo_requested' : null;
    case 'publish':
    case 'handoff':
      return null;
  }
}

interface Principal {
  persona: MockPersona;
  user: MockDb['users'][number];
  global: Set<Permission>;
  allClinics: boolean;
  clinicPermissions(clinicId: string): Set<Permission>;
  visibleClinicIds(): string[];
}

function problem(
  status: number,
  type: string,
  title: string,
  detail?: string,
  errors?: Array<Schema<'ValidationIssue'>>,
) {
  const request_id = `mock-${Math.random().toString(16).slice(2, 10)}`;
  const body: Schema<'ProblemDetails'> = { type, title, status, detail, errors, request_id };
  return HttpResponse.json(body, {
    status,
    headers: { 'content-type': 'application/problem+json', 'x-request-id': request_id },
  });
}

const notFound = () => problem(404, 'not_found', 'Not found', 'Not found or no access.');
const forbidden = () => problem(403, 'forbidden', 'Not allowed', 'You are not allowed to do this.');

function page<T>(items: T[], url: URL, defaultLimit = 50) {
  const limit = Math.min(Number(url.searchParams.get('limit') ?? defaultLimit), 200);
  const offset = Number(url.searchParams.get('offset') ?? 0);
  return { items: items.slice(offset, offset + limit), total: items.length, limit, offset };
}

export function createMockHandlers(options: MockOptions) {
  const db = options.db ?? createMockDb();
  const api = `${options.baseUrl.replace(/\/+$/, '')}/api/v1`;
  const latency = options.latencyMs ?? 0;

  function principalFor(request: Request): Principal | null {
    const persona = personaFromToken(request.headers.get('authorization'));
    const user = persona && db.users.find((u) => u.id === persona.userId);
    if (!persona || !user) return null;
    const role = user.platform_role;
    return {
      persona,
      user,
      allClinics: role === 'platform_administrator',
      global: new Set(
        role === 'platform_administrator'
          ? PLATFORM_ADMIN_GLOBAL
          : role === 'digital_success_manager'
            ? DSM_GLOBAL
            : [],
      ),
      clinicPermissions(clinicId) {
        if (!db.clinics.some((c) => c.id === clinicId)) return new Set();
        if (role === 'platform_administrator') return new Set(DSM_CLINIC);
        if (role === 'digital_success_manager') {
          return db.assignments.get(clinicId)?.user_id === user.id
            ? new Set(DSM_CLINIC)
            : new Set();
        }
        return db.memberships.get(clinicId)?.has(user.id)
          ? new Set(CLINIC_ADMIN_CLINIC)
          : new Set();
      },
      visibleClinicIds() {
        return db.clinics.map((c) => c.id).filter((id) => this.clinicPermissions(id).size > 0);
      },
    };
  }

  /** Authenticated handler; `clinic` adds the clinic access gate (404 when no access). */
  function route<P extends Record<string, string>>(
    resolver: (ctx: {
      request: Request;
      url: URL;
      params: P;
      me: Principal;
      perms: Set<Permission>;
    }) => Response | Promise<Response>,
    gate: { clinic?: boolean; permission?: Permission } = {},
  ): HttpResponseResolver {
    return async ({ request, params }) => {
      if (latency) await delay(latency);
      const me = principalFor(request);
      if (!me) return problem(401, 'unauthorized', 'Not signed in');
      const typed = params as P;
      let perms = new Set<Permission>();
      if (gate.clinic) {
        perms = me.clinicPermissions(typed.clinic_id ?? '');
        if (perms.size === 0) return notFound();
      }
      if (gate.permission && !(perms.has(gate.permission) || me.global.has(gate.permission))) {
        return forbidden();
      }
      return resolver({ request, url: new URL(request.url), params: typed, me, perms });
    };
  }

  /** An approval as the caller sees it: with the actions they may take now. */
  const approvalRead = (
    a: MockApproval,
    perms: ReadonlySet<Permission>,
  ): Schema<'ApprovalRead'> => ({
    ...a,
    available_actions: mockAvailableActions(a, perms),
  });

  /**
   * A file as the caller sees it: without the mock's stored bytes, with its
   * review. Internal notes are for Radial Pulse staff (media:review) only.
   */
  const assetRead = (asset: MockAsset, perms: ReadonlySet<Permission>): Schema<'AssetRead'> => {
    const { blob: _blob, ...read } = asset;
    void _blob;
    const approval = db.approvals.find(
      (a) => a.resource_type === MOCK_ASSET_RESOURCE_TYPE && a.resource_id === asset.id,
    );
    return {
      ...read,
      review: approval
        ? {
            approval_id: approval.id,
            state: approval.state,
            clinic_message: approval.clinic_message,
            internal_note: perms.has('media:review') ? approval.last_comment : null,
            submitted_by_user_id: approval.submitted_by_user_id,
            decided_by_user_id: approval.decided_by_user_id,
            available_actions: mockAvailableActions(approval, perms),
            updated_at: approval.updated_at,
          }
        : null,
    };
  };

  /** 422 when an upload names a media label that is not in the taxonomy. */
  const labelProblem = (body: Schema<'AssetUploadRequest'>) => {
    const dims = {
      category: body.kind === 'audio' ? 'voice_sample' : 'clinic_photo_category',
      apron: 'practitioner_apron',
      angle: 'practitioner_angle',
      outfit: 'practitioner_outfit',
    } as const;
    for (const [field, dimension] of Object.entries(dims) as Array<
      [keyof typeof dims, Schema<'MediaTaxonomyDimension'>]
    >) {
      const code = body[field];
      if (code && !db.mediaTaxonomy.some((v) => v.dimension === dimension && v.code === code)) {
        return problem(422, 'validation_error', 'Invalid input', undefined, [
          { loc: ['body', field], msg: `Unknown ${dimension} code`, type: 'value_error' },
        ]);
      }
    }
    return null;
  };

  const personRef = (userId: string | null | undefined): Schema<'PersonRef'> | null => {
    const u = db.users.find((x) => x.id === userId);
    return u ? { id: u.id, email: u.email, full_name: u.full_name } : null;
  };

  const openStatuses = new Set<Schema<'WorkItemStatus'>>([
    'todo',
    'in_progress',
    'blocked',
    'in_review',
  ]);

  const listItem = (c: MockDb['clinics'][number]): Schema<'ClinicListItem'> => {
    const open = new Map<Schema<'WorkArea'>, number>();
    for (const w of db.workItems) {
      if (w.clinic_id === c.id && openStatuses.has(w.status))
        open.set(w.area, (open.get(w.area) ?? 0) + 1);
    }
    return {
      ...c,
      stage_group: mockStageGroup(c.stage),
      dsm: personRef(db.assignments.get(c.id)?.user_id),
      open_work: [...open].map(([area, open_count]) => ({ area, open_count })),
    };
  };

  const toClinicRead = (c: MockDb['clinics'][number]): Schema<'ClinicRead'> => {
    const { primary_practitioner_name: _doctor, ...read } = c;
    void _doctor;
    return { ...read, stage_group: mockStageGroup(c.stage) };
  };

  const assessmentsFor = (clinicId: string, me: Principal, perms: Set<Permission>) =>
    db.assessments
      .filter((a) => a.clinic_id === clinicId)
      // Clinic users (no assessments:request) see published assessments only.
      .filter((a) => perms.has('assessments:request') || a.publication_state === 'published')
      .sort((a, b) => b.sequence - a.sequence);

  const unreadFor = (userId: string, clinicId: string, side: Schema<'ChatSide'>) => {
    const lastRead = db.chatReads.get(userId)?.get(clinicId) ?? '';
    return db.messages.filter(
      (m) => m.clinic_id === clinicId && m.sender_side !== side && m.created_at > lastRead,
    ).length;
  };

  const connectionOf = (clinicId: string, platform: string) =>
    db.connections.get(clinicId)?.find((c) => c.platform === platform);

  /** One-time Connect `state` values issued by `start` (the backend stores their hash). */
  const pendingConnects = new Map<
    string,
    { clinicId: string; platform: Schema<'ConnectionPlatform'>; userId: string }
  >();

  /** Appends to the clinic's activity (audit events), newest first. */
  const record = (
    clinicId: string,
    me: Principal,
    action: string,
    resourceType: string,
    resourceId: string | null,
    details: Record<string, unknown> = {},
  ) => {
    db.auditEvents.unshift({
      id: crypto.randomUUID(),
      clinic_id: clinicId,
      actor_type: 'user',
      actor_user_id: me.user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      request_id: null,
      occurred_at: nextTimestamp(),
    });
  };

  const sideOf = (me: Principal): Schema<'ChatSide'> =>
    me.user.platform_role === 'clinic_user' ? 'clinic' : 'radial_pulse';

  return [
    http.get(`${options.baseUrl.replace(/\/+$/, '')}/health`, () =>
      HttpResponse.json({
        status: 'ok',
        service: 'radial-pulse-api',
        environment: 'mock',
        version: 'mock',
        contract_version: '0.1.0',
      } satisfies Schema<'HealthResponse'>),
    ),

    http.get(
      `${api}/auth/me`,
      route(({ me }) =>
        HttpResponse.json({
          id: me.user.id,
          email: me.user.email,
          full_name: me.user.full_name,
          phone: me.user.phone,
          platform_role: me.user.platform_role,
          permissions: [...me.global],
          all_clinics: me.allClinics,
          clinics: me.allClinics
            ? []
            : me.visibleClinicIds().map((clinic_id) => ({
                clinic_id,
                assigned: db.assignments.get(clinic_id)?.user_id === me.user.id,
                clinic_role: db.memberships.get(clinic_id)?.get(me.user.id) ?? null,
                permissions: [...me.clinicPermissions(clinic_id)].sort(),
              })),
          avatar_url: null,
          sign_in_method: 'email_password',
          last_login_at: me.user.last_login_at,
        } satisfies Schema<'MeResponse'>),
      ),
    ),

    http.get(
      `${api}/dashboard/summary`,
      route(({ me }) => {
        const visible = new Set(me.visibleClinicIds());
        // Totals and stage counts cover active clinics; archived are counted apart
        // (backend: total_clinics = prospects + in_progress + active).
        const all = db.clinics.filter((c) => visible.has(c.id));
        const clinics = all.filter((c) => c.is_active);
        const stages: Array<Schema<'ClinicStage'>> = [
          'prospective_client',
          'profile_enriched',
          'assessment_completed',
          'client_discussion',
          'active_client',
        ];
        const count = (s: Schema<'ClinicStage'>) => clinics.filter((c) => c.stage === s).length;
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(mockNow());
          d.setUTCDate(1);
          d.setUTCMonth(d.getUTCMonth() - (5 - i));
          return d.toISOString().slice(0, 7);
        });
        return HttpResponse.json({
          total_clinics: clinics.length,
          archived: all.length - clinics.length,
          prospects: count('prospective_client') + count('profile_enriched'),
          in_progress: count('assessment_completed') + count('client_discussion'),
          active: count('active_client'),
          by_stage: stages.map((stage) => ({ stage, count: count(stage) })),
          new_clinics_by_month: months.map((month) => ({
            month,
            // Every clinic created that month, archived since or not (as the backend).
            count: all.filter((c) => c.created_at.startsWith(month)).length,
          })),
          assessments_awaiting_review: db.assessments.filter(
            (a) => visible.has(a.clinic_id) && a.approval_state === 'submitted',
          ).length,
          open_work_items: db.workItems.filter(
            (w) => visible.has(w.clinic_id) && openStatuses.has(w.status),
          ).length,
        } satisfies Schema<'DashboardSummary'>);
      }),
    ),

    http.get(
      `${api}/clinics`,
      route(({ url, me }) => {
        const visible = new Set(me.visibleClinicIds());
        const q = url.searchParams.get('q')?.toLowerCase().trim();
        const stages = url.searchParams.getAll('stage');
        const group = url.searchParams.get('group');
        const dsm = url.searchParams.get('dsm_user_id');
        const unassigned = url.searchParams.get('unassigned') === 'true';
        const archived = url.searchParams.get('archived') === 'true';
        const rows = db.clinics
          .filter((c) => visible.has(c.id))
          .filter((c) => c.is_active !== archived)
          .filter((c) => stages.length === 0 || stages.includes(c.stage))
          .filter((c) => !group || mockStageGroup(c.stage) === group)
          .filter((c) => !dsm || db.assignments.get(c.id)?.user_id === dsm)
          .filter((c) => !unassigned || !db.assignments.has(c.id))
          .filter(
            (c) =>
              !q ||
              [c.name, c.primary_practitioner_name, c.website_url ?? '', c.city ?? ''].some((v) =>
                v.toLowerCase().includes(q),
              ),
          )
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(listItem);
        return HttpResponse.json(page(rows, url) satisfies Schema<'Page_ClinicListItem_'>);
      }),
    ),

    http.post(
      `${api}/clinics`,
      route(
        async ({ request, me }) => {
          const body = (await request.json()) as Schema<'ClinicCreate'>;
          if (!body.name?.trim()) {
            return problem(422, 'validation_error', 'Invalid input', undefined, [
              { loc: ['body', 'name'], msg: 'Field required', type: 'missing' },
            ]);
          }
          const id = crypto.randomUUID();
          const clinic = {
            id,
            organization_id: db.clinics[0]!.organization_id,
            name: body.name.trim(),
            primary_practitioner_name: body.primary_practitioner_name ?? '',
            specialty: body.specialty ?? null,
            description: body.description ?? null,
            website_url: body.website_url ?? null,
            email: body.email ?? null,
            phone: body.phone ?? null,
            address_line: body.address_line ?? null,
            city: body.city ?? null,
            state: body.state ?? null,
            postal_code: body.postal_code ?? null,
            country: body.country ?? 'IN',
            latitude: body.latitude ?? null,
            longitude: body.longitude ?? null,
            stage: 'prospective_client' as const,
            stage_changed_at: mockNow(),
            is_active: true,
            archived_reason: null,
            cover_asset_id: null,
            created_at: mockNow(),
            updated_at: mockNow(),
          };
          db.clinics.push(clinic);
          // A DSM who adds a client organization gets it in their portfolio (outbound sales model).
          if (me.user.platform_role === 'digital_success_manager') {
            db.assignments.set(id, {
              id: crypto.randomUUID(),
              clinic_id: id,
              user_id: me.user.id,
              assigned_by_user_id: me.user.id,
              is_active: true,
              created_at: mockNow(),
              updated_at: mockNow(),
            });
          }
          return HttpResponse.json(toClinicRead(clinic), { status: 201 });
        },
        { permission: 'clinics:create' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id`,
      route<{ clinic_id: string }>(
        ({ params }) =>
          HttpResponse.json(toClinicRead(db.clinics.find((c) => c.id === params.clinic_id)!)),
        { clinic: true },
      ),
    ),

    http.patch(
      `${api}/clinics/:clinic_id`,
      route<{ clinic_id: string }>(
        async ({ request, params, me }) => {
          const body = (await request.json()) as Schema<'ClinicUpdate'>;
          const clinic = db.clinics.find((c) => c.id === params.clinic_id)!;
          for (const [k, v] of Object.entries(body)) {
            if (v !== undefined && k in clinic) (clinic as Record<string, unknown>)[k] = v;
          }
          clinic.updated_at = nextTimestamp();
          record(clinic.id, me, 'clinic.update', 'clinic', clinic.id, {
            fields: Object.keys(body),
          });
          return HttpResponse.json(toClinicRead(clinic));
        },
        { clinic: true, permission: 'clinics:write' },
      ),
    ),

    // Status actions (Radial Pulse staff only: clinics:manage).
    http.post(
      `${api}/clinics/:clinic_id/stage`,
      route<{ clinic_id: string }>(
        async ({ request, params, me }) => {
          const body = (await request.json()) as Schema<'StageChange'>;
          const clinic = db.clinics.find((c) => c.id === params.clinic_id)!;
          if (!clinic.is_active) {
            return problem(
              409,
              'invalid_state',
              'Action not allowed in the current state',
              'This clinic is archived. Restore it first',
            );
          }
          if (clinic.stage === body.stage) {
            return problem(
              409,
              'invalid_state',
              'Action not allowed in the current state',
              'The clinic is already at this stage',
            );
          }
          const from = clinic.stage;
          clinic.stage = body.stage;
          clinic.stage_changed_at = nextTimestamp();
          clinic.updated_at = clinic.stage_changed_at;
          record(clinic.id, me, 'clinic.stage_change', 'clinic', clinic.id, {
            from,
            to: body.stage,
            note: body.note ?? null,
          });
          return HttpResponse.json(toClinicRead(clinic));
        },
        { clinic: true, permission: 'clinics:manage' },
      ),
    ),

    http.post(
      `${api}/clinics/:clinic_id/archive`,
      route<{ clinic_id: string }>(
        async ({ request, params, me }) => {
          const body = (await request.json()) as Schema<'ArchiveRequest'>;
          if (!body.reason || body.reason.trim().length < 3) {
            return problem(422, 'validation_error', 'Invalid input', undefined, [
              {
                loc: ['body', 'reason'],
                msg: 'Give a reason (at least 3 characters)',
                type: 'too_short',
              },
            ]);
          }
          const clinic = db.clinics.find((c) => c.id === params.clinic_id)!;
          if (!clinic.is_active) {
            return problem(
              409,
              'invalid_state',
              'Action not allowed in the current state',
              'This clinic is already archived',
            );
          }
          clinic.is_active = false;
          clinic.archived_reason = body.reason.trim();
          clinic.updated_at = nextTimestamp();
          record(clinic.id, me, 'clinic.archive', 'clinic', clinic.id, {
            reason: clinic.archived_reason,
          });
          return HttpResponse.json(toClinicRead(clinic));
        },
        { clinic: true, permission: 'clinics:manage' },
      ),
    ),

    http.post(
      `${api}/clinics/:clinic_id/restore`,
      route<{ clinic_id: string }>(
        ({ params, me }) => {
          const clinic = db.clinics.find((c) => c.id === params.clinic_id)!;
          if (clinic.is_active) {
            return problem(
              409,
              'invalid_state',
              'Action not allowed in the current state',
              'This clinic is not archived',
            );
          }
          clinic.is_active = true;
          clinic.archived_reason = null;
          clinic.updated_at = nextTimestamp();
          record(clinic.id, me, 'clinic.restore', 'clinic', clinic.id);
          return HttpResponse.json(toClinicRead(clinic));
        },
        { clinic: true, permission: 'clinics:manage' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/practitioners`,
      route<{ clinic_id: string }>(
        ({ url, params }) => {
          const rows = db.practitioners
            .filter((x) => x.clinic_id === params.clinic_id)
            .sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
          return HttpResponse.json(page(rows, url) satisfies Schema<'Page_PractitionerRead_'>);
        },
        { clinic: true, permission: 'practitioners:read' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/snapshots`,
      route<{ clinic_id: string }>(
        ({ url, params }) => {
          const metric = url.searchParams.get('metric_key');
          const source = url.searchParams.get('source');
          let rows = db.snapshots
            .filter((x) => x.clinic_id === params.clinic_id)
            .filter((x) => !metric || x.metric_key === metric)
            .filter((x) => !source || x.source === source)
            .sort((a, b) => b.fetched_at.localeCompare(a.fetched_at));
          if (url.searchParams.get('latest') === 'true') {
            const seen = new Set<string>();
            rows = rows.filter((x) => {
              const key = `${x.source}|${x.metric_key}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          }
          return HttpResponse.json(page(rows, url) satisfies Schema<'Page_MetricSnapshotRead_'>);
        },
        { clinic: true, permission: 'snapshots:read' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/audit-events`,
      route<{ clinic_id: string }>(
        ({ url, params }) => {
          const rows = db.auditEvents.filter((x) => x.clinic_id === params.clinic_id);
          return HttpResponse.json(page(rows, url) satisfies Schema<'Page_AuditEventRead_'>);
        },
        { clinic: true, permission: 'audit_log:read' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/assignments`,
      route<{ clinic_id: string }>(
        ({ params }) => {
          const a = db.assignments.get(params.clinic_id);
          return HttpResponse.json(a ? [a] : []);
        },
        { clinic: true },
      ),
    ),

    http.put(
      `${api}/clinics/:clinic_id/assignment`,
      route<{ clinic_id: string }>(
        async ({ request, params, me }) => {
          if (!me.global.has('assignments:manage')) return forbidden();
          const { user_id } = (await request.json()) as Schema<'AssignmentSet'>;
          const target = db.users.find((u) => u.id === user_id);
          if (!target || target.platform_role !== 'digital_success_manager') {
            return problem(
              422,
              'validation_error',
              'Invalid input',
              'Choose a Digital Success Manager.',
              [
                {
                  loc: ['body', 'user_id'],
                  msg: 'Not a Digital Success Manager',
                  type: 'value_error',
                },
              ],
            );
          }
          const previous = db.assignments.get(params.clinic_id);
          const assignment: Schema<'AssignmentRead'> = {
            id: crypto.randomUUID(),
            clinic_id: params.clinic_id,
            user_id,
            assigned_by_user_id: me.user.id,
            is_active: true,
            created_at: mockNow(),
            updated_at: mockNow(),
          };
          db.assignments.set(params.clinic_id, assignment);
          record(params.clinic_id, me, 'assignment.change', 'assignment', assignment.id, {
            user_id,
          });
          for (const u of db.users) {
            if (u.id === user_id) u.assigned_clinic_count += 1;
            if (previous && u.id === previous.user_id) u.assigned_clinic_count -= 1;
          }
          return HttpResponse.json(assignment);
        },
        { clinic: true },
      ),
    ),

    http.get(
      `${api}/users`,
      route(
        ({ url }) => {
          const role = url.searchParams.get('platform_role');
          const active = url.searchParams.get('is_active');
          const q = url.searchParams.get('q')?.toLowerCase().trim();
          const rows = db.users
            .filter((u) => !role || u.platform_role === role)
            .filter((u) => active === null || String(u.is_active) === active)
            .filter((u) => !q || `${u.full_name ?? ''} ${u.email}`.toLowerCase().includes(q))
            .map(({ personaId: _p, ...u }) => (void _p, u));
          return HttpResponse.json(page(rows, url) satisfies Schema<'Page_UserListItem_'>);
        },
        { permission: 'users:read' },
      ),
    ),

    http.post(
      `${api}/users`,
      route(
        async ({ request }) => {
          const body = (await request.json()) as Schema<'UserCreate'>;
          if (!/^\S+@\S+\.\S+$/.test(body.email ?? '')) {
            return problem(422, 'validation_error', 'Invalid input', undefined, [
              {
                loc: ['body', 'email'],
                msg: 'value is not a valid email address',
                type: 'value_error',
              },
            ]);
          }
          if (db.users.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) {
            return problem(
              409,
              'conflict',
              'Already exists',
              'A user with this email already exists.',
            );
          }
          const created = {
            id: crypto.randomUUID(),
            email: body.email,
            full_name: body.full_name ?? null,
            phone: body.phone ?? null,
            platform_role: body.platform_role,
            status: 'invited' as const,
            is_active: true,
            created_at: mockNow(),
            last_invited_at: mockNow(),
            last_login_at: null,
            assigned_clinic_count: 0,
          };
          db.users.push(created);
          const { assigned_clinic_count: _c, ...read } = created;
          void _c;
          return HttpResponse.json(read satisfies Schema<'UserRead'>, { status: 201 });
        },
        { permission: 'users:manage' },
      ),
    ),

    http.post(
      `${api}/users/:user_id/resend-invite`,
      route<{ user_id: string }>(
        ({ params }) => {
          const u = db.users.find((x) => x.id === params.user_id);
          if (!u) return notFound();
          if (u.status !== 'invited')
            return problem(409, 'conflict', 'Wrong state', 'This user has already signed in.');
          u.last_invited_at = mockNow();
          return new HttpResponse(null, { status: 202 });
        },
        { permission: 'users:manage' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/presence-profiles`,
      route<{ clinic_id: string }>(
        ({ url, params }) =>
          HttpResponse.json(
            page(
              db.presence.filter((p) => p.clinic_id === params.clinic_id),
              url,
              100,
            ) satisfies Schema<'Page_PresenceProfileRead_'>,
          ),
        { clinic: true, permission: 'presence:read' },
      ),
    ),

    http.patch(
      `${api}/clinics/:clinic_id/presence-profiles/:profile_id`,
      route<{ clinic_id: string; profile_id: string }>(
        async ({ request, params, me }) => {
          const profile = db.presence.find(
            (p) => p.id === params.profile_id && p.clinic_id === params.clinic_id,
          );
          if (!profile) return notFound();
          const body = (await request.json()) as Schema<'PresenceProfileUpdate'>;
          if (body.verification) {
            profile.verification = body.verification;
            profile.verified_by_user_id = body.verification === 'unverified' ? null : me.user.id;
          }
          if (body.display_name !== undefined) profile.display_name = body.display_name;
          profile.updated_at = nextTimestamp();
          record(profile.clinic_id, me, 'presence_profile.update', 'presence_profile', profile.id, {
            platform: profile.platform,
            verification: profile.verification,
          });
          return HttpResponse.json(profile);
        },
        { clinic: true, permission: 'presence:write' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/assessments`,
      route<{ clinic_id: string }>(
        ({ url, params, me, perms }) => {
          const rows = assessmentsFor(params.clinic_id, me, perms).map(
            ({ components: _c, ...summary }) => (void _c, summary),
          );
          return HttpResponse.json(page(rows, url, 20) satisfies Schema<'Page_AssessmentRead_'>);
        },
        { clinic: true, permission: 'assessments:read' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/assessments/:assessment_id`,
      route<{ clinic_id: string; assessment_id: string }>(
        ({ params, me, perms }) => {
          const a = assessmentsFor(params.clinic_id, me, perms).find(
            (x) => x.id === params.assessment_id,
          );
          return a ? HttpResponse.json(a) : notFound();
        },
        { clinic: true, permission: 'assessments:read' },
      ),
    ),

    http.post(
      `${api}/clinics/:clinic_id/assessments`,
      route<{ clinic_id: string }>(
        ({ params, me }) => {
          const existing = db.assessments.filter((a) => a.clinic_id === params.clinic_id);
          const created: Schema<'AssessmentDetail'> = {
            id: crypto.randomUUID(),
            clinic_id: params.clinic_id,
            sequence: Math.max(0, ...existing.map((a) => a.sequence)) + 1,
            status: 'queued',
            approval_state: 'draft',
            publication_state: 'unpublished',
            methodology_version: '2026.09',
            overall_score: null,
            summary: null,
            requested_by_user_id: me.user.id,
            created_at: mockNow(),
            started_at: null,
            completed_at: null,
            published_at: null,
            components: (
              [
                'website',
                'google_business_profile',
                'local_search',
                'search_readiness',
                'social_presence',
                'competitor_benchmark',
              ] as const
            ).map((key) => ({
              key,
              status: key === 'social_presence' ? ('not_available' as const) : ('pending' as const),
              score: null,
              summary: null,
              status_reason: key === 'social_presence' ? 'no_engine_deployed' : null,
              engine_name: null,
              engine_version: null,
              computed_at: null,
              findings: [],
            })),
          };
          db.assessments.push(created);
          const { components: _c, ...read } = created;
          void _c;
          return HttpResponse.json(read satisfies Schema<'AssessmentRead'>, { status: 202 });
        },
        { clinic: true, permission: 'assessments:request' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/work-items`,
      route<{ clinic_id: string }>(
        ({ url, params }) => {
          const status = url.searchParams.get('status');
          const area = url.searchParams.get('area');
          const rows = db.workItems
            .filter((w) => w.clinic_id === params.clinic_id)
            .filter((w) => !status || w.status === status)
            .filter((w) => !area || w.area === area);
          return HttpResponse.json(page(rows, url) satisfies Schema<'Page_WorkItemRead_'>);
        },
        { clinic: true, permission: 'work_items:read' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/connections`,
      route<{ clinic_id: string }>(
        ({ params }) => HttpResponse.json(db.connections.get(params.clinic_id) ?? []),
        { clinic: true, permission: 'connections:read' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/connections/:platform`,
      route<{ clinic_id: string; platform: string }>(
        ({ params }) => {
          const row = connectionOf(params.clinic_id, params.platform);
          return row ? HttpResponse.json(row) : notFound();
        },
        { clinic: true, permission: 'connections:read' },
      ),
    ),

    // Connect: start returns a sign-in address carrying a one-time `state`;
    // complete accepts that state once (the platform's `code` is not checked).
    http.post(
      `${api}/clinics/:clinic_id/connections/:platform/start`,
      route<{ clinic_id: string; platform: string }>(
        async ({ request, params, me }) => {
          const row = connectionOf(params.clinic_id, params.platform);
          if (!row) return notFound();
          if (!row.available) {
            return problem(
              503,
              'service_unavailable',
              'Service unavailable',
              `${row.label} connection is not set up yet`,
            );
          }
          const body = (await request.json()) as Schema<'ConnectionStartRequest'>;
          if (!body.redirect_uri) {
            return problem(422, 'validation_error', 'Invalid request', undefined, [
              { loc: ['body', 'redirect_uri'], msg: 'Field required', type: 'missing' },
            ]);
          }
          const state = `mock-state-${Math.random().toString(16).slice(2, 12)}`;
          pendingConnects.set(state, {
            clinicId: params.clinic_id,
            platform: row.platform,
            userId: me.user.id,
          });
          if (row.status !== 'connected') row.status = 'pending';
          const authorization = new URL(`https://mock-oauth.radialpulse.example/${row.platform}`);
          authorization.searchParams.set('state', state);
          authorization.searchParams.set('redirect_uri', body.redirect_uri);
          return HttpResponse.json({
            platform: row.platform,
            authorization_url: authorization.toString(),
            expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
          } satisfies Schema<'ConnectionStartResponse'>);
        },
        { clinic: true, permission: 'connections:manage' },
      ),
    ),

    http.post(
      `${api}/clinics/:clinic_id/connections/:platform/complete`,
      route<{ clinic_id: string; platform: string }>(
        async ({ request, params, me }) => {
          const row = connectionOf(params.clinic_id, params.platform);
          if (!row) return notFound();
          const body = (await request.json()) as Schema<'ConnectionCompleteRequest'>;
          const pending = pendingConnects.get(body.state);
          if (!pending) {
            return problem(
              409,
              'invalid_state',
              'Action not allowed in the current state',
              'No connection is in progress. Press Connect again.',
            );
          }
          if (
            pending.clinicId !== params.clinic_id ||
            pending.platform !== row.platform ||
            pending.userId !== me.user.id
          ) {
            return problem(
              422,
              'validation_error',
              'Invalid request',
              'This sign-in does not match the one that was started',
            );
          }
          pendingConnects.delete(body.state);
          const clinic = db.clinics.find((c) => c.id === params.clinic_id)!;
          Object.assign(row, {
            status: 'connected',
            external_account_name: clinic.name,
            connected_at: nextTimestamp(),
            connected_by_user_id: me.user.id,
            last_synced_at: null,
            last_error: null,
            scopes: ['read_insights'],
          } satisfies Partial<Schema<'ConnectionRead'>>);
          record(params.clinic_id, me, 'connection.connected', 'connection', row.platform, {
            platform: row.platform,
          });
          return HttpResponse.json(row);
        },
        { clinic: true, permission: 'connections:manage' },
      ),
    ),

    http.post(
      `${api}/clinics/:clinic_id/connections/:platform/disconnect`,
      route<{ clinic_id: string; platform: string }>(
        ({ params }) => {
          const row = connectionOf(params.clinic_id, params.platform);
          if (!row) return notFound();
          if (row.status === 'not_connected' || row.status === 'disconnected') {
            return problem(404, 'not_found', 'Not found', `${row.label} is not connected`);
          }
          Object.assign(row, {
            status: 'disconnected',
            external_account_name: null,
            connected_at: null,
            connected_by_user_id: null,
            last_synced_at: null,
            last_error: null,
            scopes: [],
            token_expires_at: null,
          } satisfies Partial<Schema<'ConnectionRead'>>);
          return HttpResponse.json(row);
        },
        { clinic: true, permission: 'connections:manage' },
      ),
    ),

    http.get(
      `${api}/chat/inbox`,
      route(({ me }) => {
        const side = sideOf(me);
        const threads = me
          .visibleClinicIds()
          .filter((id) => me.clinicPermissions(id).has('chat:read'))
          .flatMap((clinicId) => {
            const msgs = db.messages
              .filter((m) => m.clinic_id === clinicId)
              .sort((a, b) => a.created_at.localeCompare(b.created_at));
            const last = msgs.at(-1);
            if (!last) return [];
            return [
              {
                clinic_id: clinicId,
                clinic_name: db.clinics.find((c) => c.id === clinicId)!.name,
                last_message: last,
                unread_count: unreadFor(me.user.id, clinicId, side),
              },
            ];
          })
          .sort((a, b) => b.last_message.created_at.localeCompare(a.last_message.created_at));
        return HttpResponse.json({
          items: threads,
          unread_messages: threads.reduce((n, t) => n + t.unread_count, 0),
          unread_threads: threads.filter((t) => t.unread_count > 0).length,
        } satisfies Schema<'ChatInbox'>);
      }),
    ),

    http.get(
      `${api}/clinics/:clinic_id/chat/messages`,
      route<{ clinic_id: string }>(
        ({ url, params, me }) => {
          const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 100);
          const after = url.searchParams.get('after');
          const before = url.searchParams.get('before');
          const all = db.messages
            .filter((m) => m.clinic_id === params.clinic_id)
            .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
          let items: typeof all;
          let has_more: boolean;
          if (after) {
            const i = all.findIndex((m) => m.id === after);
            const newer = i === -1 ? [] : all.slice(i + 1);
            items = newer.slice(0, limit);
            has_more = newer.length > limit;
          } else {
            const i = before ? all.findIndex((m) => m.id === before) : all.length;
            const older = all.slice(0, i === -1 ? 0 : i);
            items = older.slice(-limit);
            has_more = older.length > limit;
          }
          return HttpResponse.json({
            items,
            has_more,
            unread_count: unreadFor(me.user.id, params.clinic_id, sideOf(me)),
          } satisfies Schema<'ChatMessagePage'>);
        },
        { clinic: true, permission: 'chat:read' },
      ),
    ),

    http.post(
      `${api}/clinics/:clinic_id/chat/messages`,
      route<{ clinic_id: string }>(
        async ({ request, params, me }) => {
          const body = (await request.json()) as Schema<'ChatMessageCreate'>;
          const text = body.body?.trim() || null;
          if (!text && !body.attachment_asset_id) {
            return problem(
              422,
              'validation_error',
              'Invalid input',
              'Write a message or attach a file.',
            );
          }
          const message: Schema<'ChatMessageRead'> = {
            id: crypto.randomUUID(),
            clinic_id: params.clinic_id,
            sender_user_id: me.user.id,
            sender_name: me.user.full_name ?? me.user.email,
            sender_side: sideOf(me),
            body: text,
            attachment_asset_id: body.attachment_asset_id ?? null,
            created_at: nextTimestamp(),
          };
          db.messages.push(message);
          return HttpResponse.json(message, { status: 201 });
        },
        { clinic: true, permission: 'chat:write' },
      ),
    ),

    http.post(
      `${api}/clinics/:clinic_id/chat/read`,
      route<{ clinic_id: string }>(
        async ({ request, params, me }) => {
          const body = (await request.json()) as Schema<'ChatMarkRead'>;
          const upTo = db.messages.find((m) => m.id === body.up_to_message_id);
          const at = upTo?.created_at ?? mockNow();
          const reads = db.chatReads.get(me.user.id) ?? new Map<string, string>();
          reads.set(params.clinic_id, at);
          db.chatReads.set(me.user.id, reads);
          return new HttpResponse(null, { status: 204 });
        },
        { clinic: true, permission: 'chat:read' },
      ),
    ),

    http.get(
      `${api}/media/taxonomy`,
      route(() => HttpResponse.json(db.mediaTaxonomy)),
    ),

    http.post(
      `${api}/clinics/:clinic_id/assets/uploads`,
      route<{ clinic_id: string }>(
        async ({ request, params, me, perms }) => {
          const body = (await request.json()) as Schema<'AssetUploadRequest'>;
          // Clinic media needs media:upload; other files (chat attachments) assets:upload.
          if (!perms.has(MOCK_MEDIA_KINDS.has(body.kind) ? 'media:upload' : 'assets:upload')) {
            return forbidden();
          }
          const unknownLabel = labelProblem(body);
          if (unknownLabel) return unknownLabel;
          const previous = body.previous_version_id
            ? db.assets.get(body.previous_version_id)
            : undefined;
          if (body.previous_version_id && previous?.clinic_id !== params.clinic_id) {
            return notFound();
          }
          const id = crypto.randomUUID();
          const asset: MockAsset = {
            id,
            clinic_id: params.clinic_id,
            kind: body.kind,
            mime_type: body.mime_type,
            original_filename: body.original_filename ?? null,
            size_bytes: body.size_bytes,
            status: 'pending_upload',
            approval_state: 'draft',
            owner_user_id: me.user.id,
            previous_version_id: previous?.id ?? null,
            provenance: {},
            version: (previous?.version ?? 0) + 1,
            practitioner_id: body.practitioner_id ?? null,
            category: body.category ?? null,
            apron: body.apron ?? null,
            angle: body.angle ?? null,
            outfit: body.outfit ?? null,
            created_at: mockNow(),
            updated_at: mockNow(),
          };
          db.assets.set(id, asset);
          return HttpResponse.json(
            {
              asset: assetRead(asset, perms),
              upload_url: `${api}/__mock-storage/${id}`,
              upload_headers: { 'content-type': body.mime_type },
              expires_in: 900,
            } satisfies Schema<'AssetUploadResponse'>,
            { status: 201 },
          );
        },
        { clinic: true },
      ),
    ),

    // Stand-in for object storage (pre-signed PUT/GET). Not an API operation.
    http.put(`${api}/__mock-storage/:asset_id`, async ({ request, params }) => {
      const asset = db.assets.get(String(params.asset_id));
      if (!asset) return new HttpResponse(null, { status: 404 });
      asset.blob = await request.blob();
      return new HttpResponse(null, { status: 200 });
    }),
    http.get(`${api}/__mock-storage/:asset_id`, ({ params }) => {
      const asset = db.assets.get(String(params.asset_id));
      if (!asset) return new HttpResponse(null, { status: 404 });
      const blob =
        asset.blob ??
        new Blob([`Mock file: ${asset.original_filename ?? asset.id}`], { type: 'text/plain' });
      return new HttpResponse(blob, {
        headers: {
          'content-type': asset.blob ? asset.mime_type : 'text/plain',
          'content-disposition': `inline; filename="${asset.original_filename ?? 'file'}"`,
          'cache-control': 'private, no-store',
        },
      });
    }),

    http.post(
      `${api}/clinics/:clinic_id/assets/:asset_id/confirm`,
      route<{ clinic_id: string; asset_id: string }>(
        ({ params, me, perms }) => {
          const asset = db.assets.get(params.asset_id);
          if (!asset || asset.clinic_id !== params.clinic_id) return notFound();
          if (asset.owner_user_id !== me.user.id) return forbidden();
          asset.status = 'uploaded';
          asset.updated_at = mockNow();
          // A confirmed photo or voice sample goes straight to review.
          if (MOCK_MEDIA_KINDS.has(asset.kind)) {
            asset.approval_state = 'submitted';
            db.approvals.unshift({
              id: crypto.randomUUID(),
              clinic_id: asset.clinic_id,
              resource_type: MOCK_ASSET_RESOURCE_TYPE,
              resource_id: asset.id,
              state: 'submitted',
              publication_state: 'unpublished',
              submitted_by_user_id: me.user.id,
              decided_by_user_id: null,
              assignee_user_id: null,
              last_comment: null,
              clinic_message: null,
              created_at: nextTimestamp(),
              updated_at: nextTimestamp(),
            });
          }
          return HttpResponse.json(assetRead(asset, perms));
        },
        { clinic: true },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/assets`,
      route<{ clinic_id: string }>(
        ({ params, url, perms }) => {
          const q = url.searchParams;
          const match = (field: string, actual: string | null | undefined) =>
            !q.get(field) || q.get(field) === actual;
          const items = [...db.assets.values()]
            .filter((a) => a.clinic_id === params.clinic_id)
            .filter(
              (a) =>
                match('kind', a.kind) &&
                match('status', a.status) &&
                match('approval_state', a.approval_state) &&
                match('practitioner_id', a.practitioner_id) &&
                match('category', a.category) &&
                match('apron', a.apron) &&
                match('angle', a.angle) &&
                match('outfit', a.outfit),
            )
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .map((a) => assetRead(a, perms));
          return HttpResponse.json(page(items, url) satisfies Schema<'Page_AssetRead_'>);
        },
        { clinic: true, permission: 'assets:read' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/assets/:asset_id`,
      route<{ clinic_id: string; asset_id: string }>(
        ({ params, perms }) => {
          const asset = db.assets.get(params.asset_id);
          if (!asset || asset.clinic_id !== params.clinic_id) return notFound();
          return HttpResponse.json(assetRead(asset, perms));
        },
        { clinic: true, permission: 'assets:read' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/assets/:asset_id/download-url`,
      route<{ clinic_id: string; asset_id: string }>(
        async ({ params }) => {
          const asset = db.assets.get(params.asset_id);
          if (!asset || asset.clinic_id !== params.clinic_id) return notFound();
          // React Native has no service worker to answer the storage URL, so
          // the mobile mocks hand photos and audio over inline.
          const inline =
            options.inlineMedia && asset.blob && /^(image|audio)\//.test(asset.mime_type);
          return HttpResponse.json({
            url: inline ? await blobToDataUrl(asset.blob!) : `${api}/__mock-storage/${asset.id}`,
            expires_in: 300,
          } satisfies Schema<'AssetDownloadResponse'>);
        },
        { clinic: true, permission: 'assets:read' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/approvals`,
      route<{ clinic_id: string }>(
        ({ params, url, perms }) => {
          const state = url.searchParams.get('state');
          const type = url.searchParams.get('resource_type');
          const items = db.approvals
            .filter(
              (a) =>
                a.clinic_id === params.clinic_id &&
                (!state || a.state === state) &&
                (!type || a.resource_type === type),
            )
            .map((a) => approvalRead(a, perms));
          return HttpResponse.json(page(items, url) satisfies Schema<'Page_ApprovalRead_'>);
        },
        { clinic: true },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/approvals/:approval_id`,
      route<{ clinic_id: string; approval_id: string }>(
        ({ params, perms }) => {
          const approval = db.approvals.find(
            (a) => a.id === params.approval_id && a.clinic_id === params.clinic_id,
          );
          return approval ? HttpResponse.json(approvalRead(approval, perms)) : notFound();
        },
        { clinic: true },
      ),
    ),

    http.post(
      `${api}/clinics/:clinic_id/approvals/actions`,
      route<{ clinic_id: string }>(
        async ({ request, params, me, perms }) => {
          const body = (await request.json()) as Schema<'ApprovalActionRequest'>;
          const approval = db.approvals.find(
            (a) =>
              a.clinic_id === params.clinic_id &&
              a.resource_type === body.resource_type &&
              a.resource_id === body.resource_id,
          );
          if (!approval) return notFound();
          if (!mockAvailableActions(approval, perms).includes(body.action)) {
            const allowedAtAll = mockAvailableActions({ ...approval, state: 'submitted' }, perms);
            return allowedAtAll.includes(body.action) || body.action === 'submit'
              ? problem(
                  409,
                  'conflict',
                  `Cannot ${body.action} an approval that is ${approval.state}`,
                )
              : forbidden();
          }
          const next = approvalTransition(approval.state, body.action);
          if (!next) {
            return problem(
              409,
              'conflict',
              `Cannot ${body.action} an approval that is ${approval.state}`,
            );
          }
          approval.state = next;
          approval.last_comment = body.comment ?? approval.last_comment;
          approval.clinic_message = body.clinic_message ?? approval.clinic_message;
          approval.updated_at = nextTimestamp();
          if (body.action === 'submit') approval.submitted_by_user_id = me.user.id;
          else approval.decided_by_user_id = me.user.id;
          const asset = db.assets.get(approval.resource_id);
          if (asset && approval.resource_type === MOCK_ASSET_RESOURCE_TYPE) {
            asset.approval_state = next;
            asset.updated_at = approval.updated_at;
          }
          return HttpResponse.json(approvalRead(approval, perms));
        },
        { clinic: true },
      ),
    ),

    http.get(
      `${api}/settings/platform`,
      route(() => HttpResponse.json(db.settings)),
    ),

    http.patch(
      `${api}/settings/platform`,
      route(
        async ({ request }) => {
          const body = (await request.json()) as Schema<'PlatformSettingsUpdate'>;
          if (body.support_email && !/^\S+@\S+\.\S+$/.test(body.support_email)) {
            return problem(422, 'validation_error', 'Invalid input', undefined, [
              {
                loc: ['body', 'support_email'],
                msg: 'value is not a valid email address',
                type: 'value_error',
              },
            ]);
          }
          for (const [k, v] of Object.entries(body)) {
            if (v !== undefined && v !== null) (db.settings as Record<string, unknown>)[k] = v;
          }
          db.settings.updated_at = mockNow();
          return HttpResponse.json(db.settings);
        },
        { permission: 'settings:manage' },
      ),
    ),
  ];
}
