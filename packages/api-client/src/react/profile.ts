import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clinicProfileService, type BodyOf } from '../services';
import { invalidatePlatformLists } from './invalidation';
import { useApiClient } from './provider';
import { clinicQueryKey } from './query-keys';

/** The client context (`ClinicProfileRead`), including the Practitioner Profile. */
export function useClinicProfile(clinicId: string, options: { enabled?: boolean } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'profile'),
    queryFn: () => clinicProfileService.get(api, clinicId),
    enabled: options.enabled ?? true,
  });
}

/**
 * Saves the client context (`PUT /profile`, optimistic concurrency: the body
 * carries the `version` that was read). The response is the new profile, so
 * it replaces the cache; the clinic and practitioners it is a view over are
 * refetched.
 */
export function useUpdateClinicProfile(clinicId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BodyOf<'/api/v1/clinics/{clinic_id}/profile', 'put'>) =>
      clinicProfileService.update(api, clinicId, body),
    onSuccess: (data) => {
      queryClient.setQueryData(clinicQueryKey(clinicId, 'profile'), data);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'detail') }),
        queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'practitioners') }),
        queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'activity') }),
        invalidatePlatformLists(queryClient),
      ]);
    },
  });
}
