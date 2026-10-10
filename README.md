# Radial Pulse — frontend

Nx monorepo for the two Radial Pulse apps, **Studio** and **Clinic**. The
Python backend lives in a separate repository; this repo talks to it only
through the published API contract (`contracts/api/`), via API Gateway.

| Product    | Release                         | Path          | Who uses it                                                         | Built with                                       |
| ---------- | ------------------------------- | ------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| **Studio** | **V1** (the only V1 deployment) | `apps/web`    | Radial Pulse staff: Platform Administrator, Digital Success Manager | React + Vite, TanStack Router and Query          |
| **Clinic** | **V2** (not deployed in V1)     | `apps/mobile` | Clinic Administrator (one or more clinics)                          | Expo (React Native), Expo Router, TanStack Query |

**V1 = Studio only.** The Clinic app, Client Collaboration (chat) and voice
samples are V2: their code stays here and keeps passing CI, but they are not
part of V1 deployment or acceptance. Studio switches its V2 features off in
`apps/web/src/app/release.ts`, and clinic accounts get a "can't use Studio"
screen. Media in V1 is photos only. Scope:
[docs/scope-v1.md](docs/scope-v1.md).

Studio and Clinic are the product names; the technical paths, package names
(`@radial-pulse/web`, `@radial-pulse/mobile`) and scripts keep `web` / `mobile`.
Coding agents: start with [AGENTS.md](AGENTS.md).

## Status

- **Built:** design system, platform shell, API client and contract pipeline,
  Studio (V1: dashboards, clinics, clinic details, assessments, social media,
  photo review, users, settings; plus V2 code for chat and voice samples) and
  Clinic for Clinic Administrators (V2: home, insights, social media,
  assessments, profile, media upload, chat, connect accounts).
- **Data:** API contract 0.3.1 (unreleased). While the backend is not
  deployed, both apps run on contract-based mock data (never in prod).
- **Sign-in (Phase 7):** Cognito Managed Login, email and password,
  Authorization Code + PKCE ([docs/phase-7-auth.md](docs/phase-7-auth.md)).
  With API mocking on, development personas sign in instead.
- Backend gaps and what each one blocks:
  [docs/phase-4-contract-dependency.md](docs/phase-4-contract-dependency.md).

## Getting started

Requires Node 22+ and pnpm 10 (`corepack enable`).

```bash
pnpm install
pnpm affected        # lint, typecheck, test, build for changed projects
pnpm nx graph        # dependency graph
```

Studio and Clinic are separate apps and run as separate processes; neither
needs the other running. Start each in its own terminal:

```bash
pnpm dev:web         # Studio (staff) on http://localhost:4200
pnpm dev:mobile      # Clinic (V2): Expo dev server (Expo Go / device)
pnpm dev:mobile:web  # Clinic (V2) in a browser on http://localhost:8081
```

With API mocking on (`apps/web/public/config.json`, and `apps/mobile/.env`
with `EXPO_PUBLIC_API_MOCKING=true`), each app serves its own contract mocks:
Studio through a service worker, Clinic in-process. Real Cognito sign-in in
Clinic needs a development or store build, because Cognito only redirects to
the app's registered scheme (Expo Go uses an `exp://` address).

## How it fits together

```
      Studio: apps/web (staff)          Clinic: apps/mobile (Clinic Administrator)
   modules: dashboard, clinics,         modules: home, insights, social-media,
   assessments, social-media, chat,     assessments, profile, chat, connect-accounts
   users, settings
            |                                         |
   packages/web: web-shell, web-ui      packages/mobile: mobile-shell, mobile-ui
             \                                       /
              \                                     /
   packages/shared (platform-neutral)
     shell-core      navigation, permissions, clinic context (React)
     auth            sign-in, session from GET /me, createAppServices
     api-client-react, api-client     React Query hooks; services, errors, request ids
     ui-shared, utils, config, design-tokens, shared-types
     api-mocks       contract mocks, dev/test only
                                   |
                     API Gateway  ->  backend  ->  domain / engine teams
```

UI is layered the same way on both platforms:

```
design-tokens  ->  ui primitives  ->  ui components  ->  app patterns  ->  feature pages
(colours,         (Button, Input,    (MetricCard,        (page-kit,         (modules/*)
 spacing, type)    Card, Badge)       FindingCard,        shell kit)
                   web-ui /           charts)
                   mobile-ui
```

Details: [docs/architecture.md](docs/architecture.md),
[ADR 0009](docs/adr/0009-library-structure.md) and each library's README under
`packages/{shared,web,mobile}/*/`.

## Where do I put this?

| I'm adding…                                          | Put it in                                                                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| A screen or feature-specific component               | `apps/web/src/modules/<feature>/` (Studio), `apps/mobile/src/modules/<feature>/` (Clinic)                            |
| A new navigation entry or clinic tab                 | that module's `manifest.ts`, registered in the app's `module-registry.ts`                                            |
| Something two modules of one app share               | `apps/web/src/app/` (Studio) or `apps/mobile/src/shell/` (Clinic); modules never import each other                   |
| A call to a new API operation                        | `packages/shared/api-client/src/services/<domain>.ts` + a hook in `packages/shared/api-client-react/src/<domain>.ts` |
| A mock for that operation (dev/test only)            | `packages/shared/api-mocks/src/`, only if the operation is in the contract                                           |
| A generic, reusable component (no feature knowledge) | contract in `packages/shared/ui`, components in `packages/web/ui` / `packages/mobile/ui`                             |
| A label or colour for a contract enum value          | `packages/shared/utils/src/labels.ts`, `packages/shared/ui/src/tones.ts`                                             |
| A colour, spacing or type value                      | `packages/shared/design-tokens/src/tokens.ts` (then `pnpm --filter @radial-pulse/design-tokens generate`)            |
| Session, permissions, clinic context, app shell      | `packages/shared/auth`, `packages/shared/shell-core`, `packages/{web,mobile}/shell`                                  |
| A pure helper (no React)                             | `packages/shared/utils`                                                                                              |
| A domain type                                        | nowhere: use `Schema<'Name'>` from `@radial-pulse/shared-types`                                                      |

## Rules enforced in CI

Lint fails the build if any of these is broken (`eslint.config.mjs`), and
`pnpm architecture:check` fails if a rule stops rejecting a known violation:

- Every project has a `type:*` and a `platform:*` tag; dependencies follow
  them ([ADR 0009](docs/adr/0009-library-structure.md)). Utilities and types
  depend only on utilities and types.
- Web (Studio) and mobile (Clinic) projects never depend on each other;
  platform-neutral libraries depend on neither and use no browser or Node
  globals.
- Feature modules never import each other, including by relative path.
- Libraries never import apps, never reach into another project by path, and
  never form cycles.
- Apps never talk HTTP themselves: no `openapi-fetch`, `createApiClient` or
  `useApiClient` in apps, and no raw `fetch` in screens; screens use resource hooks.
- Contract mocks and MSW are used only by an app's mocking module and tests;
  Studio's `verify-bundle` keeps them off the startup path.
- Only the app config modules read environment variables.

## Who owns what

| Area                                                             | Owner                                   |
| ---------------------------------------------------------------- | --------------------------------------- |
| This repository (Studio, Clinic, shared packages)                | Frontend (Central Tech)                 |
| API contract, auth, permissions, data                            | Backend team                            |
| Scores, severities, findings, improvement opportunities, metrics | Domain / engine teams (via the backend) |
| AWS, Cognito, CloudFront, EAS builds                             | DevOps                                  |

**The frontend never computes scores, severities, availability,
improvement opportunities or improvement work items.** It shows what the API returns.

## Read before contributing

Coding agents start with [AGENTS.md](AGENTS.md) (repository map, rules, workflow).

1. [docs/responsibilities.md](docs/responsibilities.md) — what Central Tech owns vs. domain teams.
2. [docs/scope-v1.md](docs/scope-v1.md) — what is in and explicitly out of V1.
3. [docs/architecture.md](docs/architecture.md) and [docs/adr/](docs/adr/).
4. [docs/glossary.md](docs/glossary.md) — approved terminology.
