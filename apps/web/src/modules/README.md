Feature modules (dashboard, clinics, assessments, social-media, chat, users,
settings). Each exports a `ModuleManifest` and is registered in
`src/app/module-registry.ts`. Modules may not import each other. Added from Phase 5.
