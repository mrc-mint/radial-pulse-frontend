import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presenceService, type BodyOf } from '@radial-pulse/api-client';
import { useApiClient } from './provider';
import { clinicQueryKey } from './query-keys';

/** Online profiles found for a clinic. */

export function usePresenceProfiles(clinicId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'presence-profiles'),
    queryFn: () => presenceService.list(api, clinicId),
  });
}

export function useUpdatePresenceProfile(clinicId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      profileId,
      body,
    }: {
      profileId: string;
      body: BodyOf<'/api/v1/clinics/{clinic_id}/presence-profiles/{profile_id}', 'patch'>;
    }) => presenceService.update(api, clinicId, profileId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'presence-profiles') }),
  });
}
