# 0008 — Session boundary and mock sign-in

Status: accepted (platform shell phase; revised when API contract 0.1.0 was
imported; Cognito arrives in Phase 7, ADR 0006)

`platform-shell/core` defines a `SessionAdapter` and a framework-free
`SessionController`. The session content always comes from the contract's
`GET /api/v1/auth/me` (`sessionFromMe`): platform role, platform permissions,
`all_clinics` and per-clinic permissions. Screens use `useSession()`, `useCan()`
and `useClinicCan()` and never see a token; only the composition roots
(`createAppServices` in `platform-shell/core`, called by `apps/web/src/main.tsx`
and `apps/mobile/src/shell/services.ts`) connect the token provider to the API
client.

Token providers (`platform-shell/core/auth-provider.ts`, shared by web and
mobile):

- **Cognito** — Phase 7.
- **Mock sign-in** — only when `apiMocking` is on (which `createConfig()` refuses
  in prod): a persona becomes a `dev-persona:<id>` token that only the MSW
  contract mocks accept. No passwords, no real tokens.
- **Unconfigured** — otherwise; sign-in is unavailable, matching the backend's
  "auth not configured" mode.

Product experience (`productExperience()` in `platform-shell/core`) is the one
place role values choose an app: Platform Administrators and Digital Success
Managers use the web portal; clinic accounts that administer at least one
clinic (`clinic_role = clinic_administrator`) use the mobile app; each app shows
the other group a "use the web portal / mobile app" screen. Inside an app,
everything is gated by permissions.

Permission values are the contract's `Permission` enum; the frontend defines no
capability strings of its own. Route protection is a UX boundary; the API
enforces access.
