import type { Schema } from '@radial-pulse/shared-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approvalsService } from '../services';
import { useApiClient } from './provider';
import { clinicQueryKey } from './query-keys';

/** Approvals: review records for clinic resources (files, assessments, …). */

/** The clinic's approval records (up to 200), for review states and comments. */
export function useClinicApprovals(clinicId: string, options: { enabled?: boolean } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'approvals'),
    queryFn: () => approvalsService.list(api, clinicId, { limit: 200 }),
    enabled: options.enabled ?? true,
  });
}

/**
 * Applies an approval action (approve / reject / redo …). The backend decides
 * whether the action is valid now and whether this user may take it.
 */
export function useApplyApprovalAction(clinicId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Schema<'ApprovalActionRequest'>) =>
      approvalsService.applyAction(api, clinicId, body),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'approvals') }),
        queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'assets') }),
      ]),
  });
}
