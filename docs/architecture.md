# Architecture

Summary of the approved Phase 1 proposal (v2 plus the V1 decisions). Section
numbers are referenced from code comments.

## §1 Responsibilities

See [responsibilities.md](responsibilities.md).

## §2 Structure

Two apps, seven packages (see README and [AGENTS.md](../AGENTS.md)). Feature
modules live inside the apps and are promoted to packages only when genuinely
shared.

| Product | Release                 | Path          | Package                | Platform               |
| ------- | ----------------------- | ------------- | ---------------------- | ---------------------- |
| Studio  | V1 (only V1 deployment) | `apps/web`    | `@radial-pulse/web`    | web (internal staff)   |
| Clinic  | V2 (not deployed in V1) | `apps/mobile` | `@radial-pulse/mobile` | native (clinic-facing) |

V1 scope: [scope-v1.md](scope-v1.md). V2 code (Clinic, chat, voice samples)
stays in the repository and keeps passing CI.

"Studio" and "Clinic" name the products; `web` and `native` name platforms
(package entry points such as `ui/web`, `ui/native`) and stay in technical
identifiers.

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

Also enforced: web (Studio) code never imports native (Clinic) code and vice versa; platform-neutral
packages import neither DOM nor React Native; packages never import apps;
modules never import each other; only the app config modules read env;
pure packages (`utils`, `shared-types`, `config`, `design-tokens`) import no
React; apps never import the raw HTTP client (`openapi-fetch`,
`createApiClient`, `useApiClient`) and use resource hooks instead.
Packages expose only their entry points via `exports`, so deep imports fail.
Package boundaries in prose: `packages/*/README.md`.

## §4 Platform shell

`platform-shell/core` holds the `ModuleManifest` contract (nav entries and
clinic sections), `resolveNavigation()` / `resolveClinicSections()`
(capabilities from `GET /me`, never role-name checks), the session boundary
(ADR 0008), config context and clinic context (`useClinicId()`; route-driven
in Studio, `ClinicSelectionProvider` in Clinic). `/web` holds the router-agnostic
Studio app shell (sidebar ≥1024px, icon rail 768–1023px, drawer below), the clinic
workspace frame and shell states; `/native` the Clinic layouts. Composition is
compile-time; no micro-frontends.

## §5 Work queue

Generic `WorkItem` from the backend, shown as Improvement Work Items. V1
surfaces: DSM dashboard widgets and the client organization Overview. No
dedicated route.

## §6 Studio routing (web)

TanStack Router, file-based. Canonical Digital Presence Assessment URL
`/clinics/$clinicId/assessment/$assessmentId`; the cross-client list is
`/assessments`. The old `/audit-reports` and `/clinics/$clinicId/audit/…`
URLs redirect. (Route segments keep the API's `clinics` name.)

## §7 Clinic navigation (mobile, V2) / API Gateway

Clinic is V2; this section describes the existing V2 code. Expo Router groups `(public)` (Welcome, Sign in), `(app)` guarded by the
Clinic Administrator gate with `(setup)/connect-accounts`, `(tabs)` (Home,
Insights, Social Presence, Assessments, Profile — from the modules' manifests,
filtered by the selected clinic's permissions), `chat` as a modal from the
floating button, and detail screens. `ClinicSelectionProvider` scopes the whole
signed-in tree to one clinic. App composition lives in `src/shell` (not
`src/app`, which Expo Router would treat as routes). Built in Phase 6. The API client handles gateway-level 401/403/429/504 and
sends `x-request-id` on every request.

## §8 Environments

local, dev, prod. Studio: build once, runtime `/config.json` per environment.
Clinic (V2, not deployed in V1): EAS profiles `development`, `dev`, `prod` set `APP_ENV`.
`createConfig()` rejects API mocking in prod.

## §9 Types and contracts

`contracts/api/openapi.json` (pinned published version) →
`shared-types/src/contract/generated.ts` → domain aliases. The frontend
defines no enum values of its own for assessment status or severity.

## Auth

Cognito Managed Login, email and password, Authorization Code + PKCE, with a
public app client per app (ADR 0006, docs/phase-7-auth.md). One shared
provider, `createCognitoAuth` in `platform-shell/core`; no Amplify. Studio tokens
in sessionStorage plus a strict CSP on CloudFront. Clinic tokens in
expo-secure-store via a chunking adapter. The API client only sees an injected
`AuthBridge`; the session comes from `GET /api/v1/auth/me`. Service-to-service
(client-credentials) auth is backend-only.
