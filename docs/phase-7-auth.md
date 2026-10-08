# Phase 7 — Cognito authentication

Real sign-in for both apps: Cognito Managed Login, email and password,
Authorization Code + PKCE, then `GET /api/v1/auth/me`. Decision record:
[ADR 0006](adr/0006-auth-managed-login.md). Contract: 0.3.0.

V1 deploys Studio only, so V1 needs the Studio app client. The Clinic column
below describes V2 code (not deployed in V1).

## Flow

1. The sign-in screen calls `session.signIn()`.
2. `createCognitoAuth` makes a PKCE verifier and `state`, keeps them in the
   app's auth storage, and opens
   `https://<domain>/oauth2/authorize?response_type=code&client_id=…&redirect_uri=…&scope=openid email&state=…&code_challenge=…&code_challenge_method=S256&identity_provider=COGNITO`.
3. The user enters email and password on Managed Login (first sign-in: the
   temporary password from the invitation, then their own).
4. Cognito redirects to the app's callback with `code` and `state`. The app
   checks `state` and exchanges the code at `/oauth2/token` with the verifier.
5. The access token goes to the API as `Authorization: Bearer …`. The session
   is built from `GET /api/v1/auth/me`.
6. Experience gate: Platform Administrators and Digital Success Managers use
   Studio. Clinic accounts are blocked from Studio in V1 ("Clinic accounts
   can't use Radial Pulse Studio", sign-out only); they use the Clinic app in
   V2. Inside an app, permissions gate screens.

| Concern             | Studio (web)                              | Clinic (mobile)                                          |
| ------------------- | ----------------------------------------- | -------------------------------------------------------- |
| Code                | `apps/web/src/app/cognito.ts`             | `apps/mobile/src/shell/cognito.ts`                       |
| Opens Managed Login | Full-page redirect                        | System auth session (expo-web-browser)                   |
| Callback            | `<origin>/auth/callback`, handled at boot | `<scheme>://auth/callback`, returned by the auth session |
| Sign-out return     | `<origin>/sign-in`                        | `<scheme>://signed-out`                                  |
| Token storage       | sessionStorage                            | expo-secure-store, chunked                               |
| Crypto (PKCE)       | Web Crypto                                | expo-crypto                                              |

Expiry: tokens refresh 60 s before they expire (one refresh at a time). A
failed refresh or an API 401 returns the user to sign-in. Sign-out clears
tokens, revokes the refresh token and ends the Managed Login session (on
iOS the auth session is ephemeral, so there is no cookie to end).

## Configuration

Nothing here is secret. Web: `apps/web/public/config.json` per environment.
Mobile: `EXPO_PUBLIC_*` per EAS build profile (`apps/mobile/.env.example`).

| Value                             | Web (`config.json`)        | Mobile                                    |
| --------------------------------- | -------------------------- | ----------------------------------------- |
| API base URL                      | `apiBaseUrl`               | `EXPO_PUBLIC_API_BASE_URL`                |
| User pool id                      | `cognito.userPoolId`       | `EXPO_PUBLIC_COGNITO_USER_POOL_ID`        |
| Public app client id (per app)    | `cognito.userPoolClientId` | `EXPO_PUBLIC_COGNITO_USER_POOL_CLIENT_ID` |
| Managed Login domain              | `cognito.domain`           | `EXPO_PUBLIC_COGNITO_DOMAIN`              |
| Scopes (optional, `openid email`) | `cognito.scopes`           | `EXPO_PUBLIC_COGNITO_SCOPES`              |
| Mocks off                         | `apiMocking: false`        | `EXPO_PUBLIC_API_MOCKING=false`           |

With `REPLACE_ME` placeholders the apps show "sign-in isn't configured". With
API mocking on, development personas sign in instead (never in prod).

## Needed from backend / DevOps (per environment)

1. Managed Login **domain**, user pool id, and a **public app client per app**
   (web, mobile): no client secret, Authorization code grant only, Cognito
   user pool as the only identity provider.
2. **Allowed callback URLs:** web `https://<web-host>/auth/callback` (DEV also
   `http://localhost:4200/auth/callback`); mobile
   `radialpulse-local://auth/callback`, `radialpulse-dev://auth/callback`,
   `radialpulse://auth/callback`.
3. **Allowed sign-out URLs:** web `https://<web-host>/sign-in` (DEV also
   `http://localhost:4200/sign-in`); mobile `<scheme>://signed-out`.
4. **Scopes** on both clients: `openid`, `email` (the access token must be
   accepted by the API Gateway / FastAPI authorizer with these scopes).
5. **Token revocation** enabled on both clients; access-token and
   refresh-token lifetimes confirmed.
6. **CloudFront CSP** for Studio: `connect-src` must allow the API
   domain, the Cognito domain (`/oauth2/token`, `/oauth2/revoke`) and the
   media CloudFront/S3 domain used by download URLs; `img-src` and
   `media-src` must allow the media domain.
7. **API CORS:** the web origins (including `http://localhost:4200` in DEV).
8. **DEV API base URL** (the committed value is a placeholder) and one DEV test
   user per role (Platform Administrator, Digital Success Manager, Clinic
   Administrator).

Unchanged: media stays in private S3 behind CloudFront, reached only through
the API's short-lived download URLs.

## Verification status

- Unit tests: PKCE, state check, code exchange, refresh and expiry, sign-out
  (`cognito-auth.test.ts`), web callback handling (`apps/web/src/app/cognito.test.ts`),
  secure-store chunking (`apps/mobile/src/shell/mobile.test.ts`).
- DEV end-to-end needs items 1–8 above; it has not been run yet.
