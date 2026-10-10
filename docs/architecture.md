# Architecture

Summary of the approved Phase 1 proposal (v2 plus the V1 decisions). Section
numbers are referenced from code comments.

## §1 Responsibilities

See [responsibilities.md](responsibilities.md).

## §2 Structure

Two apps and thirty-one libraries, grouped by platform under
`packages/shared` (platform-neutral), `packages/web` (Studio only) and
`packages/mobile` (Clinic only); see [ADR 0009](adr/0009-library-structure.md)
and [ADR 0010](adr/0010-feature-libraries.md)
and the tree in [AGENTS.md](../AGENTS.md#repository-structure). Features
are libraries too (`studio-*`, `clinic-*`, ADR 0010); the apps keep
bootstrap, routing, providers, configuration and composition.

| Product | Release                 | Path          | Package                | Platform               |
| ------- | ----------------------- | ------------- | ---------------------- | ---------------------- |
| Studio  | V1 (only V1 deployment) | `apps/web`    | `@radial-pulse/web`    | web (internal staff)   |
| Clinic  | V2 (not deployed in V1) | `apps/mobile` | `@radial-pulse/mobile` | native (clinic-facing) |

V1 scope: [scope-v1.md](scope-v1.md). V2 code (Clinic, chat, voice samples)
stays in the repository and keeps passing CI.

"Studio" and "Clinic" name the products; `web` and `mobile` name platforms
in library names and tags (`web-ui`, `mobile-shell`, `platform:mobile`).

## §3 Dependency rules

Every project carries one `type:*` tag (`app`, `shell`, `ui`, `data-access`,
`mocks`, `util`, `types`) and one `platform:*` tag (`web`, `mobile`,
`neutral`). The allowed directions are in
[ADR 0009](adr/0009-library-structure.md) and
[AGENTS.md](../AGENTS.md#architecture-and-dependency-direction). In short:
utilities and types depend only on utilities and types; web and mobile
projects never depend on each other; neutral projects depend only on neutral
ones; mocks are used only by apps.

Enforcement, all lint errors in CI (`eslint.config.mjs`):

| Rule                                    | Enforces                                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `@nx/enforce-module-boundaries`         | tag constraints, banned external packages per tag, no relative/absolute imports into another project, no cycles                   |
| `local/feature-boundaries`              | legacy guard: feature folders inside an app never import each other (features are libraries, ADR 0010)                            |
| `no-restricted-imports` (apps)          | no raw HTTP client in apps; mocks and MSW only in the app mocking module and tests                                                |
| `no-restricted-globals` / `-properties` | no browser or Node globals in `packages/shared/*/src`; no `document` or web storage in mobile code; no raw `fetch` in app screens |
| `no-restricted-syntax`                  | only the app config modules read env                                                                                              |

`pnpm architecture:check` lints known-bad and known-good snippets through the
real config and compares declared workspace dependencies with actual imports,
so a rule that stops rejecting violations fails CI. `shared-types`, `utils`,
`config` and `design-tokens` also compile their source without DOM or Node
types. Libraries expose only their `exports` entry points, so deep imports
fail to resolve. Library boundaries in prose: `packages/*/*/README.md`.

## §4 Platform shell

`@radial-pulse/auth` holds the session boundary (ADR 0008): sign-in providers,
the framework-free `SessionController` built from `GET /me`, and
`createAppServices`. `@radial-pulse/shell-core` holds the `ModuleManifest`
contract (nav entries and clinic sections), `resolveNavigation()` /
`resolveClinicSections()` (capabilities from `GET /me`, never role-name
checks), the session and permission hooks, config context and clinic context
(`useClinicId()`; route-driven in Studio, `ClinicSelectionProvider` in Clinic).
`@radial-pulse/web-shell` holds the router-agnostic Studio app shell (sidebar
≥1024px, icon rail 768–1023px, drawer below), the clinic workspace frame and
shell states; `@radial-pulse/mobile-shell` the Clinic layouts. Composition is
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
Clinic (V2, not deployed in V1): EAS profiles `development`, `dev`, `prod` set `APP_ENV`; `prod` also sets
`EXPO_PUBLIC_APP_ENV=prod`, so the app config refuses mocking there
(`apps/mobile/src/lib/prod-profile.test.ts`).
`createConfig()` rejects API mocking in prod. Studio keeps the contract
mocks as a lazily loaded chunk in its single artifact (ADR 0003: dev may mock,
the same artifact is promoted to prod); `@radial-pulse/web:verify-bundle`
fails the build if mock code reaches the startup path. Clinic prod builds
replace the mocking module with a stub.

## §9 Types and contracts

`contracts/api/openapi.json` (pinned published version) →
`shared-types/src/contract/generated.ts` → domain aliases. The frontend
defines no enum values of its own for assessment status or severity.

## Auth

Cognito Managed Login, email and password, Authorization Code + PKCE, with a
public app client per app (ADR 0006, docs/phase-7-auth.md). One shared
provider, `createCognitoAuth` in `@radial-pulse/auth`; no Amplify. Studio tokens
in sessionStorage plus a strict CSP on CloudFront. Clinic tokens in
expo-secure-store via a chunking adapter. The API client only sees an injected
`AuthBridge`; the session comes from `GET /api/v1/auth/me`. Service-to-service
(client-credentials) auth is backend-only.
