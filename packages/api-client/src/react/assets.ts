import type { Schema } from '@radial-pulse/shared-types';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetsService, uploadAsset, type UploadFile } from '../services';
import { useApiClient, useStorageFetch } from './provider';
import { clinicQueryKey } from './query-keys';

/** Clinic files. */

const ASSET_PAGE_SIZE = 200;

/**
 * A short-lived download URL for a clinic file (chat attachment, photo, voice
 * sample). The URL lives only in memory: it is refreshed before it expires and
 * dropped soon after the last screen using it unmounts.
 */
export function useAssetDownloadUrl(clinicId: string, assetId: string | null) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'asset-url', assetId),
    queryFn: () => assetsService.downloadUrl(api, clinicId, assetId!),
    enabled: assetId !== null,
    // Refresh well before the URL expires.
    staleTime: (query) => Math.max(0, ((query.state.data?.expires_in ?? 60) - 30) * 1000),
    gcTime: 30_000,
  });
}

/**
 * The clinic's files of the given kinds (one request per kind, up to 200
 * each), newest first as the API returns them.
 */
export function useClinicAssets(
  clinicId: string,
  kinds: ReadonlyArray<Schema<'AssetKind'>>,
  options: { enabled?: boolean } = {},
) {
  const api = useApiClient();
  return useQueries({
    queries: kinds.map((kind) => ({
      queryKey: clinicQueryKey(clinicId, 'assets', kind),
      queryFn: () => assetsService.list(api, clinicId, { kind, limit: ASSET_PAGE_SIZE }),
      enabled: options.enabled ?? true,
    })),
    combine: (results) => ({
      data: results.every((r) => r.data) ? results.flatMap((r) => r.data!.items) : undefined,
      isPending: results.some((r) => r.isPending),
      isError: results.some((r) => r.isError),
      error: results.find((r) => r.error)?.error ?? null,
      refetch: () => Promise.all(results.map((r) => r.refetch())),
    }),
  });
}

/**
 * Uploads a clinic file through the contract flow. `replaces` uploads it as
 * the next version of an existing file (`previous_version_id`).
 */
export function useUploadAsset(clinicId: string) {
  const api = useApiClient();
  const storageFetch = useStorageFetch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      kind: Schema<'AssetKind'>;
      file: UploadFile;
      replaces?: string | null;
    }) =>
      uploadAsset(
        api,
        clinicId,
        { kind: input.kind, file: input.file, previousVersionId: input.replaces },
        storageFetch,
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'assets') }),
        queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'approvals') }),
      ]),
  });
}
