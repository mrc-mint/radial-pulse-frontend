Feature modules of Studio, the internal staff app (`apps/web`): dashboard,
clinics, assessments, social-media, chat, users, settings. `chat` (Client
Collaboration) is V2 code, switched off in V1 by `STUDIO_FEATURES`
(`src/app/release.ts`). Each exports a `ModuleManifest` and is registered in
`src/app/module-registry.ts`. Modules may not import each other. Added from Phase 5.
