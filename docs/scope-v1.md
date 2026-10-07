# V1 scope

Enforced in code by each app's `module-registry.ts`: a feature that is not a
registered module does not exist in the app.

## In V1

**Web** (Platform Administrator, Digital Success Manager): Dashboard,
Client Organizations / My Client Portfolio (one route, label by capability),
client organization workspace (Overview with Improvement work items, Digital
Presence, Listings, Social Presence Insights, Digital Presence Assessment,
Media, Activity, Client Collaboration), Digital Presence Assessments, Users
(Platform Administrator only), Settings. Terminology: docs/glossary.md.

**Mobile** (Clinic Administrator, one or more clinics): Welcome, Login
(Cognito Managed Login), Permissions / Connect Accounts, Home (with clinic
switcher when more than one clinic), Insights, Social Presence, Social
Presence detail, Assessments (published Digital Presence Assessments only),
Profile, Client Collaboration (chat from the floating button).

Two product experiences, never one UI for both
(`productExperience()` in platform-shell):

| Account (contract)                                             | Experience                                                                         |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `platform_administrator`, `digital_success_manager`            | Web portal. The mobile app shows "use the web app".                                |
| `clinic_user` administering ≥1 clinic (`clinic_administrator`) | Mobile app, those clinics only. The web portal shows "Use the mobile app" only.    |
| any other `clinic_user`                                        | None in V1 (no access screen). No Clinic Team Member routes, screens or workflows. |

Assessments (mobile): built from published Digital Presence Assessments. The
contract's `/reports` report files stay in the API layer only (no V1
report-file UI).

**Platform:** improvement work items as a capability (DSM dashboard widgets and
the client organization Overview; kinds: assessment awaiting review, unverified
profile to confirm), Client Collaboration by polling, environments DEV + PROD.

## Explicitly out of V1

- Video generation
- Website brief management
- Full scheduling UI
- Clinic Team Member portal (future phase): no routes, navigation, screens,
  dashboards or workflows; no Team management in the mobile Profile
- Domain-specific audit engines (backend and domain teams)
- Scraping infrastructure
- Separate audit types or audit-type navigation
- Separate improvement-opportunities module (they live inside Insights and
  the assessment)
- Separate client activation or analytics tabs
- A `/work-queue` route or nav item
- Staging environment, WebSockets, EAS Update
