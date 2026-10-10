# 0009 — Platform-grouped libraries with enforced boundaries

Status: accepted. Refines ADR 0001 (package layout) and ADR 0002 (web and
native UI become separate libraries); ADR 0003 (one artifact promoted dev →
prod) and ADR 0008 (session boundary) are unchanged.

## Context

The original seven packages mixed platforms and responsibilities in single Nx
projects: `ui` held web, native and shared code; `platform-shell` held the
session/auth layer, a React shell core and both platform shells; `api-client`
held transport, React Query hooks and dev-only mocks. Lint rules that looked
like they enforced the web/native split and feature independence could be
bypassed with a relative import (`../web/button`, `../clinics/manifest`),
`platform:*` tags existed without constraints, and the mocks shared a project
with production data access.

## Decision

Libraries are grouped by platform under `packages/`, each one an Nx project
consumed as TypeScript source through its `exports` map (as in ADR 0001):

| Group              | Libraries (`@radial-pulse/…`)                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/shared/` | `shared-types`, `config`, `utils`, `design-tokens`, `ui-shared`, `api-client`, `api-client-react`, `api-mocks`, `auth`, `shell-core` |
| `packages/web/`    | `web-ui`, `web-shell`                                                                                                                |
| `packages/mobile/` | `mobile-ui`, `mobile-shell`                                                                                                          |

Feature modules stay folders inside the apps (`apps/*/src/modules`).

Every project has exactly two tags, in each `package.json` `nx.tags`:

| `type:*`           | May depend on                                 |
| ------------------ | --------------------------------------------- |
| `type:types`       | nothing                                       |
| `type:util`        | `util`, `types`                               |
| `type:ui`          | `ui`, `util`, `types`                         |
| `type:data-access` | `data-access`, `util`, `types`                |
| `type:mocks`       | `data-access`, `util`, `types`                |
| `type:shell`       | `shell`, `ui`, `data-access`, `util`, `types` |
| `type:app`         | everything except `app` (`mocks` included)    |

| `platform:*`       | May depend on       |
| ------------------ | ------------------- |
| `platform:neutral` | `neutral`           |
| `platform:web`     | `web`, `neutral`    |
| `platform:mobile`  | `mobile`, `neutral` |

Enforcement (all in `eslint.config.mjs`, all errors):

- `@nx/enforce-module-boundaries` with the constraints above, plus
  `bannedExternalImports`: no DOM packages in neutral or mobile projects, no
  React Native/Expo in neutral or web projects, no React in `util`/`types`, no
  MSW outside `api-mocks` and the apps. Nx also rejects imports into another
  project by relative or absolute path, and circular project dependencies.
- `local/feature-boundaries` (`tools/eslint/feature-boundaries.mjs`): a feature
  folder may not import another feature folder. It resolves every specifier
  (static, dynamic, re-export, `require`, `import()` types, `vi.mock`), so
  relative paths cannot bypass it.
- Apps: only the mocking module and tests may import `@radial-pulse/api-mocks`
  or MSW; screens never import the raw HTTP client.
- Platform globals: `no-restricted-globals` and `no-restricted-properties`
  (`globalThis.*`) ban browser and Node globals in `packages/shared/*/src` and
  `document`/web storage in mobile code. `shared-types`, `utils`, `config` and
  `design-tokens` also compile their source without DOM or Node types
  (`tsconfig.json`; tests and scripts use `tsconfig.spec.json`). Libraries that
  need fetch types (`api-client`, `auth`, …) keep the DOM lib and rely on lint.

`pnpm architecture:check` (a CI step) lints known-bad and known-good snippets
through the real config and fails if any forbidden import or global is
accepted; it also fails when a project's declared `@radial-pulse/*`
dependencies differ from what its source imports.

Mocks under ADR 0003: Studio keeps the mocks as a lazily imported chunk plus
`mockServiceWorker.js` in the single artifact, because dev may run with
`apiMocking` and the same artifact is promoted to prod. `createConfig()` refuses
mocking in prod, and `@radial-pulse/web:verify-bundle` (CI) fails if mock code
becomes reachable from `index.html` through static imports.

## Consequences

- A web/mobile, layer or feature violation fails lint in CI, whatever import
  spelling is used.
- More projects (16), so affected analysis is finer: a change to `web-ui` no
  longer touches Clinic.
- New libraries follow the same pattern: a folder under the right platform
  group, two tags, an `exports` entry, and a case in the architecture check if
  the boundary is new.
- Not done: `@nx/dependency-checks` (it skips projects without a `build` target,
  which source libraries do not have; the architecture check covers workspace
  dependencies instead). Studio source maps remain enabled; whether to publish
  them is a deployment/security follow-up.
