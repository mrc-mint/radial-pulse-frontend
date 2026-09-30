import { type QueryClient } from '@tanstack/react-query';
import { platformQueryKey } from './query-keys';

/** Cache invalidation shared by several resource hooks (internal). */

export function invalidatePlatformLists(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: platformQueryKey('clinics') }),
    queryClient.invalidateQueries({ queryKey: platformQueryKey('dashboard-summary') }),
  ]);
}
