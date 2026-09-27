/**
 * @radial-pulse/api-client/react — TanStack Query hooks, query-key factories
 * and invalidation rules shared by web and mobile.
 *
 * Hooks arrive in Phase 4. Rule from here on: every clinic-scoped key is built
 * with `clinicQueryKey`, so switching clinics (multi-clinic Clinic
 * Administrators, decision 5g) can never show one clinic's data under another.
 */
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
