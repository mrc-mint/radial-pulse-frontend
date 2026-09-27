import type { Permission, Schema } from '@radial-pulse/shared-types';
import { delay, http, HttpResponse, type HttpResponseResolver } from 'msw';
import { createMockDb, mockNow, nextTimestamp, type MockDb } from './data';
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
      dsm: personRef(db.assignments.get(c.id)?.user_id),
      open_work: [...open].map(([area, open_count]) => ({ area, open_count })),
    };
  };

  const toClinicRead = (c: MockDb['clinics'][number]): Schema<'ClinicRead'> => {
    const { primary_practitioner_name: _doctor, ...read } = c;
    void _doctor;
    return read;
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
          sign_in_method: 'google',
          last_login_at: me.user.last_login_at,
        } satisfies Schema<'MeResponse'>),
      ),
    ),

    http.get(
      `${api}/dashboard/summary`,
      route(({ me }) => {
        const visible = new Set(me.visibleClinicIds());
        const clinics = db.clinics.filter((c) => visible.has(c.id));
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
          archived: 0,
          prospects: count('prospective_client') + count('profile_enriched'),
          in_progress: count('assessment_completed') + count('client_discussion'),
          active: count('active_client'),
          by_stage: stages.map((stage) => ({ stage, count: count(stage) })),
          new_clinics_by_month: months.map((month) => ({
            month,
            count: clinics.filter((c) => c.created_at.startsWith(month)).length,
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
        const dsm = url.searchParams.get('dsm_user_id');
        const unassigned = url.searchParams.get('unassigned') === 'true';
        const rows = db.clinics
          .filter((c) => visible.has(c.id))
          .filter((c) => stages.length === 0 || stages.includes(c.stage))
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
          // A DSM who onboards a clinic becomes its DSM (outbound sales model).
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
        async ({ request, params }) => {
          const body = (await request.json()) as Schema<'ClinicUpdate'>;
          const clinic = db.clinics.find((c) => c.id === params.clinic_id)!;
          for (const [k, v] of Object.entries(body)) {
            if (v !== undefined && k in clinic) (clinic as Record<string, unknown>)[k] = v;
          }
          clinic.updated_at = mockNow();
          return HttpResponse.json(toClinicRead(clinic));
        },
        { clinic: true, permission: 'clinics:write' },
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
          profile.updated_at = mockNow();
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

    http.post(
      `${api}/clinics/:clinic_id/assets/uploads`,
      route<{ clinic_id: string }>(
        async ({ request, params, me }) => {
          const body = (await request.json()) as Schema<'AssetUploadRequest'>;
          const id = crypto.randomUUID();
          const asset: Schema<'AssetRead'> = {
            id,
            clinic_id: params.clinic_id,
            kind: body.kind,
            mime_type: body.mime_type,
            original_filename: body.original_filename ?? null,
            size_bytes: body.size_bytes,
            status: 'pending_upload',
            approval_state: 'draft',
            owner_user_id: me.user.id,
            previous_version_id: null,
            provenance: {},
            version: 1,
            created_at: mockNow(),
            updated_at: mockNow(),
          };
          db.assets.set(id, asset);
          return HttpResponse.json(
            {
              asset,
              upload_url: `${api}/__mock-storage/${id}`,
              upload_headers: { 'content-type': body.mime_type },
              expires_in: 900,
            } satisfies Schema<'AssetUploadResponse'>,
            { status: 201 },
          );
        },
        { clinic: true, permission: 'assets:upload' },
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
        },
      });
    }),

    http.post(
      `${api}/clinics/:clinic_id/assets/:asset_id/confirm`,
      route<{ clinic_id: string; asset_id: string }>(
        ({ params }) => {
          const asset = db.assets.get(params.asset_id);
          if (!asset || asset.clinic_id !== params.clinic_id) return notFound();
          asset.status = 'uploaded';
          asset.updated_at = mockNow();
          const { blob: _b, ...read } = asset;
          void _b;
          return HttpResponse.json(read);
        },
        { clinic: true, permission: 'assets:upload' },
      ),
    ),

    http.get(
      `${api}/clinics/:clinic_id/assets/:asset_id/download-url`,
      route<{ clinic_id: string; asset_id: string }>(
        ({ params }) => {
          const asset = db.assets.get(params.asset_id);
          if (!asset || asset.clinic_id !== params.clinic_id) return notFound();
          return HttpResponse.json({
            url: `${api}/__mock-storage/${asset.id}`,
            expires_in: 300,
          } satisfies Schema<'AssetDownloadResponse'>);
        },
        { clinic: true, permission: 'assets:read' },
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
