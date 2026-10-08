# @radial-pulse/platform-shell

The application frame shared by Studio (web) and Clinic (mobile): who is signed in, which
clinic is in view, what the person may see, and the layout around the
screens. It is deliberately thin; feature logic lives in the apps' modules.

| Entry     | Contents                                                                                                                                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/core`   | Session (`sessionFromMe`, controller, sign-in providers, `createAppServices`), product experience, clinic context, permissions (`useCan`, `useClinicCan`), module manifests and navigation, config context |
| `/web`    | Studio app shell (sidebar, header), clinic workspace frame, full-page states, brand                                                                                                                        |
| `/native` | Clinic layout pieces: screen container, chat button, clinic switcher, full-screen states, brand                                                                                                            |

## Belongs here

- Authentication and session wiring (tokens stay inside the sign-in provider;
  screens never see them).
- Clinic context: which clinic is in scope and switching between clinics.
- Permissions checks and navigation built from module manifests.
- The app shell and layout primitives every screen sits in.

## Does not belong here

- Anything about a feature: assessments, findings, social metrics, reports,
  chat content, work items. That lives in the app's `modules/`.
- Feature-specific components. Generic components go in `@radial-pulse/ui`.
- API calls. Use `@radial-pulse/api-client` (the shell only wires the client
  to the session in `createAppServices`).
- Hand-written domain types. Use `Schema<'Name'>` from `@radial-pulse/shared-types`.

If a change here needs a feature name in the code, it is probably in the wrong
package.
