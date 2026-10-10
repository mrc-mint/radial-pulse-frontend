# @radial-pulse/shell-core

The platform-neutral React part of the application frame, shared by
`@radial-pulse/web-shell` (Studio) and `@radial-pulse/mobile-shell` (Clinic):
which clinic is in view, what the person may see, and the navigation built from
module manifests. Tags: `type:shell`, `platform:neutral`.

| Contents                                                                                 | Files                          |
| ---------------------------------------------------------------------------------------- | ------------------------------ |
| Module manifest contract and navigation (`resolveNavigation`, `resolveClinicSections`)   | `manifest.ts`, `navigation.ts` |
| Session and permission hooks (`SessionProvider`, `useSession`, `useCan`, `useClinicCan`) | `session-context.tsx`          |
| Clinic context (`useClinicId`, `ClinicScopeProvider`, `ClinicSelectionProvider`)         | `clinic-context.tsx`           |
| Config context (`ConfigProvider`, `useConfig`)                                           | `config-context.tsx`           |

Sign-in providers, the session controller and `createAppServices` live in
`@radial-pulse/auth`.

## Does not belong here

- Anything about a feature: assessments, findings, social metrics, reports,
  chat content, work items. That lives in the feature libraries.
- Layout components: `web-shell` / `mobile-shell`. Generic components: `web-ui`
  / `mobile-ui`.
- API calls (use `@radial-pulse/api-client-react`) and hand-written domain types
  (use `Schema<'Name'>` from `@radial-pulse/shared-types`).

If a change here needs a feature name in the code, it is in the wrong library.
