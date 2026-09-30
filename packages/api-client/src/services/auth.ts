import { unwrap, type ApiClient } from '../http';

/** The signed-in person (`GET /auth/me`). */
export const authService = {
  me: (api: ApiClient) => unwrap(api.GET('/api/v1/auth/me')),
};
