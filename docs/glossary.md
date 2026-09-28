# Glossary

| Term                              | Meaning                                                                    | Notes                                                                                                                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform Administrator            | Platform-level administrator (`platform_administrator`)                    | Never "Internal Admin"                                                                                                                                                                          |
| Digital Success Manager           | Staff user working with assigned clinics (`digital_success_manager`)       | Never "Internal User"                                                                                                                                                                           |
| Clinic Administrator              | Clinic-side owner (`clinic_user` + clinic role `clinic_administrator`)     | May have several clinics                                                                                                                                                                        |
| Clinic Team Member                | Future role                                                                | Not a V1 experience                                                                                                                                                                             |
| Assessment                        | The one unified digital-presence assessment                                | Code name                                                                                                                                                                                       |
| Audit Report / Unified Audit      | User-facing label for an Assessment                                        | No "audit type" anywhere                                                                                                                                                                        |
| Section / Component               | A component of an assessment (`AssessmentComponentKey`)                    | Shown as SEO (`website`), Google Business Profile, Local Search, AEO (`search_readiness`), Social Presence, Competitor Benchmark. The Google Business Profile score is not shown (findings are) |
| Not Available                     | Component status `not_available`: no engine available                      | Never a score of 0                                                                                                                                                                              |
| Unverified / Confirmed / Rejected | `PresenceVerification` of a discovered profile                             | Human decisions win                                                                                                                                                                             |
| Priority                          | `FindingPriority` of a finding (critical → info)                           | Never "severity" in code or copy                                                                                                                                                                |
| Work item                         | A backend-produced action for a clinic                                     | Kinds owned by the backend                                                                                                                                                                      |
| Permission                        | A contract `Permission` from `GET /auth/me` (platform-level or per clinic) | UI only; backend enforces                                                                                                                                                                       |
| Module                            | A feature that registers a manifest with the shell                         | Modules don't import each other                                                                                                                                                                 |

## Clinic status

What the web app shows for a clinic. It groups the contract `ClinicStage` values the way the backend dashboard does, and adds Inactive for archived clinics:

| Status      | Contract data                                             |
| ----------- | --------------------------------------------------------- |
| Prospect    | `prospective_client`, `profile_enriched`                  |
| In progress | `assessment_completed`, `client_discussion`               |
| Active      | `active_client`                                           |
| Inactive    | archived clinic (`is_active` false; a reason is required) |
