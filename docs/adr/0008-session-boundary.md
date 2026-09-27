# 0008 — Session boundary and mock sign-in

Status: accepted (platform shell phase; revised when API contract 0.1.0 was
imported; Cognito arrives in Phase 7, ADR 0006)

`platform-shell/core` defines a `SessionAdapter` and a framework-free
`SessionController`. The session content always comes from the contract's
`GET /api/v1/auth/me` (`sessionFromMe`): platform role, platform permissions,
`all_clinics` and per-clinic permissions. Screens use `useSession()`, `useCan()`
and `useClinicCan()` and never see a token; only the composition root
(`apps/web/src/app/services.ts`) connects the token provider to the API client.

Token providers (`apps/web/src/app/session/auth.ts`):

- **Cognito** — Phase 7.
- **Mock sign-in** — only when `apiMocking` is on (which `createConfig()` refuses
  in prod): a persona becomes a `dev-persona:<id>` token that only the MSW
  contract mocks accept. No passwords, no real tokens.
- **Unconfigured** — otherwise; sign-in is unavailable, matching the backend's
  "auth not configured" mode.

Permission values are the contract's `Permission` enum; the frontend defines no
capability strings of its own. Route protection is a UX boundary; the API
enforces access.
