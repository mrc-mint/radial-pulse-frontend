import { unwrap, type ApiClient } from '../http';

/** Dashboard counts (`GET /dashboard/summary`). */
export const dashboardService = {
  summary: (api: ApiClient) => unwrap(api.GET('/api/v1/dashboard/summary')),
};
