# API mocks

MSW handlers used to build the UI while the backend contract is published and
implemented. Every mock targets an operation that exists in the contract
snapshot in `contracts/api/` (currently **0.1.0, unreleased local import**);
responses are typed by the generated schemas and use only contract enum values.

Rules:

- Mock only operations present in the contract. A screen that needs something
  the contract lacks is **blocked**, not mocked (see
  `docs/phase-4-contract-dependency.md`).
- Enabled only when `AppConfig.apiMocking` is true, which `createConfig()`
  rejects in prod. The app imports this entry dynamically, so it never ships.
- Remove a handler (and its row) when the real endpoint is available in the
  environment the app runs against.

Mock sign-in: the mock `/auth/me` resolves `Bearer dev-persona:<id>` tokens to
three personas whose permissions mirror the backend RBAC table
(Platform Administrator, Digital Success Manager, Clinic Administrator).
`__mock-storage` stands in for pre-signed object-storage URLs.

Web runs the handlers in a service worker (`msw/browser`). React Native has
none, so the mobile app uses `createMockFetch()`: the API client's fetch asks
the handlers first (`getResponse`), in-process.

| Operation                                                                                         | Contract version | Reason                                                                                                                           |
| ------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/v1/auth/me`                                                                             | 0.1.0            | Backend not deployed; Cognito not wired (Phase 7)                                                                                |
| `GET /api/v1/dashboard/summary`                                                                   | 0.1.0            | Backend not deployed                                                                                                             |
| `GET/POST /api/v1/clinics`                                                                        | 0.1.0            | Backend not deployed                                                                                                             |
| `GET/PATCH /api/v1/clinics/{clinic_id}`                                                           | 0.1.0            | Backend not deployed                                                                                                             |
| `GET …/assignments`, `PUT …/assignment`                                                           | 0.1.0            | Backend not deployed                                                                                                             |
| `GET/POST /api/v1/users`, `POST …/resend-invite`                                                  | 0.1.0            | Backend not deployed                                                                                                             |
| `GET/PATCH …/presence-profiles`                                                                   | 0.1.0            | Backend not deployed                                                                                                             |
| `GET/POST …/assessments`, `GET …/assessments/{id}`                                                | 0.1.0            | Backend not deployed                                                                                                             |
| `GET …/work-items`                                                                                | 0.1.0            | Backend not deployed                                                                                                             |
| `GET …/connections`, `GET …/connections/{platform}`, `POST …/start`, `…/complete`, `…/disconnect` | 0.1.0            | Backend not deployed. `start` returns a `mock-oauth` address; the mobile app's mock Connect flow hands its `state` straight back |
| `GET /api/v1/chat/inbox`, `GET/POST …/chat/messages`, `POST …/chat/read`                          | 0.1.0            | Backend not deployed                                                                                                             |
| `POST …/assets/uploads`, `POST …/confirm`, `GET …/download-url`                                   | 0.1.0            | Backend not deployed                                                                                                             |
| `GET/PATCH /api/v1/settings/platform`                                                             | 0.1.0            | Backend not deployed                                                                                                             |
| `GET /health`                                                                                     | 0.1.0            | Backend not deployed                                                                                                             |
