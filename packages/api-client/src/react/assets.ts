import { useQuery } from '@tanstack/react-query';
import { assetsService } from '../services';
import { useApiClient } from './provider';
import { clinicQueryKey } from './query-keys';

/** Clinic files. */

/** A short-lived download URL for a clinic file (e.g. a chat attachment). */
export function useAssetDownloadUrl(clinicId: string, assetId: string | null) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'asset-url', assetId),
    queryFn: () => assetsService.downloadUrl(api, clinicId, assetId!),
    enabled: assetId !== null,
    // Refresh well before the URL expires.
    staleTime: (query) => Math.max(0, ((query.state.data?.expires_in ?? 60) - 30) * 1000),
  });
}
