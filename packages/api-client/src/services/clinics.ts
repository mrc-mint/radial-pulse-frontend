import { unwrap, type ApiClient } from '../http';
import { clinicPath, type BodyOf, type QueryOf } from './types';

/** Clinics, their practitioners, Digital Success Manager assignment and activity. */
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
  /** Move to another stage (staff only, clinics:manage). */
  changeStage: (
    api: ApiClient,
    clinicId: string,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/stage', 'post'>,
  ) =>
    unwrap(api.POST('/api/v1/clinics/{clinic_id}/stage', { params: clinicPath(clinicId), body })),
  /** Archive (make inactive) with a required reason. */
  archive: (
    api: ApiClient,
    clinicId: string,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/archive', 'post'>,
  ) =>
    unwrap(api.POST('/api/v1/clinics/{clinic_id}/archive', { params: clinicPath(clinicId), body })),
  restore: (api: ApiClient, clinicId: string) =>
    unwrap(api.POST('/api/v1/clinics/{clinic_id}/restore', { params: clinicPath(clinicId) })),
};

export const practitionersService = {
  list: (
    api: ApiClient,
    clinicId: string,
    query: QueryOf<'/api/v1/clinics/{clinic_id}/practitioners', 'get'> = {},
  ) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/practitioners', {
        params: { ...clinicPath(clinicId), query },
      }),
    ),
};

/** The clinic's activity: who did what (append-only audit events). */
export const auditEventsService = {
  list: (
    api: ApiClient,
    clinicId: string,
    query: QueryOf<'/api/v1/clinics/{clinic_id}/audit-events', 'get'> = {},
  ) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/audit-events', {
        params: { ...clinicPath(clinicId), query },
      }),
    ),
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
