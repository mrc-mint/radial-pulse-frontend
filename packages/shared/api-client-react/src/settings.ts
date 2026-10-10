import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService, type BodyOf } from '@radial-pulse/api-client';
import { useApiClient } from './provider';
import { platformQueryKey } from './query-keys';

/** Platform settings. */

export function usePlatformSettings(options: { enabled?: boolean } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: platformQueryKey('settings', 'platform'),
    queryFn: () => settingsService.platform(api),
    enabled: options.enabled ?? true,
  });
}

export function useUpdatePlatformSettings() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BodyOf<'/api/v1/settings/platform', 'patch'>) =>
      settingsService.updatePlatform(api, body),
    onSuccess: (data) => queryClient.setQueryData(platformQueryKey('settings', 'platform'), data),
  });
}
