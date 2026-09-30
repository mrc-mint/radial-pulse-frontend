import type { Schema } from '@radial-pulse/shared-types';
import { unwrap, type ApiClient } from '../http';
import { clinicPath, type BodyOf, type QueryOf } from './types';

/** Connected accounts ("Connect Your Accounts") and their metric snapshots. */
/** Normalized metric snapshots (source, freshness, error state). */
export const snapshotsService = {
  list: (
    api: ApiClient,
    clinicId: string,
    query: QueryOf<'/api/v1/clinics/{clinic_id}/snapshots', 'get'> = {},
  ) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/snapshots', {
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
