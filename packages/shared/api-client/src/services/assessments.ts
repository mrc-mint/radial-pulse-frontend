import { unwrap, type ApiClient } from '../http';
import { clinicPath, type BodyOf, type QueryOf } from './types';

/** The Digital Presence Assessment and report files. */
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
