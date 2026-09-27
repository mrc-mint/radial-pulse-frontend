# 0005 — pnpm with node-linker=hoisted

Status: accepted

Metro resolves most reliably with a flat node_modules in monorepos, and
hoisting guarantees a single React copy (the Expo SDK pins React; web and all
packages use the same version via peer dependencies and a root override).
Revisit when Expo's isolated-install support is proven for this setup.
