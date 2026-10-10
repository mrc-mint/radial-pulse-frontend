# 0010 — Feature libraries

Status: accepted. Supersedes the "feature modules stay folders inside the apps"
part of ADR 0009; everything else in ADR 0009 stands.

## Context

The mentor audit recommended making features independent Nx projects. With
features as folders inside `apps/web` and `apps/mobile`, a change to any
feature re-ran every target of its app, ownership was not visible in the
project graph, and feature isolation depended on a path-resolving lint rule
rather than on Nx project boundaries.

## Decision

Every feature folder of both apps is a library under its platform group, and
the apps keep only bootstrap, routing, providers, configuration and
composition.

| Studio (`packages/web`, `platform:web`) | Clinic (`packages/mobile`, `platform:mobile`) |
| --------------------------------------- | --------------------------------------------- |
| `studio-dashboard`                      | `clinic-home`                                 |
| `studio-clinics`                        | `clinic-insights`                             |
| `studio-assessments`                    | `clinic-assessments`                          |
| `studio-social-media`                   | `clinic-social-media`                         |
| `studio-users`                          | `clinic-profile`                              |
| `studio-settings`                       | `clinic-chat` (V2 chat)                       |
| `studio-chat` (V2, flag off)            | `clinic-connect-accounts`                     |
|                                         | `clinic-auth` (Welcome, Sign in)              |
| `studio-kit` (shared feature kit)       | `clinic-kit` (shared feature kit)             |

Granularity follows the existing business domains: each library is one
navigation entry or clinic section with its own manifest, API hooks, routes
and (where present) tests, so a change re-runs only that feature and the app.
No folder was merged or split.

What the apps shared with their features moved into one kit per app,
`type:feature-kit`:

- `studio-kit`: page kit, clinic photo, activity text, release flags
  (`STUDIO_FEATURES`) and navigation labels. The app's shell provides the
  labels through `NavLabelsProvider`, so features no longer import the app's
  module registry.
- `clinic-kit`: shell kit, assessment kit, clinic data hooks, connected
  account rows and flow, social metrics, icons, device storage and the
  Connect browser context (the app provides the implementation).

Each feature exposes two entry points: `.` (pages or screens for the app's
routes) and `./manifest` (navigation contribution), so the app's module
registry imports navigation without page code.

Tags and rules (`eslint.config.mjs`):

| Tag                | May depend on                                                |
| ------------------ | ------------------------------------------------------------ |
| `type:feature`     | `feature-kit`, `shell`, `ui`, `data-access`, `util`, `types` |
| `type:feature-kit` | `shell`, `ui`, `data-access`, `util`, `types`                |
| `type:app`         | adds `feature` and `feature-kit` to its previous list        |

So a feature never depends on another feature, kits never depend on
features, and no lower layer depends on either. Platform rules are unchanged:
Studio features are `platform:web`, Clinic features `platform:mobile`.
Features and kits also keep the app rules that applied to screens: no raw HTTP
client (`openapi-fetch`, `createApiClient`, `useApiClient`), no MSW or
mocks, no raw `fetch`, and the mobile globals bans for Clinic features.

`pnpm architecture:check` adds cases for these rules and fails if a
`src/modules` folder reappears in an app. The local
`local/feature-boundaries` rule stays as a guard for such folders.

## Consequences

- Nx affected runs only the changed feature, its dependents and the app; a
  kit change runs the features of that app.
- Studio's route-level code splitting is unchanged (one extra shared chunk for
  the navigation-label context); MSW stays isolated in the app mocking modules.
- Clinic feature libraries run Jest with the app's `jest-expo` setup, and map
  AsyncStorage to its official Jest mock because the kit loads device storage.
- Feature libraries type-check on their own with loose route types; the apps
  still type-check feature source against their typed routes (TanStack Router
  register, Expo Router typed routes).
