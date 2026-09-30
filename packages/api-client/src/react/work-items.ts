import { useQuery } from '@tanstack/react-query';
import { workItemsService, type QueryOf } from '../services';
import { useApiClient } from './provider';
import { clinicQueryKey } from './query-keys';

/** Work items. */

export function useWorkItems(
  clinicId: string,
  query: QueryOf<'/api/v1/clinics/{clinic_id}/work-items', 'get'> = {},
) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'work-items', query),
    queryFn: () => workItemsService.list(api, clinicId, query),
  });
}
