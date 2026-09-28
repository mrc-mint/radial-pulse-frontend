/**
 * @radial-pulse/api-client/react — TanStack Query integration shared by web
 * and mobile: client provider, QueryClient defaults, query-key factories and
 * invalidation rules.
 *
 * Resource hooks wrap the contract services (never hand-made types). Rule: every clinic-scoped key is built
 * with `clinicQueryKey`, so switching clinics (multi-clinic Clinic
 * Administrators, decision 5g) can never show one clinic's data under another.
 */
export { ApiClientProvider, useApiClient } from './provider';
export { createQueryClient, retryDelay, shouldRetry, MAX_RETRIES } from './query-client';
export { clinicQueryKey, invalidateClinic, platformQueryKey, queryKeyRoot } from './query-keys';
export * from './hooks';
