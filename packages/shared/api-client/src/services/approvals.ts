import { unwrap, type ApiClient } from '../http';
import { clinicPath, type BodyOf, type QueryOf } from './types';

/**
 * The approvals `resource_type` of a clinic file. The contract documents it as
 * the example of the `resource_type` filter ("e.g. asset").
 */
export const ASSET_RESOURCE_TYPE = 'asset';

/** Approvals: review records and the submit / approve / reject / redo actions. */
export const approvalsService = {
  list: (
    api: ApiClient,
    clinicId: string,
    query: QueryOf<'/api/v1/clinics/{clinic_id}/approvals', 'get'> = {},
  ) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/approvals', {
        params: { ...clinicPath(clinicId), query },
      }),
    ),
  get: (api: ApiClient, clinicId: string, approvalId: string) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/approvals/{approval_id}', {
        params: { path: { clinic_id: clinicId, approval_id: approvalId } },
      }),
    ),
  /** The backend checks the per-action permission (e.g. `approvals:decide`). */
  applyAction: (
    api: ApiClient,
    clinicId: string,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/approvals/actions', 'post'>,
  ) =>
    unwrap(
      api.POST('/api/v1/clinics/{clinic_id}/approvals/actions', {
        params: clinicPath(clinicId),
        body,
      }),
    ),
};
