import { unwrap, type ApiClient } from '../http';
import { type BodyOf, type QueryOf } from './types';

/** Radial Pulse staff accounts. */
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
