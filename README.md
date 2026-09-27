# Radial Pulse — frontend

Nx monorepo for the Radial Pulse web app (Platform Administrator, Digital
Success Manager) and mobile app (Clinic Administrator). The Python backend
lives in a separate repository; this repo talks to it only through the
published API contract, via API Gateway.

**Status: Phase 2 — workspace scaffold.** Apps and packages exist with stubs
only. No screens, no modules, no auth yet.

## Layout

```
apps/web                 React + Vite SPA, TanStack Router (file-based)
apps/mobile              Expo + Expo Router
packages/platform-shell  Central Tech shell: session, tenant/clinic context, module manifests, navigation
packages/ui              /shared contracts, /web and /native implementations
packages/design-tokens   single token source (TS + generated CSS variables)
packages/shared-types    generated contract types + domain aliases (types only)
packages/api-client      transport, /react hooks, /mocks (dev/test only)
packages/config          typed env schema, createConfig()
packages/utils           pure helpers
contracts/api            pinned snapshot of the published OpenAPI contract
docs/                    architecture, responsibilities, V1 scope, glossary, ADRs
```

## Getting started

Requires Node 22+ and pnpm 10 (`corepack enable`).

```bash
pnpm install
pnpm nx graph                      # dependency graph
pnpm nx run @radial-pulse/web:dev  # web on http://localhost:4200
pnpm nx run @radial-pulse/mobile:start
pnpm affected                      # lint, typecheck, test, build for changed projects
```

Mobile uses development builds (not Expo Go) once auth lands in Phase 7.

## Read before contributing

1. [docs/responsibilities.md](docs/responsibilities.md) — what Central Tech owns vs. domain teams. **The frontend never computes scores, severities, availability, recommendations or work items.**
2. [docs/scope-v1.md](docs/scope-v1.md) — what is in and explicitly out of V1.
3. [docs/architecture.md](docs/architecture.md) and [docs/adr/](docs/adr/).
4. [docs/glossary.md](docs/glossary.md) — approved terminology.
