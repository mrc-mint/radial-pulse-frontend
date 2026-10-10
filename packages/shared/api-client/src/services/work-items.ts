import { unwrap, type ApiClient } from '../http';
import { clinicPath, type QueryOf } from './types';

/** Work items (the work queue). */
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
