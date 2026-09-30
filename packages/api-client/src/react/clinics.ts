import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assetsService,
  assignmentsService,
  auditEventsService,
  clinicsService,
  practitionersService,
  uploadToPresignedUrl,
  type BodyOf,
  type QueryOf,
} from '../services';
import { invalidatePlatformLists } from './invalidation';
import { useApiClient } from './provider';
import { clinicQueryKey, platformQueryKey } from './query-keys';

/** Clinics: list, details, status actions, photo, practitioners, assignment, activity. */

export function useClinics(query: QueryOf<'/api/v1/clinics', 'get'>) {
  const api = useApiClient();
  return useQuery({
    queryKey: platformQueryKey('clinics', query),
    queryFn: () => clinicsService.list(api, query),
    placeholderData: keepPreviousData,
  });
}

export function useCreateClinic() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BodyOf<'/api/v1/clinics', 'post'>) => clinicsService.create(api, body),
    onSuccess: () => invalidatePlatformLists(queryClient),
  });
}

export function useClinic(clinicId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'detail'),
    queryFn: () => clinicsService.get(api, clinicId),
  });
}

export function useUpdateClinic(clinicId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BodyOf<'/api/v1/clinics/{clinic_id}', 'patch'>) =>
      clinicsService.update(api, clinicId, body),
    onSuccess: (data) => {
      queryClient.setQueryData(clinicQueryKey(clinicId, 'detail'), data);
      return invalidatePlatformLists(queryClient);
    },
  });
}

/** Invalidates everything that shows a clinic's status or details. */
function useInvalidateClinicEverywhere(clinicId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'detail') }),
      queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'activity') }),
      invalidatePlatformLists(queryClient),
    ]);
}

export function useChangeClinicStage(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateClinicEverywhere(clinicId);
  return useMutation({
    mutationFn: (body: BodyOf<'/api/v1/clinics/{clinic_id}/stage', 'post'>) =>
      clinicsService.changeStage(api, clinicId, body),
    onSuccess: invalidate,
  });
}

export function useArchiveClinic(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateClinicEverywhere(clinicId);
  return useMutation({
    mutationFn: (reason: string) => clinicsService.archive(api, clinicId, { reason }),
    onSuccess: invalidate,
  });
}

export function useRestoreClinic(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateClinicEverywhere(clinicId);
  return useMutation({
    mutationFn: () => clinicsService.restore(api, clinicId),
    onSuccess: invalidate,
  });
}

/**
 * Uploads a clinic photo (contract asset flow: request upload, PUT to the
 * pre-signed URL, confirm) and sets it as the clinic's cover photo.
 */
export function useSetClinicPhoto(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateClinicEverywhere(clinicId);
  return useMutation({
    mutationFn: async (file: File) => {
      const upload = await assetsService.requestUpload(api, clinicId, {
        kind: 'clinic_photo',
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
        original_filename: file.name,
      });
      await uploadToPresignedUrl(upload, file);
      const asset = await assetsService.confirm(api, clinicId, upload.asset.id);
      return clinicsService.update(api, clinicId, { cover_asset_id: asset.id });
    },
    onSuccess: invalidate,
  });
}

/** Practitioners, main one first. */
export function usePractitioners(clinicId: string, options: { enabled?: boolean } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'practitioners'),
    queryFn: () => practitionersService.list(api, clinicId, { limit: 50 }),
    enabled: options.enabled ?? true,
  });
}

export function useClinicActivity(
  clinicId: string,
  query: { limit?: number; offset?: number } = {},
) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'activity', query),
    queryFn: () => auditEventsService.list(api, clinicId, query),
    placeholderData: keepPreviousData,
  });
}

export function useClinicAssignments(clinicId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'assignments'),
    queryFn: () => assignmentsService.list(api, clinicId),
  });
}

export function useSetClinicAssignment(clinicId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => assignmentsService.set(api, clinicId, userId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'assignments') }),
        invalidatePlatformLists(queryClient),
      ]),
  });
}
