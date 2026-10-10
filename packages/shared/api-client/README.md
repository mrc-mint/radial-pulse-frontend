# @radial-pulse/api-client

The only way the apps talk to the Radial Pulse API: transport, error model and
one service per contract operation. Everything is typed by the generated
contract (`@radial-pulse/shared-types`); nothing here declares a domain type of
its own. No React. Tags: `type:data-access`, `platform:neutral`.

| Library                          | Contents                                                       |
| -------------------------------- | -------------------------------------------------------------- |
| `@radial-pulse/api-client`       | this library: transport, errors, request ids, services         |
| `@radial-pulse/api-client-react` | TanStack Query hooks, provider, query keys, retry policy       |
| `@radial-pulse/api-mocks`        | DEV/TEST ONLY contract mocks (MSW), personas, in-process fetch |

| Path                       | Contents                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `src/http.ts`              | Typed client (openapi-fetch): bearer token, request id, timeout, 401 handling, `unwrap()` |
| `src/errors.ts`            | Error model: problem+json parsing into `ApiError` kinds, field errors, request ids        |
| `src/services/<domain>.ts` | One function per contract operation: clinics, assessments, connections, chat, …           |

## Rules

- Screens use the hooks from `@radial-pulse/api-client-react`. Apps never
  import `openapi-fetch`, `createApiClient` or `useApiClient` (lint enforces it).
- Every clinic-scoped query key is built with `clinicQueryKey(clinicId, …)`, so
  one clinic's data can never appear under another.
- A mock may exist only for an operation that is in the published contract.
- Adding an operation: service in `src/services/<domain>.ts` here, hook in
  `api-client-react` `src/<domain>.ts`, mock in `api-mocks` `src/handlers.ts`
  (+ `mockedEndpoints`).
