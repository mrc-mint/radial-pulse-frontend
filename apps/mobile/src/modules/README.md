Feature modules of the Clinic Administrator app: home, insights, social-media,
reports, profile, chat, connect-accounts (plus auth for Welcome / Sign in).
Each exports a `ModuleManifest` (tabs are `clinicSections` with a
`requiredPermission`) and is registered in `src/shell/module-registry.ts`.
Modules may not import each other; shared pieces live in `src/shell`.
No Clinic Team Member modules (future scope).
