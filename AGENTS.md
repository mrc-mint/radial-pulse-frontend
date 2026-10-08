# AGENTS.md

Guide for coding agents (and new contributors) working in this repository.
Read it before changing code. It summarises rules that are also enforced by
lint and documented in more depth in [README.md](README.md) and [docs/](docs/).

## What this repository is

The Radial Pulse frontend: an Nx + pnpm monorepo with **two applications**
and shared packages. The Python backend is a separate repository; this repo
talks to it only through the published API contract in `contracts/api/`
(via API Gateway).

| Product name | Release | Technical path | Nx project / package   | Who uses it                                                           | Stack                                            |
| ------------ | ------- | -------------- | ---------------------- | --------------------------------------------------------------------- | ------------------------------------------------ |
| **Studio**   | **V1**  | `apps/web`     | `@radial-pulse/web`    | Radial Pulse staff: Platform Administrators, Digital Success Managers | React + Vite, TanStack Router and Query          |
| **Clinic**   | **V2**  | `apps/mobile`  | `@radial-pulse/mobile` | Clinic side: Clinic Administrators; Clinic Team Members later         | Expo (React Native), Expo Router, TanStack Query |

**Naming convention.** Use **Studio** and **Clinic** for the products in
docs, comments and descriptions. The technical identifiers stay as they are:
`apps/web`, `apps/mobile`, `@radial-pulse/web`, `@radial-pulse/mobile`, the
`dev:web` / `dev:mobile` scripts, and the platform words `web` / `native`
(entry points such as `@radial-pulse/ui/web`, `@radial-pulse/ui/native`).
Do not rename paths, packages or scripts for terminology.

Do not confuse the **Clinic app** (the product) with the domain term
**clinic** (a Client Organization, API `clinic`, `/clinics`, `clinic_id`).
Domain terms come from [docs/glossary.md](docs/glossary.md): Client
Organization, Clinic Administrator, Clinic Team Member, Practitioner, Digital
Success Manager, Platform Administrator. Backend identifiers (`clinic`,
`clinicId`, `/clinics`, `dsm`, …) are never renamed for UI wording.

## V1 and V2 scope

**V1 deploys Studio only.** V1 deployment and acceptance criteria cover
Studio for Platform Administrators and Digital Success Managers. Full list:
[docs/scope-v1.md](docs/scope-v1.md).

**V2 (code kept, not part of V1 deployment or acceptance):**

- the whole Clinic app (`apps/mobile`), its EAS builds and releases;
- Client Collaboration (chat) in both apps, including Studio's Client
  Collaboration section (`apps/web/src/modules/chat`);
- voice samples (recording, upload, review), including the Voice samples part
  of Studio's Media section;
- other capabilities that need the Clinic app (clinic-side uploads, the clinic
  connecting its own social accounts) and the Clinic Team Member experience.

**Media in V1 is photos only:** practitioner photos, hospital photos, logo and
cover photo.

Rules for agents:

- Do not delete V2 code. It stays in the repository and must keep passing
  lint, typecheck and tests, so changes to shared packages must not break it.
- Do not treat Clinic or other V2 features as V1 work: no V1 acceptance,
  release notes or deployment steps for them.
- New V1 work goes into Studio (`apps/web`) and the shared packages.
- Studio's V2 features are switched off in
  [`apps/web/src/app/release.ts`](apps/web/src/app/release.ts)
  (`STUDIO_FEATURES`): Client Collaboration (section, `/chat` URL redirects to
  the Overview, dashboard widgets, row action, unread badge) and voice samples
  (Media shows photos only). Do not turn a flag on for V1, and gate any new
  V2 surface in Studio the same way.
- Clinic accounts (`clinic_user`) cannot use Studio: they get only a "Clinic
  accounts can't use Radial Pulse Studio" screen with sign-out
  (`apps/web/src/app/clinic-account-blocked.tsx`).

## Repository structure

```
apps/
  web/                      Studio (staff, browser) — V1
    src/modules/<feature>/  feature modules: dashboard, clinics, assessments,
                            social-media, chat, users, settings
    src/app/                app composition shared by Studio modules: router,
                            module registry, page kit, providers, sign-in wiring
    src/routes/             TanStack Router file routes (thin: render module pages)
    src/lib/config.ts       the only Studio file that reads configuration
    public/config.json      runtime config (no build-time env)
  mobile/                   Clinic (clinic side, Expo) — V2, not deployed in V1
    app/                    Expo Router routes (thin: re-export module screens)
    src/modules/<feature>/  feature modules: home, insights, social-media,
                            assessments, profile, chat, connect-accounts, auth
    src/shell/              app composition shared by Clinic modules: module
                            registry, providers, gate, shell kit, sign-in wiring
                            (not src/app: Expo Router would treat it as routes)
    src/lib/config.ts       the only Clinic file that reads env (plus app.config.ts)
packages/
  api-client/      the only way to call the API: services, TanStack Query hooks
                   (/react), error model, contract mocks (/mocks, dev/test only)
  shared-types/    types generated from the contract + thin domain aliases
  ui/              design system: /shared prop contracts and tones, /web (DOM)
                   and /native (React Native) implementations
  utils/           pure, platform-neutral helpers (no React), e.g. labels,
                   clinic status, media rules, Practitioner Profile form logic
  platform-shell/  app infrastructure: session/sign-in, product experience,
                   clinic context, permissions, module manifests, navigation,
                   app shells (/core, /web, /native)
  config/          typed environment schema and createConfig()
  design-tokens/   colours, spacing, type: TS object (native) + CSS variables (web)
contracts/api/     pinned OpenAPI snapshot (openapi.json) and VERSION
tools/scripts/     contract tooling: api-sync, contract-check, type generation
docs/              architecture, ADRs, glossary, scope, responsibilities, phase notes
```

Package READMEs with "belongs here / does not belong here" rules:
[api-client](packages/api-client/README.md),
[ui](packages/ui/README.md),
[platform-shell](packages/platform-shell/README.md),
[api-client mocks](packages/api-client/src/mocks/README.md).

## Architecture and dependency direction

```
Routes (apps/web/src/routes, apps/mobile/app)      thin entry points
    ↓
Feature modules (apps/*/src/modules/<feature>)     screens, feature components
    ↓
App composition (apps/web/src/app, apps/mobile/src/shell)
    ↓
Hooks / shared logic: @radial-pulse/api-client/react, platform-shell, utils
    ↓
Shared packages: api-client services → shared-types (generated contract)
    ↓
API Gateway → backend
```

Package dependencies follow Nx tags (each `package.json` → `nx.tags`),
enforced by `@nx/enforce-module-boundaries` in `eslint.config.mjs`:

| Tag                                        | May depend on                                |
| ------------------------------------------ | -------------------------------------------- |
| `type:app` (web, mobile)                   | every package                                |
| `type:shell` (platform-shell)              | ui, data-access, config, util, types, tokens |
| `type:ui` (ui)                             | tokens, types, util                          |
| `type:data-access` (api-client)            | types, config, util                          |
| `type:config`, `type:util` (config, utils) | types                                        |
| `type:types`, `type:tokens`                | nothing                                      |

Rules (most are lint errors):

- **Feature modules never import other feature modules.** Share through the
  app's composition folder (`src/app` / `src/shell`) or a package.
  Lint only catches imports whose path contains `modules/`; a relative
  `../other-feature/…` import is not caught, so do not write one.
- **Packages never import apps** or feature modules.
- **Studio (web/DOM) code never imports native code, and Clinic (native) code
  never imports DOM code.** Platform-neutral package parts (`api-client`,
  `ui/shared`, `platform-shell/core`) import neither.
- **Pure packages** (`utils`, `shared-types`, `config`, `design-tokens`) import
  no React.
- **API access goes through `@radial-pulse/api-client`.** Screens use resource
  hooks from `@radial-pulse/api-client/react`. Apps never import
  `openapi-fetch`, `createApiClient` or `useApiClient`, and never use `fetch`
  for the API. The client is built once by `createAppServices`
  (platform-shell).
- **Only the app config modules read environment variables**
  (`apps/*/src/lib/config.ts`, `apps/mobile/app.config.ts`).
- **Generated contract types are never edited by hand**
  (`packages/shared-types/src/contract/generated.ts`). Domain types are
  `Schema<'Name'>` from `@radial-pulse/shared-types`; do not hand-write them.
- **The contract is the source of truth.** Do not invent API fields, rename
  backend identifiers, or compute scores, severities, availability,
  improvement opportunities or work items in the frontend
  ([docs/responsibilities.md](docs/responsibilities.md)).
- Packages expose only their `exports` entry points; deep imports fail.
- **platform-shell is infrastructure,** not a home for feature logic. If a
  change there needs a feature name in code, it belongs in an app module.

## Where to put new code

| I'm adding…                                                             | Put it in                                                                                         |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| A Clinic feature (screen, feature component), V2                        | `apps/mobile/src/modules/<feature>/`, route file in `apps/mobile/app/`                            |
| A Studio feature (page, feature component)                              | `apps/web/src/modules/<feature>/`, route file in `apps/web/src/routes/`                           |
| A navigation entry or clinic tab/section                                | the module's `manifest.ts`, registered in the app's `module-registry.ts`                          |
| Something two modules of one app share                                  | `apps/web/src/app/` (Studio) or `apps/mobile/src/shell/` (Clinic)                                 |
| A reusable Button / Card / Input / Badge / chart (no feature knowledge) | `packages/ui/src/{shared,web,native}`, one prop contract with web and native implementations      |
| A label or tone for a contract enum value                               | `packages/utils/src/labels.ts`, `packages/ui/src/shared/tones.ts`                                 |
| Platform-independent logic used by both apps or several features        | `packages/utils` (pure TypeScript, no React)                                                      |
| A call to an API operation                                              | service in `packages/api-client/src/services/<domain>.ts` + hook in `src/react/<domain>.ts`       |
| A mock for that operation (dev/test only)                               | `packages/api-client/src/mocks/`, only if the operation is in the contract                        |
| A colour, spacing or type value                                         | `packages/design-tokens/src/tokens.ts`, then `pnpm --filter @radial-pulse/design-tokens generate` |
| Session, permissions, clinic context, app shell                         | `packages/platform-shell`                                                                         |
| A domain type                                                           | nowhere: use `Schema<'Name'>`                                                                     |
| A new contract version                                                  | `pnpm api:sync --version <x.y.z>` (see [contracts/api/README.md](contracts/api/README.md))        |

Code needed by only one feature stays in that feature's module. Do not move
it into a package "in case" something else needs it later.

## When to promote code into a package

Promote only when all of these hold:

1. It is genuinely needed by more than one feature, or by both Studio and
   Clinic.
2. It has no knowledge of a specific screen or feature flow.
3. It fits the package's stated purpose and tag rules.

Keep packages from becoming dumping grounds:

- `utils`: pure functions with a clear domain (labels, status, form logic
  shared by both apps). Not a place for one-off helpers, React code or API
  calls.
- `platform-shell`: session, clinic context, permissions, navigation and
  layout frames only. No feature content.
- `ui`: generic presentational components that receive data and never fetch.
  No feature names, no API hooks.

Inside an app, prefer the app composition folder (`src/app` / `src/shell`)
before a package when only that app needs the code.

## Components: three levels

| Level                       | Where                                                         | Examples                                                                                          |
| --------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Design-system components    | `packages/ui` (`/web`, `/native`, `/shared`)                  | Button, Input, Card, Badge, Tabs, Modal/Drawer, MetricCard, charts                                |
| App-level composition       | `apps/web/src/app` (Studio), `apps/mobile/src/shell` (Clinic) | page kit (QueryError, DefinitionList), shell kit (Callout, ListRow), clinic photo, assessment kit |
| Feature-specific components | `apps/*/src/modules/<feature>`                                | clinic header, media review, Practitioner Profile screen/card                                     |

Use design-system components first. Add an app-level component when two
modules of one app need it. Add to `ui` only when it is generic. Every
data-showing component has loading, empty and error states (`Skeleton`,
`EmptyState`, `ErrorState`). Missing values from the API are shown as missing
("Not Available"), never as 0.

## Checks

Commands from the root `package.json` (Nx runs each project's own target):

| Purpose                                     | Command                                                           |
| ------------------------------------------- | ----------------------------------------------------------------- |
| Lint (includes architecture boundaries)     | `pnpm lint`                                                       |
| Typecheck                                   | `pnpm typecheck`                                                  |
| Tests (Vitest; Jest + jest-expo for Clinic) | `pnpm test`                                                       |
| Build (Studio)                              | `pnpm build`                                                      |
| Only changed projects                       | `pnpm affected` (lint, typecheck, test, build)                    |
| Formatting                                  | `pnpm format:check` (fix: `pnpm format`)                          |
| Contract types in sync                      | `pnpm contract:check`                                             |
| One project                                 | `pnpm nx run-many -t lint typecheck test -p @radial-pulse/mobile` |
| Dependency graph                            | `pnpm graph`                                                      |

CI (`.github/workflows/ci.yml`) runs `format:check`, `contract:check` and
`nx affected -t lint typecheck test build`.

`contract:check` compares the regenerated types with the committed
`generated.ts` (`git diff`), so it fails until a regenerated file is committed.

Local dev: `pnpm dev:web` (Studio, http://localhost:4200),
`pnpm dev:mobile` (Clinic, V2, Expo), `pnpm dev:mobile:web` (Clinic in a browser,
http://localhost:8081). With API mocking on, both apps run on contract mocks
and offer development personas instead of Cognito sign-in.

## Agent workflow

1. Read this file.
2. Read the relevant docs: [docs/architecture.md](docs/architecture.md),
   [docs/scope-v1.md](docs/scope-v1.md), [docs/glossary.md](docs/glossary.md),
   the ADRs in [docs/adr/](docs/adr/) and the package README you will touch.
3. Identify the owning app (Studio or Clinic) and module.
4. Inspect existing patterns in that module and its neighbours before
   creating a new abstraction.
5. Reuse existing components, hooks and utils.
6. Make the smallest change that solves the task. Do not rename identifiers,
   move modules or change the contract as a side effect.
7. Run the relevant checks (at least lint, typecheck and tests for the
   affected projects; `pnpm affected` covers them).
8. Report the files changed and the checks run, with their results.
