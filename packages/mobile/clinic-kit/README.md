# @radial-pulse/clinic-kit

Building blocks shared by Clinic's feature libraries and its app (ADR 0010).
Tags: `type:feature-kit`, `platform:mobile`.

| Contents                                                           | File                                                  |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| Shell kit: Callout, ListRow, DefinitionList, confirmAction, errors | `kit.tsx`                                             |
| Assessment kit: score hero, component tiles, finding rows          | `assessment-kit.tsx`                                  |
| Clinic data hooks (accessible clinics, published assessments)      | `clinic-data.ts`                                      |
| Connected accounts: rows and the Connect flow                      | `connection-row.tsx`, `use-connect-platform.ts`       |
| Connect browser context (the app provides the implementation)      | `connect-browser.tsx`                                 |
| Social metrics, icons, device storage                              | `social-metrics.tsx`, `icons.ts`, `device-storage.ts` |

Belongs here: code two or more Clinic features (or a feature and the app)
need. Does not belong here: single-feature code, generic components
(`@radial-pulse/mobile-ui`) or feature code. The kit never imports a feature.
