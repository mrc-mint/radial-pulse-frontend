# Architecture

Summary of the approved Phase 1 proposal (v2 plus the V1 decisions). Section
numbers are referenced from code comments.

## §1 Responsibilities

See [responsibilities.md](responsibilities.md).

## §2 Structure

Two apps, seven packages (see README). Feature modules live inside the apps
and are promoted to packages only when genuinely shared.

## §3 Dependency rules

Enforced by `@nx/enforce-module-boundaries` (tags in each `package.json`) and
`no-restricted-imports` in `eslint.config.mjs`.

| Tag                         | May depend on                                |
| --------------------------- | -------------------------------------------- |
| `type:app`                  | everything below                             |
| `type:shell`                | ui, data-access, config, util, types, tokens |
| `type:ui`                   | tokens, types, util                          |
| `type:data-access`          | types, config, util                          |
| `type:config`, `type:util`  | types                                        |
| `type:types`, `type:tokens` | nothing                                      |

Also enforced: web never imports native code and vice versa; platform-neutral
packages import neither DOM nor React Native; packages never import apps;
modules never import each other; only the app config modules read env.
Packages expose only their entry points via `exports`, so deep imports fail.

## §4 Platform shell

`platform-shell/core` holds the `ModuleManifest` contract (nav entries and
clinic sections), `resolveNavigation()` / `resolveClinicSections()`
(capabilities from `GET /me`, never role-name checks), the session boundary
(ADR 0008), config context and clinic context (`useClinicId()`; route-driven
on web, `ClinicSelectionProvider` on mobile). `/web` holds the router-agnostic
app shell (sidebar ≥1024px, icon rail 768–1023px, drawer below), the clinic
workspace frame and shell states; `/native` the mobile layouts. Composition is
compile-time; no micro-frontends.

## §5 Work queue

Generic `WorkItem` from the backend. V1 surfaces: DSM dashboard widgets and
the clinic Overview Actions panel. No dedicated route.

## §6 Web routing

TanStack Router, file-based. Canonical report URL
`/clinics/$clinicId/audit/$assessmentId`. Built in Phase 5.

## §7 Mobile navigation / API Gateway

Expo Router groups `(public)` (Welcome, Sign in), `(app)` guarded by the
Clinic Administrator gate with `(setup)/connect-accounts`, `(tabs)` (Home,
Insights, Social Media, Reports, Profile — from the modules' manifests,
filtered by the selected clinic's permissions), `chat` as a modal from the
floating button, and detail screens. `ClinicSelectionProvider` scopes the whole
signed-in tree to one clinic. App composition lives in `src/shell` (not
`src/app`, which Expo Router would treat as routes). Built in Phase 6. The API client handles gateway-level 401/403/429/504 and
sends `x-request-id` on every request.

## §8 Environments

local, dev, prod. Web: build once, runtime `/config.json` per environment.
Mobile: EAS profiles `development`, `dev`, `prod` set `APP_ENV`.
`createConfig()` rejects API mocking in prod.

## §9 Types and contracts

`contracts/api/openapi.json` (pinned published version) →
`shared-types/src/contract/generated.ts` → domain aliases. The frontend
defines no enum values of its own for assessment status or severity.

## Auth (Phase 7)

Cognito managed login via Amplify Auth (`signInWithRedirect`) on both
platforms. Web tokens in sessionStorage plus a strict CSP on CloudFront.
Mobile tokens in expo-secure-store via a chunking adapter. The API client only
sees an injected `AuthBridge`.
