import type { QueryClient } from '@tanstack/react-query';

export const queryKeyRoot = ['radial-pulse'] as const;

/**
 * Query key for clinic-scoped data: ['radial-pulse', 'clinic', clinicId, ...parts].
 * Invalidating `clinicQueryKey(id)` clears everything cached for that clinic.
 */
export function clinicQueryKey<const P extends ReadonlyArray<unknown>>(
  clinicId: string,
  ...parts: P
) {
  if (!clinicId) throw new Error('clinicQueryKey requires a clinicId.');
  return [...queryKeyRoot, 'clinic', clinicId, ...parts] as const;
}

/** Query key for data that is not scoped to one clinic (e.g. platform lists). */
export function platformQueryKey<const P extends ReadonlyArray<unknown>>(...parts: P) {
  return [...queryKeyRoot, 'platform', ...parts] as const;
}

/** Refetches everything cached for one clinic (after a clinic-level change). */
export function invalidateClinic(queryClient: QueryClient, clinicId: string) {
  return queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId) });
}
