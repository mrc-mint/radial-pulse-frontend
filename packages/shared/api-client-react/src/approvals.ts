import type { Schema } from '@radial-pulse/shared-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approvalsService, ASSET_RESOURCE_TYPE } from '@radial-pulse/api-client';
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

/**
 * Reviews a clinic file (photo, logo or voice sample). Offer only the actions
 * in `AssetRead.review.available_actions`; `clinicMessage` is what the clinic
 * reads, `internalNote` stays with Radial Pulse staff.
 */
export function useReviewAsset(clinicId: string) {
  const apply = useApplyApprovalAction(clinicId);
  return {
    ...apply,
    mutate: (
      input: {
        assetId: string;
        action: Schema<'ApprovalAction'>;
        clinicMessage?: string | null;
        internalNote?: string | null;
      },
      options?: Parameters<typeof apply.mutate>[1],
    ) =>
      apply.mutate(
        {
          resource_type: ASSET_RESOURCE_TYPE,
          resource_id: input.assetId,
          action: input.action,
          clinic_message: input.clinicMessage || null,
          comment: input.internalNote || null,
        },
        options,
      ),
  };
}
