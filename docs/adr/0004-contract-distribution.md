# 0004 — Contract distribution by tagged release

Status: accepted (decision 4)

Backend CI attaches `openapi.json` to a tagged release. `pnpm api:sync`
pins a version into `contracts/api/` and regenerates types in a reviewed PR.
CI fails on drift. A versioned npm types package can replace this later.
