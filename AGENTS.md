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
`dev:web` / `dev:mobile` scripts, and the platform words `web` / `mobile` in
library names and tags (`@radial-pulse/web-ui`, `@radial-pulse/mobile-ui`,
`platform:web`, `platform:mobile`).
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
  Collaboration section (`packages/web/studio-chat`);
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
  [`packages/web/studio-kit/src/release.ts`](packages/web/studio-kit/src/release.ts)
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
    src/app/                bootstrap and composition: router, providers, module
                            registry, shell wiring, sign-in, mocking
    src/routes/             TanStack Router file routes (thin: render feature pages)
    src/lib/config.ts       the only Studio file that reads configuration
    public/config.json      runtime config (no build-time env)
  mobile/                   Clinic (clinic side, Expo) — V2, not deployed in V1
    app/                    Expo Router routes (thin: re-export feature screens)
    src/shell/              bootstrap and composition: module registry, providers,
                            gate, tabs, services, sign-in wiring, mocking
                            (not src/app: Expo Router would treat it as routes)
    src/lib/config.ts       the only Clinic file that reads env (plus app.config.ts)
packages/                    one Nx project per library, grouped by platform (ADR 0009)
  shared/                    platform-neutral (platform:neutral)
    types/                   @radial-pulse/shared-types: generated contract types + domain aliases
    config/                  @radial-pulse/config: typed runtime config schema, createConfig()
    utils/                   @radial-pulse/utils: pure helpers (labels, clinic status, media
                             rules, Practitioner Profile form logic), no React
    design-tokens/           @radial-pulse/design-tokens: TS object (mobile) + CSS variables (web)
    ui/                      @radial-pulse/ui-shared: prop contracts, tones, display helpers
    api-client/              @radial-pulse/api-client: the only way to call the API
                             (transport, error model, services)
    api-client-react/        @radial-pulse/api-client-react: TanStack Query hooks and keys
    api-mocks/               @radial-pulse/api-mocks: contract mocks (dev/test only)
    auth/                    @radial-pulse/auth: sign-in providers, session controller,
                             createAppServices (no React)
    shell-core/              @radial-pulse/shell-core: manifests, navigation, session and
                             permission hooks, clinic and config context
  web/                       Studio only (platform:web)
    studio-<feature>/        feature libraries (ADR 0010): dashboard, clinics,
                             assessments, social-media, users, settings, chat
    studio-kit/              @radial-pulse/studio-kit: page kit, clinic photo, release
                             flags, nav labels — shared by Studio features
    ui/                      @radial-pulse/web-ui: DOM design system (React Aria + Tailwind)
    shell/                   @radial-pulse/web-shell: app shell, clinic workspace, states
  mobile/                    Clinic only (platform:mobile)
    clinic-<feature>/        feature libraries (ADR 0010): home, insights, assessments,
                             social-media, profile, chat, connect-accounts, auth
    clinic-kit/              @radial-pulse/clinic-kit: shell kit, assessment kit, clinic
                             data, connections, icons — shared by Clinic features
    ui/                      @radial-pulse/mobile-ui: React Native design system
    shell/                   @radial-pulse/mobile-shell: screen, chat button, clinic switcher
contracts/api/     pinned OpenAPI snapshot (openapi.json) and VERSION
tools/scripts/     contract tooling (api-sync, contract-check, type generation) and
                   architecture-check
tools/eslint/      local ESLint rule: legacy guard against feature folders inside apps
docs/              architecture, ADRs, glossary, scope, responsibilities, phase notes
```

Each library has a README with "belongs here / does not belong here" rules,
for example [ui-shared](packages/shared/ui/README.md),
[web-ui](packages/web/ui/README.md), [shell-core](packages/shared/shell-core/README.md),
[auth](packages/shared/auth/README.md), [api-client](packages/shared/api-client/README.md)
and [api-mocks](packages/shared/api-mocks/README.md). Structure decision:
[ADR 0009](docs/adr/0009-library-structure.md) and
[ADR 0010](docs/adr/0010-feature-libraries.md) (feature libraries).

## Architecture and dependency direction

```
Routes (apps/web/src/routes, apps/mobile/app)      thin entry points
    ↓
App composition (apps/web/src/app, apps/mobile/src/shell)
    ↓
Feature libraries (packages/web/studio-*, packages/mobile/clinic-*)
    ↓                                              pages, screens, feature components
Feature kits (studio-kit, clinic-kit)
    ↓
Platform libraries: web-shell + web-ui (Studio), mobile-shell + mobile-ui (Clinic)
    ↓
Shared libraries: shell-core → auth → api-client-react → api-client → shared-types
                  ui-shared, utils, config, design-tokens
    ↓
API Gateway → backend
```

Every project has one `type:*` and one `platform:*` tag (its `package.json` →
`nx.tags`). `@nx/enforce-module-boundaries` in `eslint.config.mjs` enforces:

| Tag                | May depend on                                                                        | Projects                                      |
| ------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------- |
| `type:app`         | everything except another app                                                        | web, mobile                                   |
| `type:feature`     | `feature-kit`, `shell`, `ui`, `data-access`, `util`, `types` (never another feature) | `studio-*`, `clinic-*` features               |
| `type:feature-kit` | `shell`, `ui`, `data-access`, `util`, `types`                                        | studio-kit, clinic-kit                        |
| `type:shell`       | `shell`, `ui`, `data-access`, `util`, `types`                                        | shell-core, web-shell, mobile-shell           |
| `type:ui`          | `ui`, `util`, `types`                                                                | ui-shared, web-ui, mobile-ui                  |
| `type:data-access` | `data-access`, `util`, `types`                                                       | api-client, api-client-react, auth            |
| `type:mocks`       | `data-access`, `util`, `types` (apps only)                                           | api-mocks                                     |
| `type:util`        | `util`, `types`                                                                      | utils, config, design-tokens                  |
| `type:types`       | nothing                                                                              | shared-types                                  |
| `platform:web`     | `web`, `neutral`                                                                     | web and everything under `packages/web`       |
| `platform:mobile`  | `mobile`, `neutral`                                                                  | mobile and everything under `packages/mobile` |
| `platform:neutral` | `neutral`                                                                            | everything under `packages/shared`            |

Rules (all lint errors; `pnpm architecture:check` proves they reject violations):

- **Features never import other features.** Each feature is a library
  (`type:feature`); Nx rejects a dependency on another feature, by package
  name, relative path, dynamic import or re-export. Share through the app's
  feature kit (`studio-kit`, `clinic-kit`) or a lower library. Apps import a
  feature only through its entry points (`@radial-pulse/<feature>` and
  `@radial-pulse/<feature>/manifest`).
- **Libraries never import apps**, and no project reaches into another
  project by a relative or absolute path. Circular project dependencies fail.
- **Web and mobile never meet.** Studio and `packages/web/*` cannot import
  mobile libraries, React Native or Expo; Clinic and `packages/mobile/*` cannot
  import web libraries, `react-dom`, React Aria or `lucide-react`. Shared
  libraries import neither.
- **Utilities and types** (`utils`, `config`, `design-tokens`, `shared-types`)
  depend only on other utilities and types, import no React and no MSW, and
  their source compiles without DOM or Node types.
- **Platform-neutral source** (`packages/shared/*/src`) uses no browser or Node
  globals (`window`, `document`, storage, `navigator`, `process`, `Buffer`, …,
  also via `globalThis`). Mobile code uses no `document` or web storage.
  Exceptions are one-line, commented `eslint-disable`s for feature-detected
  code only.
- **API access goes through `@radial-pulse/api-client`.** Screens use resource
  hooks from `@radial-pulse/api-client-react`. Apps never import
  `openapi-fetch`, `createApiClient` or `useApiClient`, and screens (feature
  libraries, kits and route files) never call `fetch` (lint). The only exceptions are
  commented one-liners that read a local file URI, never the API. The client is built once by `createAppServices`
  (`@radial-pulse/auth`).
- **Mocks are dev/test only.** Only apps may depend on `@radial-pulse/api-mocks`,
  and inside an app only its mocking module (`apps/web/src/app/mocking.ts`,
  `apps/mobile/src/shell/mocking.ts`) and tests may import it or MSW.
- **Only the app config modules read environment variables**
  (`apps/*/src/lib/config.ts`, `apps/mobile/app.config.ts`).
- **Generated contract types are never edited by hand**
  (`packages/shared/types/src/contract/generated.ts`). Domain types are
  `Schema<'Name'>` from `@radial-pulse/shared-types`; do not hand-write them.
- **The contract is the source of truth.** Do not invent API fields, rename
  backend identifiers, or compute scores, severities, availability,
  improvement opportunities or work items in the frontend
  ([docs/responsibilities.md](docs/responsibilities.md)).
- Libraries expose only their `exports` entry points; deep imports fail to
  resolve.
- **Shell libraries are infrastructure,** not a home for feature logic. If a
  change there needs a feature name in code, it belongs in a feature library.

## Where to put new code

| I'm adding…                                                             | Put it in                                                                                                                                                      |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A Clinic feature (screen, feature component), V2                        | its library `packages/mobile/clinic-<feature>/`, route file in `apps/mobile/app/`                                                                              |
| A Studio feature (page, feature component)                              | its library `packages/web/studio-<feature>/`, route file in `apps/web/src/routes/`                                                                             |
| A navigation entry or clinic tab/section                                | the feature's `src/manifest.ts` (entry `/manifest`), registered in the app's `module-registry.ts`                                                              |
| Something two features of one app share                                 | the app's feature kit: `packages/web/studio-kit` or `packages/mobile/clinic-kit`                                                                               |
| A new feature                                                           | a new `studio-<feature>` / `clinic-<feature>` library (tags `type:feature` + platform), registered in the app ([ADR 0010](docs/adr/0010-feature-libraries.md)) |
| A reusable Button / Card / Input / Badge / chart (no feature knowledge) | prop contract in `packages/shared/ui`, implementations in `packages/web/ui` and `packages/mobile/ui`                                                           |
| A label or tone for a contract enum value                               | `packages/shared/utils/src/labels.ts`, `packages/shared/ui/src/tones.ts`                                                                                       |
| Platform-independent logic used by both apps or several features        | `packages/shared/utils` (pure TypeScript, no React)                                                                                                            |
| A call to an API operation                                              | service in `packages/shared/api-client/src/services/<domain>.ts` + hook in `packages/shared/api-client-react/src/<domain>.ts`                                  |
| A mock for that operation (dev/test only)                               | `packages/shared/api-mocks/src/`, only if the operation is in the contract                                                                                     |
| A colour, spacing or type value                                         | `packages/shared/design-tokens/src/tokens.ts`, then `pnpm --filter @radial-pulse/design-tokens generate`                                                       |
| Sign-in, session controller, app services                               | `packages/shared/auth`                                                                                                                                         |
| Permissions hooks, clinic context, navigation, manifests                | `packages/shared/shell-core`                                                                                                                                   |
| App shell / layout frame                                                | `packages/web/shell` (Studio), `packages/mobile/shell` (Clinic)                                                                                                |
| A new library                                                           | a folder under `packages/{shared,web,mobile}/` with one `type:*` and one `platform:*` tag ([ADR 0009](docs/adr/0009-library-structure.md))                     |
| A domain type                                                           | nowhere: use `Schema<'Name'>`                                                                                                                                  |
| A new contract version                                                  | `pnpm api:sync --version <x.y.z>` (see [contracts/api/README.md](contracts/api/README.md))                                                                     |

Code needed by only one feature stays in that feature's library. Do not move
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
- `auth`, `shell-core`, `web-shell`, `mobile-shell`: session, clinic context,
  permissions, navigation and layout frames only. No feature content.
- `ui-shared`, `web-ui`, `mobile-ui`: generic presentational components that
  receive data and never fetch. No feature names, no API hooks.

Code shared by features of one app goes in that app's feature kit, not in a
shared library and not in the app (features cannot import the app).

## Components: three levels

| Level                       | Where                                            | Examples                                                                                          |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Design-system components    | `web-ui`, `mobile-ui` (contracts in `ui-shared`) | Button, Input, Card, Badge, Tabs, Modal/Drawer, MetricCard, charts                                |
| Feature kits                | `studio-kit` (Studio), `clinic-kit` (Clinic)     | page kit (QueryError, DefinitionList), shell kit (Callout, ListRow), clinic photo, assessment kit |
| Feature-specific components | `packages/{web,mobile}/<app>-<feature>`          | clinic header, media review, Practitioner Profile screen/card                                     |

Web interactive components in `packages/web/ui` are shadcn-style: React
Aria Components for behaviour, Tailwind (theme mapped onto the tokens) for
styling; see [packages/web/ui/README.md](packages/web/ui/README.md#web-shadcn--react-aria).
Do not add Radix or another headless library next to React Aria, and do not
use Tailwind classes in apps or feature libraries.

Use design-system components first. Add a feature-kit component when two
features of one app need it. Add to `web-ui` / `mobile-ui` only when it is generic. Every
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
| Only changed projects                       | `pnpm affected` (lint, typecheck, test, build, verify-bundle)     |
| Architecture rules reject violations        | `pnpm architecture:check`                                         |
| Studio bundle keeps mocks off startup path  | `pnpm nx run @radial-pulse/web:verify-bundle`                     |
| Formatting                                  | `pnpm format:check` (fix: `pnpm format`)                          |
| Contract types in sync                      | `pnpm contract:check`                                             |
| One project                                 | `pnpm nx run-many -t lint typecheck test -p @radial-pulse/mobile` |
| One target of one project                   | `pnpm nx run @radial-pulse/web:typecheck`                         |
| Dependency graph                            | `pnpm graph`                                                      |

Nx is the supported way to run project-level `lint`, `typecheck`, `test`
and `build` targets, for example:

```bash
pnpm nx run @radial-pulse/web:typecheck
```

Nx runs each target's dependencies first, such as Studio's `generate-routes`
before `build`, `typecheck` and `test`. Running a package script directly
(`pnpm --filter <package> typecheck`) skips them and is not supported; on a
fresh checkout Studio's typecheck then fails because `src/routeTree.gen.ts`
does not exist yet.

CI (`.github/workflows/ci.yml`) runs `format:check`, `contract:check`,
`architecture:check` and `nx affected -t lint typecheck test build verify-bundle`.

`contract:check` compares the regenerated types with the committed
`generated.ts` (`git diff`), so it fails until a regenerated file is committed.

### Studio route tree

`apps/web/src/routeTree.gen.ts` is generated (git-ignored, never edited by
hand). Both writers use the same TanStack Router generator
(`@tanstack/router-generator`):

- the Nx target `@radial-pulse/web:generate-routes` runs `tsr generate` in
  `apps/web`. It reads only `tsr.config.json` and runs before `build`,
  `typecheck` and `test`;
- the TanStack Router Vite plugin in `vite.config.ts` (also loaded by Vitest)
  regenerates the file in the dev server. During `vite build` it also builds
  the route map that route-level code splitting needs.

The generator rewrites the route tree only when the new content differs from
the file on disk, so after `generate-routes` the plugin leaves it untouched.

Both must produce the same file. Keep `tsr.config.json` as the source of truth
for every setting that changes the generated output (`routesDirectory`,
`generatedRouteTree`, `quoteStyle`, `routeFilePrefix`, `target`, and so on);
the CLI reads all of them from it. The plugin reads `tsr.config.json` too, but
options passed to `tanstackRouter()` override it for the plugin only.
`vite.config.ts` currently passes `target: 'react'`, the same value the CLI uses
by default, and `autoCodeSplitting`, which changes bundling but not the
generated file. Do not add other output-affecting options there. Generator
plugins and function-valued options cannot be written in JSON, so adding one
would make the two outputs differ; treat that as a build change, not a
configuration tweak. If the outputs differ, `vite build` or Vitest rewrites the
file while another task may be reading it.

Avoid editing route files while generation is running (an Nx run, or the dev
server reacting to a change). The generator writes to a temporary file under
`apps/web/.tanstack/tmp` and renames it over the target. On Windows that rename
has failed with `EPERM` when several generator processes ran at once. If it
happens, stop the conflicting process (dev server, watch mode or a second Nx
run) and run the command again.

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
