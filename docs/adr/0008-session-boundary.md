# 0008 — Session boundary and development sign-in

Status: accepted (platform shell phase; Cognito arrives in Phase 7, ADR 0006)

`platform-shell/core` defines a `SessionAdapter` (restore, signIn, signOut,
getAccessToken) and a framework-free `SessionController`. Screens use
`useSession()` / `useCan()` and never see a token; only the composition root
passes `controller.authBridge` to the API client (`AuthBridge`).

Until Cognito is wired, the web app uses a **development session adapter**
(`apps/web/src/app/session/dev-session.ts`): persona sign-in (Platform
Administrator, Digital Success Manager), no passwords, no tokens, persisted in
sessionStorage. It throws when `appEnv` is `prod`, so it cannot ship.

Capability strings are backend-owned (`GET /me`). Until the contract is
published, the web app keeps its only capability identifiers in
`apps/web/src/app/capabilities.ts`, marked as placeholders.

Route protection in the web app is a UX boundary; the API enforces access.
