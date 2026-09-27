# V1 scope

Enforced in code by each app's `module-registry.ts`: a feature that is not a
registered module does not exist in the app.

## In V1

**Web** (Platform Administrator, Digital Success Manager): Dashboard,
Clinics / My Clinics (one route, label by capability), clinic context
(Overview with Actions panel, Digital Information, Unified Audit, Social Media,
Chat), Audit Reports, Users (Platform Administrator only), Settings.

**Mobile** (Clinic Administrator, one or more clinics): Welcome, Login
(Cognito managed login), Permissions / Connect Accounts, Home (with clinic
switcher when more than one clinic), Insights, Social Media, Social Media
Detail, Reports (published assessments only), Profile, Chat (floating button).

**Platform:** work queue as a capability (DSM dashboard widgets and clinic
Actions panel; kinds: assessment awaiting review, unverified profile to
confirm), chat by polling, environments DEV + PROD.

## Explicitly out of V1

- Video generation
- Website brief management
- Full scheduling UI
- Clinic staff product (`CLINIC_TEAM_MEMBER` exists in types/capabilities only)
- Domain-specific audit engines (backend and domain teams)
- Scraping infrastructure
- Separate audit types or audit-type navigation
- Separate recommendations module (recommendations live inside Insights)
- Separate onboarding or analytics tabs
- A `/work-queue` route or nav item
- Staging environment, WebSockets, EAS Update
