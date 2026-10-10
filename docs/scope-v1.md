# V1 scope

**V1 deploys one application: Studio** (`apps/web`), for Platform
Administrators and Digital Success Managers. V1 deployment and V1 acceptance
criteria cover Studio only.

**Clinic** (`apps/mobile`, the clinic-facing app) **is V2.** Its code stays in
the repository and keeps passing CI (lint, typecheck, tests), but it is not
deployed, released or accepted in V1.

Inside each app, `module-registry.ts` decides which features exist: a feature
that is not a registered module does not exist in the app.

## In V1 (Studio)

Platform Administrator and Digital Success Manager:

- Dashboard
- Client Organizations / My Client Portfolio (one route, label by capability)
- Client organization workspace:
  - Overview, with Improvement work items and the Practitioner Profile
  - Digital Presence
  - Listings
  - Social Presence Insights
  - Digital Presence Assessment
  - Media: **photos only** (practitioner photos, hospital photos, logo and
    cover photo)
  - Activity
- Digital Presence Assessments
- Users (Platform Administrator only)
- Settings

Terminology: [glossary.md](glossary.md).

**Platform:** improvement work items as a capability (DSM dashboard widgets
and the client organization Overview; kinds: assessment awaiting review,
unverified profile to confirm), environments DEV + PROD.

Product experiences (`productExperience()` in `@radial-pulse/auth`):

| Account (contract)                                  | V1                                                                                                                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `platform_administrator`, `digital_success_manager` | Studio.                                                                                                                                                                |
| `clinic_user` (any clinic role)                     | Blocked. Studio shows only "Clinic accounts can’t use Radial Pulse Studio" (access for clinics is planned for a later release) and sign-out; never its internal pages. |

## V2 (code may exist; not V1 deployment or acceptance)

- **Clinic** (`apps/mobile`) and everything in it: Welcome, Login (Cognito
  Managed Login), Permissions / Connect Accounts, Home and clinic switcher,
  Insights, Social Presence and detail, Assessments (published Digital
  Presence Assessments only), Profile (including the Practitioner Profile
  screen), media upload (photos and voice samples), Client Collaboration from
  the floating button. EAS builds and store releases.
- **Client Collaboration** (chat) in both apps, including Studio's Client
  Collaboration section and its unread badge.
- **Voice samples** (recording, upload, review), including the Voice samples
  part of Studio's Media section.
- Any other capability that needs the Clinic app: clinic-side uploads, the
  clinic connecting its own social accounts, the Clinic Administrator
  experience.
- Clinic Team Member experience: no routes, navigation, screens, dashboards
  or workflows; no Team management.

In the V1 Studio build, V2 features are switched off by `STUDIO_FEATURES` in
`packages/web/studio-kit/src/release.ts`: no Client Collaboration section, link, widget,
row action or unread badge (the `/chat` URL redirects to the Overview), and
no Voice samples on the Media section. Social Presence Insights does not say
how accounts get connected (clients connect from the Clinic app, V2).

## Explicitly out of V1

- Everything listed under V2 above
- Video generation
- Website brief management
- Full scheduling UI
- Domain-specific audit engines (backend and domain teams)
- Scraping infrastructure
- Separate audit types or audit-type navigation
- Separate improvement-opportunities module (they live inside Insights and
  the assessment)
- Separate client activation or analytics tabs
- A `/work-queue` route or nav item
- Staging environment, WebSockets, EAS Update
- The contract's `/reports` report files (API layer only; no report-file UI)
