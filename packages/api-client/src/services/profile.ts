import { unwrap, type ApiClient } from '../http';
import { clinicPath, type BodyOf } from './types';

/**
 * The client context (`/profile`): brand, audience, services, schedule and the
 * Practitioner Profile. `update` must send the `version` that was read (409
 * when someone saved in between).
 */
export const clinicProfileService = {
  get: (api: ApiClient, clinicId: string) =>
    unwrap(api.GET('/api/v1/clinics/{clinic_id}/profile', { params: clinicPath(clinicId) })),
  update: (
    api: ApiClient,
    clinicId: string,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/profile', 'put'>,
  ) =>
    unwrap(api.PUT('/api/v1/clinics/{clinic_id}/profile', { params: clinicPath(clinicId), body })),
};
