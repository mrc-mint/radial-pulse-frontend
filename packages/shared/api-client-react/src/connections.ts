import type { Schema } from '@radial-pulse/shared-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { connectionsService, snapshotsService } from '@radial-pulse/api-client';
import { useApiClient } from './provider';
import { clinicQueryKey } from './query-keys';

/** Connected accounts and their metric snapshots. */

/** The newest value of each metric (`latest=true`). */
export function useLatestSnapshots(clinicId: string, options: { enabled?: boolean } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'snapshots', 'latest'),
    queryFn: () => snapshotsService.list(api, clinicId, { latest: true, limit: 200 }),
    enabled: options.enabled ?? true,
  });
}

export function useConnections(clinicId: string, options: { enabled?: boolean } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'connections'),
    queryFn: () => connectionsService.list(api, clinicId),
    enabled: options.enabled ?? true,
  });
}

type ConnectionPlatform = Schema<'ConnectionPlatform'>;

export function useConnection(clinicId: string, platform: ConnectionPlatform) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'connections', platform),
    queryFn: () => connectionsService.get(api, clinicId, platform),
  });
}

function useInvalidateConnections(clinicId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'connections') });
}

/** Step 1 of Connect: the platform's sign-in address for this redirect URI. */
export function useStartConnection(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateConnections(clinicId);
  return useMutation({
    mutationFn: ({
      platform,
      redirectUri,
    }: {
      platform: ConnectionPlatform;
      redirectUri: string;
    }) => connectionsService.start(api, clinicId, platform, { redirect_uri: redirectUri }),
    onSettled: invalidate,
  });
}

/** Step 2 of Connect: hand the platform's `code` + `state` back to the API. */
export function useCompleteConnection(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateConnections(clinicId);
  return useMutation({
    mutationFn: ({
      platform,
      code,
      state,
    }: {
      platform: ConnectionPlatform;
      code: string;
      state: string;
    }) => connectionsService.complete(api, clinicId, platform, { code, state }),
    onSettled: invalidate,
  });
}

export function useDisconnectConnection(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateConnections(clinicId);
  return useMutation({
    mutationFn: (platform: ConnectionPlatform) =>
      connectionsService.disconnect(api, clinicId, platform),
    onSettled: invalidate,
  });
}
