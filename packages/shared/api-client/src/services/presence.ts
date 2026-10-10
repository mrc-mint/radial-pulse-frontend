import { unwrap, type ApiClient } from '../http';
import { clinicPath, type BodyOf, type QueryOf } from './types';

/** Online profiles found for a clinic (Digital Presence, Listings). */
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
