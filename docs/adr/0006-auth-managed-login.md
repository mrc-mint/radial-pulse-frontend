# 0006 — Cognito managed login, sessionStorage on web

Status: accepted (decisions 5a, 5c) — implemented in Phase 7

Amplify Auth `signInWithRedirect` on both platforms. Web tokens are kept in
sessionStorage (tab-scoped, survives reload), with a strict Content Security
Policy set on CloudFront. Neither sessionStorage nor memory storage is immune
to XSS; an HttpOnly-cookie backend-for-frontend would be, and is out of scope.
Mobile uses an expo-secure-store adapter that chunks large tokens. Amplify's
native module requires development builds (no Expo Go).
