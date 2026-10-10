# @radial-pulse/api-client-react

TanStack Query integration over `@radial-pulse/api-client`, shared by Studio and
Clinic: `ApiClientProvider`, `createQueryClient` (retry policy), query-key
factories, invalidation rules and one resource hook per screen need.
Tags: `type:data-access`, `platform:neutral`.

- Every clinic-scoped query key is built with `clinicQueryKey(clinicId, …)`, so
  one clinic's data can never appear under another.
- Hooks wrap the services; they never declare domain types of their own.
- Apps may not import `useApiClient` (lint): add a resource hook here instead.
