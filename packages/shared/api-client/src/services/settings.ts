import { unwrap, type ApiClient } from '../http';
import { type BodyOf } from './types';

/** Platform settings. */
export const settingsService = {
  platform: (api: ApiClient) => unwrap(api.GET('/api/v1/settings/platform')),
  updatePlatform: (api: ApiClient, body: BodyOf<'/api/v1/settings/platform', 'patch'>) =>
    unwrap(api.PATCH('/api/v1/settings/platform', { body })),
};
