# 0001 — Nx + pnpm monorepo, internal source packages

Status: accepted

Packages are consumed as TypeScript source through package.json `exports`
(no build step). Vite and Metro both compile workspace TS directly. Targets are
package.json scripts, which Nx picks up as inferred targets; Nx plugins can be
added later without changing the structure.
