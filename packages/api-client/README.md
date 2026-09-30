# @radial-pulse/api-client

The only way the apps talk to the Radial Pulse API. Everything is typed by the
generated contract (`@radial-pulse/shared-types`); nothing here declares a
domain type of its own.

| Path                       | Contents                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `src/http.ts`              | Typed client (openapi-fetch): bearer token, request id, timeout, 401 handling, `unwrap()` |
| `src/errors.ts`            | Error model: problem+json parsing into `ApiError` kinds, field errors, request ids        |
| `src/services/<domain>.ts` | One function per contract operation: clinics, assessments, connections, chat, …           |
| `src/react/<domain>.ts`    | TanStack Query hooks over the services; `query-keys.ts` scopes every clinic key           |
| `src/mocks/`               | DEV/TEST ONLY contract mocks (MSW); never in a production bundle                          |

## Rules

- Screens use the hooks from `@radial-pulse/api-client/react`. Apps never
  import `openapi-fetch`, `createApiClient` or `useApiClient` (lint enforces it).
- Every clinic-scoped query key is built with `clinicQueryKey(clinicId, …)`, so
  one clinic's data can never appear under another.
- A mock may exist only for an operation that is in the published contract.
- Adding an operation: service in `src/services/<domain>.ts`, hook in
  `src/react/<domain>.ts`, mock in `src/mocks/handlers.ts` (+ `mockedEndpoints`).
