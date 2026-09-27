/**
 * @radial-pulse/api-client/react — TanStack Query hooks, query-key factories
 * and invalidation rules shared by web and mobile.
 *
 * PHASE 2 STUB. Rule for Phase 4 onwards: every clinic-scoped key includes
 * clinicId, so switching clinics (multi-clinic Clinic Administrators,
 * decision 5g) can never show one clinic's data under another.
 */
export const queryKeyRoot = ['radial-pulse'] as const;
