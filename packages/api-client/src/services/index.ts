import type { paths, Schema } from '@radial-pulse/shared-types';
import { unwrap, type ApiClient } from '../http';

/**
 * Services: one function per contract operation the frontend uses. Paths,
 * parameters, bodies and results are all typed by the generated contract
 * (`paths`); nothing here declares a domain type of its own.
 */

type Json<T> = T extends { content: { 'application/json': infer B } } ? B : never;

/** Query parameters of a contract operation. */
export type QueryOf<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  parameters: { query?: infer Q };
}
  ? NonNullable<Q>
  : never;

/** JSON request body of a contract operation. */
export type BodyOf<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  requestBody: infer R;
}
  ? Json<R>
  : paths[P][M] extends { requestBody?: infer R }
    ? Json<NonNullable<R>>
    : never;

const clinicPath = (clinic_id: string) => ({ path: { clinic_id } });

export const authService = {
  me: (api: ApiClient) => unwrap(api.GET('/api/v1/auth/me')),
};

export const dashboardService = {
  summary: (api: ApiClient) => unwrap(api.GET('/api/v1/dashboard/summary')),
};

export const clinicsService = {
  list: (api: ApiClient, query: QueryOf<'/api/v1/clinics', 'get'>) =>
    unwrap(api.GET('/api/v1/clinics', { params: { query } })),
  get: (api: ApiClient, clinicId: string) =>
    unwrap(api.GET('/api/v1/clinics/{clinic_id}', { params: clinicPath(clinicId) })),
  create: (api: ApiClient, body: BodyOf<'/api/v1/clinics', 'post'>) =>
    unwrap(api.POST('/api/v1/clinics', { body })),
  update: (
    api: ApiClient,
    clinicId: string,
    body: BodyOf<'/api/v1/clinics/{clinic_id}', 'patch'>,
  ) => unwrap(api.PATCH('/api/v1/clinics/{clinic_id}', { params: clinicPath(clinicId), body })),
};

export const assignmentsService = {
  list: (api: ApiClient, clinicId: string) =>
    unwrap(api.GET('/api/v1/clinics/{clinic_id}/assignments', { params: clinicPath(clinicId) })),
  set: (api: ApiClient, clinicId: string, userId: string) =>
    unwrap(
      api.PUT('/api/v1/clinics/{clinic_id}/assignment', {
        params: clinicPath(clinicId),
        body: { user_id: userId },
      }),
    ),
};

export const usersService = {
  list: (api: ApiClient, query: QueryOf<'/api/v1/users', 'get'>) =>
    unwrap(api.GET('/api/v1/users', { params: { query } })),
  create: (api: ApiClient, body: BodyOf<'/api/v1/users', 'post'>) =>
    unwrap(api.POST('/api/v1/users', { body })),
  resendInvite: (api: ApiClient, userId: string) =>
    unwrap(
      api.POST('/api/v1/users/{user_id}/resend-invite', {
        params: { path: { user_id: userId } },
      }),
    ),
};

export const presenceService = {
  list: (
    api: ApiClient,
    clinicId: string,
    query: QueryOf<'/api/v1/clinics/{clinic_id}/presence-profiles', 'get'> = {},
  ) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/presence-profiles', {
        params: { ...clinicPath(clinicId), query },
      }),
    ),
  update: (
    api: ApiClient,
    clinicId: string,
    profileId: string,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/presence-profiles/{profile_id}', 'patch'>,
  ) =>
    unwrap(
      api.PATCH('/api/v1/clinics/{clinic_id}/presence-profiles/{profile_id}', {
        params: { path: { clinic_id: clinicId, profile_id: profileId } },
        body,
      }),
    ),
};

export const assessmentsService = {
  list: (
    api: ApiClient,
    clinicId: string,
    query: QueryOf<'/api/v1/clinics/{clinic_id}/assessments', 'get'> = {},
  ) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/assessments', {
        params: { ...clinicPath(clinicId), query },
      }),
    ),
  get: (api: ApiClient, clinicId: string, assessmentId: string) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/assessments/{assessment_id}', {
        params: { path: { clinic_id: clinicId, assessment_id: assessmentId } },
      }),
    ),
  request: (
    api: ApiClient,
    clinicId: string,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/assessments', 'post'> = {},
  ) =>
    unwrap(
      api.POST('/api/v1/clinics/{clinic_id}/assessments', { params: clinicPath(clinicId), body }),
    ),
};

/**
 * Report files (`ReportArtifactRead`). Not used by a V1 screen: V1 Reports
 * are published assessments (docs/scope-v1.md). Kept here so report files can
 * be added later without touching screens; clinic accounts only ever receive
 * published ones (enforced by the API).
 */
export const reportsService = {
  list: (
    api: ApiClient,
    clinicId: string,
    query: QueryOf<'/api/v1/clinics/{clinic_id}/reports', 'get'> = {},
  ) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/reports', {
        params: { ...clinicPath(clinicId), query },
      }),
    ),
  get: (api: ApiClient, clinicId: string, reportId: string) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/reports/{report_id}', {
        params: { path: { clinic_id: clinicId, report_id: reportId } },
      }),
    ),
};

export const workItemsService = {
  list: (
    api: ApiClient,
    clinicId: string,
    query: QueryOf<'/api/v1/clinics/{clinic_id}/work-items', 'get'> = {},
  ) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/work-items', {
        params: { ...clinicPath(clinicId), query },
      }),
    ),
};

type ConnectionPlatform = Schema<'ConnectionPlatform'>;
const connectionPath = (clinic_id: string, platform: ConnectionPlatform) => ({
  path: { clinic_id, platform },
});

/** "Connect Your Accounts": OAuth start → platform sign-in → complete. */
export const connectionsService = {
  list: (api: ApiClient, clinicId: string) =>
    unwrap(api.GET('/api/v1/clinics/{clinic_id}/connections', { params: clinicPath(clinicId) })),
  get: (api: ApiClient, clinicId: string, platform: ConnectionPlatform) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/connections/{platform}', {
        params: connectionPath(clinicId, platform),
      }),
    ),
  start: (
    api: ApiClient,
    clinicId: string,
    platform: ConnectionPlatform,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/connections/{platform}/start', 'post'>,
  ) =>
    unwrap(
      api.POST('/api/v1/clinics/{clinic_id}/connections/{platform}/start', {
        params: connectionPath(clinicId, platform),
        body,
      }),
    ),
  complete: (
    api: ApiClient,
    clinicId: string,
    platform: ConnectionPlatform,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/connections/{platform}/complete', 'post'>,
  ) =>
    unwrap(
      api.POST('/api/v1/clinics/{clinic_id}/connections/{platform}/complete', {
        params: connectionPath(clinicId, platform),
        body,
      }),
    ),
  disconnect: (api: ApiClient, clinicId: string, platform: ConnectionPlatform) =>
    unwrap(
      api.POST('/api/v1/clinics/{clinic_id}/connections/{platform}/disconnect', {
        params: connectionPath(clinicId, platform),
      }),
    ),
};

export const chatService = {
  inbox: (api: ApiClient, query: QueryOf<'/api/v1/chat/inbox', 'get'> = {}) =>
    unwrap(api.GET('/api/v1/chat/inbox', { params: { query } })),
  messages: (
    api: ApiClient,
    clinicId: string,
    query: QueryOf<'/api/v1/clinics/{clinic_id}/chat/messages', 'get'> = {},
  ) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/chat/messages', {
        params: { ...clinicPath(clinicId), query },
      }),
    ),
  send: (
    api: ApiClient,
    clinicId: string,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/chat/messages', 'post'>,
  ) =>
    unwrap(
      api.POST('/api/v1/clinics/{clinic_id}/chat/messages', { params: clinicPath(clinicId), body }),
    ),
  markRead: (
    api: ApiClient,
    clinicId: string,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/chat/read', 'post'>,
  ) =>
    unwrap(
      api.POST('/api/v1/clinics/{clinic_id}/chat/read', { params: clinicPath(clinicId), body }),
    ),
};

export const assetsService = {
  requestUpload: (
    api: ApiClient,
    clinicId: string,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/assets/uploads', 'post'>,
  ) =>
    unwrap(
      api.POST('/api/v1/clinics/{clinic_id}/assets/uploads', {
        params: clinicPath(clinicId),
        body,
      }),
    ),
  confirm: (api: ApiClient, clinicId: string, assetId: string) =>
    unwrap(
      api.POST('/api/v1/clinics/{clinic_id}/assets/{asset_id}/confirm', {
        params: { path: { clinic_id: clinicId, asset_id: assetId } },
      }),
    ),
  downloadUrl: (api: ApiClient, clinicId: string, assetId: string) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/assets/{asset_id}/download-url', {
        params: { path: { clinic_id: clinicId, asset_id: assetId } },
      }),
    ),
};

export const settingsService = {
  platform: (api: ApiClient) => unwrap(api.GET('/api/v1/settings/platform')),
  updatePlatform: (api: ApiClient, body: BodyOf<'/api/v1/settings/platform', 'patch'>) =>
    unwrap(api.PATCH('/api/v1/settings/platform', { body })),
};

/**
 * Uploads a file to the pre-signed URL returned by `assetsService.requestUpload`.
 * Goes straight to object storage, so it bypasses the API client (no bearer
 * token must be sent there); only the headers the API specified are sent.
 */
export async function uploadToPresignedUrl(
  upload: { upload_url: string; upload_headers: Record<string, unknown> },
  file: Blob,
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<void> {
  const headers = Object.fromEntries(
    Object.entries(upload.upload_headers).map(([k, v]) => [k, String(v)]),
  );
  const response = await fetchImpl(upload.upload_url, { method: 'PUT', headers, body: file });
  if (!response.ok) throw new Error(`Upload failed (HTTP ${response.status})`);
}
