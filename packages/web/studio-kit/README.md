# @radial-pulse/studio-kit

Building blocks shared by Studio's feature libraries (ADR 0010). Tags:
`type:feature-kit`, `platform:web`.

| Contents                                                                 | File               |
| ------------------------------------------------------------------------ | ------------------ |
| Page kit: QueryError, Section, DefinitionList, ClinicStatusBadge, errors | `page-kit.tsx`     |
| Clinic cover photo                                                       | `clinic-photo.tsx` |
| Plain-language activity lines for audit events                           | `activity-text.ts` |
| Release flags (`STUDIO_FEATURES`: V2 features off in V1)                 | `release.ts`       |
| Navigation labels for the signed-in user (`NavLabelsProvider`)           | `nav-labels.tsx`   |

Belongs here: code two or more Studio features need. Does not belong here:
anything only one feature uses (keep it in that feature), generic components
(`@radial-pulse/web-ui`) or feature code. The kit never imports a feature.
