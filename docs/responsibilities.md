# Central Tech vs. domain teams

Central Tech owns reusable tenancy, security, delivery and cross-team
contracts. Each domain team owns its domain calculations and workflow logic.

| Central Tech (this repo)                                                        | Domain teams (outside the frontend)                                       |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Platform shell: auth, session, tenant and clinic context, role-aware navigation | Audit engines: website, SEO, local SEO, GBP, AEO, GEO, social, competitor |
| Design system and shared UI primitives                                          | Score calculation and weighting                                           |
| API client, published contracts, shared types                                   | Finding generation, severity, evidence collection                         |
| Generic rendering of assessments, sections, findings, evidence, insights        | Enrichment logic and source discovery                                     |
| Work-queue rendering                                                            | Deciding which work items exist and when                                  |
| Chat, CI/CD, environments                                                       | Social metric retrieval through official APIs                             |

## The rule in code

The frontend never computes a score, severity, availability state,
recommendation or work item. It renders what the published contract says.

- Assessment sections render generically from the contract; unknown section
  keys fall back to the generic renderer, so a new engine needs no frontend
  release.
- Unknown work-item kinds render generically with a link.
- In V1, domain teams do not write frontend code (decision 1). Central Tech
  owns every module.
