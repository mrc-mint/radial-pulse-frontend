# @radial-pulse/auth

The session boundary (ADR 0006, ADR 0008), framework-free and shared by both
apps. Tags: `type:data-access`, `platform:neutral`. No React.

| Contents                                                                     | Files                                 |
| ---------------------------------------------------------------------------- | ------------------------------------- |
| Sign-in providers: Cognito Managed Login (PKCE), mock personas, unconfigured | `cognito-auth.ts`, `auth-provider.ts` |
| Session controller and `sessionFromMe` (`GET /api/v1/auth/me`)               | `session.ts`, `api-session.ts`        |
| Composition root: `createAppServices` wires the API client to the session    | `app-services.ts`                     |
| Product experience and role labels                                           | `experience.ts`, `roles.ts`           |

Screens never see tokens: they use the hooks in `@radial-pulse/shell-core`.
Only each app's composition root calls `createAppServices`.

One narrowly scoped exception to the platform-neutral globals rule: the mock
sign-in's default token storage feature-detects `sessionStorage`
(`auth-provider.ts`); mobile passes its own `TokenStorage`.
