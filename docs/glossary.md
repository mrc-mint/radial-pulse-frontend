# Glossary

Canonical product terminology comes from the Project Entity & Terminology
Mapping. Each term below lists the **canonical term** (product and docs), the
**API identifier** it maps to in contract 0.3.1 (never renamed for
terminology), and the **UI copy** the apps show.

## Products

| Product name | What it is                                                                                                            | Technical identifiers (unchanged)                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Studio       | V1. Internal staff-facing web application (Platform Administrators, Digital Success Managers); the only V1 deployment | `apps/web`, `@radial-pulse/web`, `dev:web`          |
| Clinic       | V2. Clinic-facing mobile application (Clinic Administrators; Clinic Team Members later); not deployed in V1           | `apps/mobile`, `@radial-pulse/mobile`, `dev:mobile` |

"Clinic" (the product) is not the same as a clinic (a Client Organization,
API `clinic`). In prose, say "the Clinic app" when the product is meant.

## Core terms

| Canonical term                      | API identifier (contract 0.3.1)                                     | UI copy                                                                                 | Replaces                    |
| ----------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------- |
| Platform Administrator              | `platform_administrator`                                            | Platform Administrator                                                                  | Internal Admin (never used) |
| Digital Success Manager             | `digital_success_manager`, `dsm`, `dsm_user_id`                     | Digital Success Manager                                                                 | Internal User (never used)  |
| Clinic Administrator                | `clinic_user` + clinic role `clinic_administrator`                  | Clinic Administrator                                                                    | Clinic Owner                |
| Clinic Team Member                  | clinic role `clinic_team_member`                                    | Clinic Team Member (future; not a V1 experience)                                        | Clinic Staff                |
| Client Organization                 | `clinic` (`ClinicRead`, `/clinics`, `clinic_id`)                    | Studio: "client organization"; Clinic app (the clinic itself): "your clinic"            | Clinic                      |
| Practitioner                        | `practitioner` (`PractitionerRead`, `practitioner_photo`)           | Practitioner, Practitioner photos; personal titles such as "Dr." are kept               | Doctor                      |
| Digital Presence Intelligence Agent | (backend agent; stage `profile_enriched`)                           | Not named in the UI; the stage label stays "Profile enriched"                           | Profile Enrichment Agent    |
| Digital Growth Team                 | `source_team` (work items; not shown)                               | Not shown in V1                                                                         | SEO Team                    |
| Digital Presence Assessment         | `assessment` (`/assessments`)                                       | Digital Presence Assessment(s); Clinic app tab "Assessments"                            | Audit Report, Unified Audit |
| Improvement Opportunities           | `FindingRead.recommendation`                                        | "Improvement opportunity" on each finding; "Findings and improvement opportunities"     | Recommendations             |
| Improvement Work Items              | `work_items` (`WorkItemRead`, `WorkArea`)                           | Improvement work items                                                                  | Actions / Tasks             |
| Portfolio Allocation                | `assignment` (`AssignmentRead`, `assignments:manage`, `unassigned`) | Portfolio allocation, Allocate to portfolio, Change portfolio allocation, Not allocated | Assignments                 |
| Prospective Client                  | stage `prospective_client`; stage group `prospects`                 | Prospective client(s)                                                                   | Prospect                    |
| Client Activation                   | (stage moves towards `active_client`)                               | Client activation                                                                       | Onboarding                  |
| Client Collaboration (V2)           | `chat` (`/chat`, `chat:read`, `ChatMessageRead`)                    | Client Collaboration (section); "Chat" as the compact action word                       | Clinic Chat                 |
| My Client Portfolio                 | `all_clinics: false` on `GET /auth/me`; `GET /clinics`              | My Client Portfolio                                                                     | My Clinics                  |
| Social Presence Insights            | `connections`, `snapshots`, assessment component `social_presence`  | Studio: Social Presence Insights; Clinic app tab: Social Presence                       | Social Media Audit          |

## Other terms

| Term                              | Meaning                                                                    | Notes                                                                                                                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section / Component               | A component of an assessment (`AssessmentComponentKey`)                    | Shown as SEO (`website`), Google Business Profile, Local Search, AEO (`search_readiness`), Social Presence, Competitor Benchmark. The Google Business Profile score is not shown (findings are) |
| Not Available                     | Component status `not_available`: no engine available                      | Never a score of 0                                                                                                                                                                              |
| Unverified / Confirmed / Rejected | `PresenceVerification` of a discovered profile                             | Human decisions win                                                                                                                                                                             |
| Priority                          | `FindingPriority` of a finding (critical → info)                           | Never "severity" in code or copy                                                                                                                                                                |
| Permission                        | A contract `Permission` from `GET /auth/me` (platform-level or per clinic) | UI only; backend enforces                                                                                                                                                                       |
| Module                            | A feature that registers a manifest with the shell                         | Modules don't import each other                                                                                                                                                                 |

## Client status

What Studio shows for a client organization: the API's `stage_group`,
plus Inactive for archived ones. The frontend key for the first group is
`prospect` (frontend-only; the contract code is `prospects`).

| Status             | Contract data                                                             |
| ------------------ | ------------------------------------------------------------------------- |
| Prospective client | `stage_group` `prospects` (`prospective_client`, `profile_enriched`)      |
| In progress        | `stage_group` `in_progress` (`assessment_completed`, `client_discussion`) |
| Active             | `stage_group` `active` (`active_client`)                                  |
| Inactive           | archived (`is_active` false; a reason is required)                        |

## Client media

| Term                     | Meaning                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Practitioner photos      | `practitioner_photo` files by apron option, outfit and angle (labels from `GET /media/taxonomy`)                      |
| Hospital photos          | `clinic_photo` files by category (taxonomy), plus the logo (`logo`) and the cover photo (`ClinicRead.cover_asset_id`) |
| Voice samples (V2)       | `audio` files by sample type (taxonomy), for the clinic's phone assistant                                             |
| Awaiting review          | `ApprovalState` `submitted`                                                                                           |
| Verified                 | `approved`                                                                                                            |
| Needs retake / re-record | `redo_requested` (re-record for voice samples); the action is "Request retake"                                        |
| Rejected                 | `rejected`                                                                                                            |
| Not submitted            | `draft`                                                                                                               |

Clinic Administrators upload and replace (`media:upload`); Platform
Administrators and Digital Success Managers review (`media:review`). V1 media
is photos only (practitioner photos, hospital photos, logo, cover photo);
voice samples and clinic-side upload in the Clinic app are V2.
