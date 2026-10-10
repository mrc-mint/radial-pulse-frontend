# 0001 — Nx + pnpm monorepo, internal source packages

Status: accepted

Packages are consumed as TypeScript source through package.json `exports`
(no build step). Vite and Metro both compile workspace TS directly. Targets are
package.json scripts, which Nx picks up as inferred targets; Nx plugins can be
added later without changing the structure.

Update (ADR 0009): libraries are grouped under `packages/shared`, `packages/web`
and `packages/mobile`, one Nx project each, still consumed as source.
