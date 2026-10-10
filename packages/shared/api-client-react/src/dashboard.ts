import { useQueries, useQuery } from '@tanstack/react-query';
import {
  assessmentsService,
  auditEventsService,
  dashboardService,
  presenceService,
} from '@radial-pulse/api-client';
import { useApiClient } from './provider';
import { clinicQueryKey, platformQueryKey } from './query-keys';

/** Dashboard counts, and per-clinic data for several clinics at once. */

export function useDashboardSummary() {
  const api = useApiClient();
  return useQuery({
    queryKey: platformQueryKey('dashboard-summary'),
    queryFn: () => dashboardService.summary(api),
  });
}

const SUMMARY_PAGE = { limit: 5 } as const;

export function useClinicsAssessments(clinicIds: ReadonlyArray<string>) {
  const api = useApiClient();
  return useQueries({
    queries: clinicIds.map((id) => ({
      queryKey: clinicQueryKey(id, 'assessments', SUMMARY_PAGE),
      queryFn: () => assessmentsService.list(api, id, SUMMARY_PAGE),
    })),
  });
}

export function useClinicsPresence(clinicIds: ReadonlyArray<string>) {
  const api = useApiClient();
  return useQueries({
    queries: clinicIds.map((id) => ({
      queryKey: clinicQueryKey(id, 'presence-profiles'),
      queryFn: () => presenceService.list(api, id),
    })),
  });
}

export function useClinicsActivity(clinicIds: ReadonlyArray<string>) {
  const api = useApiClient();
  return useQueries({
    queries: clinicIds.map((id) => ({
      queryKey: clinicQueryKey(id, 'activity', SUMMARY_PAGE),
      queryFn: () => auditEventsService.list(api, id, SUMMARY_PAGE),
    })),
  });
}
