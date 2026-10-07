# 0006 — Cognito Managed Login with Authorization Code + PKCE

Status: accepted (decisions 5a, 5c). Revised in Phase 7 for API contract
0.3.0: email and password only, no Amplify. Replaces the earlier
"Amplify Auth `signInWithRedirect`" and Google sign-in assumptions.

## Decision

- Users sign in on **Amazon Cognito Managed Login** with **email and
  password** (`MeResponse.sign_in_method` is `email_password`). There is no
  Google or other social sign-in; the authorize request sets
  `identity_provider=COGNITO`.
- The apps use the **OAuth 2.0 Authorization Code grant with PKCE (S256)**
  against the user pool domain (`/oauth2/authorize`, `/oauth2/token`,
  `/oauth2/revoke`, `/logout`). Web and mobile each use their own **public app
  client** (no client secret in any app).
- The implementation is our own small provider in
  `packages/platform-shell/src/core/cognito-auth.ts` (`createCognitoAuth`),
  shared by both apps. **AWS Amplify is not used**: it is not required for
  this flow, and its native module would force an Expo development build for
  everything else too. Amplify may be reconsidered only for a demonstrated
  need.
- The app sends the Cognito **access token** as `Authorization: Bearer …`;
  `GET /api/v1/auth/me` then shapes the session (role, permissions, clinics).
- Service-to-service authentication (the client-credentials grant and the
  `/api/v1/internal/*` routes) belongs to backend services and is never
  implemented in the apps.

## Token storage

- **Web:** sessionStorage (tab-scoped, survives a reload, gone when the tab
  closes), with a strict Content Security Policy set on CloudFront. Neither
  sessionStorage nor memory storage is immune to XSS; an HttpOnly-cookie
  backend-for-frontend would be, and is out of scope.
- **Mobile:** expo-secure-store (Keychain / Keystore) through a chunking
  adapter, because Cognito tokens can exceed the store's ~2 KB value size.
  Managed Login opens in the system auth session (expo-web-browser), which
  runs in Expo Go; the per-environment scheme callback needs a development or
  store build to be registered with Cognito.

## Session lifetime

Access tokens are refreshed with the refresh token shortly before they
expire. A rejected refresh, or a 401 from the API, ends the session and
returns the user to sign-in. Sign-out clears the tokens, revokes the refresh
token, and ends the Managed Login session.

Media delivery is unchanged: private S3 behind CloudFront, reached only
through the API's short-lived download URLs.
