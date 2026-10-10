import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assessmentsService, type BodyOf, type QueryOf } from '@radial-pulse/api-client';
import { useApiClient } from './provider';
import { clinicQueryKey } from './query-keys';

/** The Digital Presence Assessment. */

export function useAssessments(
  clinicId: string,
  query: QueryOf<'/api/v1/clinics/{clinic_id}/assessments', 'get'> = {},
) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'assessments', query),
    queryFn: () => assessmentsService.list(api, clinicId, query),
    placeholderData: keepPreviousData,
  });
}

export function useAssessment(clinicId: string, assessmentId: string | null) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'assessment', assessmentId),
    queryFn: () => assessmentsService.get(api, clinicId, assessmentId!),
    enabled: assessmentId !== null,
  });
}

export function useRequestAssessment(clinicId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BodyOf<'/api/v1/clinics/{clinic_id}/assessments', 'post'> = {}) =>
      assessmentsService.request(api, clinicId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'assessments') }),
  });
}
