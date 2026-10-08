V2 (not deployed in V1). Feature modules of Clinic, the clinic-facing app (`apps/mobile`, Clinic
Administrators in V1): home, insights, social-media, assessments, profile,
chat, connect-accounts (plus auth for Welcome / Sign in).
Each exports a `ModuleManifest` (tabs are `clinicSections` with a
`requiredPermission`) and is registered in `src/shell/module-registry.ts`.
Modules may not import each other; shared pieces live in `src/shell`.
No Clinic Team Member modules (future scope).
