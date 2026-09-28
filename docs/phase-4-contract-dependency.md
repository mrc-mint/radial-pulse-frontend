# API contract dependency and status

Contract in use: **0.1.0, unreleased local import** (`contracts/api/VERSION` is
`0.1.0-unreleased`). It is byte-identical to the backend repository's committed
`openapi/openapi.json`; replace it with `pnpm api:sync --version 0.1.0` once the
backend tags `v0.1.0`.

Domain and entity types come **only** from the generated contract
(`packages/shared-types`: `Schema<'ClinicRead'>`, `Permission`, `PlatformRole`,
…). The frontend does not hand-write them. Where a screen needs something the
contract lacks, the screen shows a clear "not available yet" state and the gap
is listed below — nothing is invented.

## Built on the contract (Phase 5, web)

| Area        | Operations                                                                         | Screen                                                            |
| ----------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Session     | `GET /auth/me`                                                                     | Sign-in, navigation, permissions (`sessionFromMe`)                |
| Dashboard   | `GET /dashboard/summary`, `GET /chat/inbox`                                        | Dashboard (both roles)                                            |
| Clinics     | `GET/POST /clinics`, `GET/PATCH /clinics/{id}`                                     | Clinics / My Clinics, Add clinic, clinic header, Edit clinic      |
| Assignment  | `GET …/assignments`, `PUT …/assignment`, `GET /users`                              | Overview → Digital Success Manager                                |
| Work items  | `GET …/work-items`                                                                 | Overview → Open work                                              |
| Presence    | `GET/PATCH …/presence-profiles`                                                    | Digital Information (confirm / reject)                            |
| Assessments | `GET/POST …/assessments`, `GET …/assessments/{id}`                                 | Unified Audit, canonical `/clinics/$clinicId/audit/$assessmentId` |
| Connections | `GET …/connections`                                                                | Social Media → Connected accounts                                 |
| Chat        | `GET/POST …/chat/messages`, `POST …/chat/read`, assets upload/confirm/download-url | Chat (polling via `useChatMessages`)                              |
| Users       | `GET/POST /users`, `POST /users/{id}/resend-invite`                                | Users                                                             |
| Settings    | `GET/PATCH /settings/platform`                                                     | Settings → General                                                |

Contract conventions applied: problem+json errors (`errors[]`, `request_id`,
`type` → `ApiError.code`; 404 = not found or no access; 502 → `upstream`; 503 →
`unavailable`), `limit`/`offset`/`total` paging, two-level permissions
(`MeResponse.permissions` + per-clinic `ClinicAccess.permissions`),
`all_clinics` for the "My Clinics" label, `ComponentStatus` (`not_available`,
`pending`, `failed` never shown as a number), `FindingPriority`,
`PresenceVerification`. Enum display labels are owned by the frontend
(`@radial-pulse/utils` labels, typed `Record<ContractEnum, string>`).

All of the above run against contract-based MSW mocks
(`packages/api-client/src/mocks`, `apiMocking: true` in local config).

## Built on the contract (Phase 6, mobile — Clinic Administrator)

| Area             | Operations                                                                                            | Screen                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Session / access | `GET /auth/me`, `GET /clinics`                                                                        | Sign-in, "use the web portal" / no-access gates, clinic switcher       |
| Assessments      | `GET …/assessments` (published only for clinic users), `GET …/assessments/{id}`                       | Home, Insights (overview + six components), Reports, assessment detail |
| Connections      | `GET …/connections`, `GET …/connections/{platform}`, `POST …/start`, `…/complete`, `…/disconnect`     | Connect Your Accounts, Social Media, connection detail                 |
| Clinic           | `GET/PATCH /clinics/{id}`, `ClinicListItem.dsm` / `primary_practitioner_name`                         | Profile, Clinic information (edit with `clinics:write`)                |
| Chat             | `GET /chat/inbox`, `GET/POST …/chat/messages`, `POST …/chat/read`, assets upload/confirm/download-url | Chat modal and floating button badge                                   |

Not built (outside V1 or not in the contract): posts/reels, follower and
engagement metrics, rating bands ("Good") and trends, activity feed, bell /
notifications, password and security settings, help & support, Team
management, approvals, work items. The Clinic Team Member portal is future
scope.

## Backend gaps — each blocks only the screens listed

| #   | Gap                                                                                                                                                                                                               | Blocked screen / behaviour                                                                                                                                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | No allowed actions on an approval or assessment (`available_actions`); transitions live only in backend code                                                                                                      | Unified Audit: submit / approve / reject / publish buttons                                                                                                                                                                                                                                  |
| 2   | Stage groups (Prospects / In progress / Active) exist only in the dashboard counts, backend code and the `stage` filter note; the list has no group field                                                         | Web shows a clinic **status** from one exhaustive stage-to-group table in `@radial-pulse/utils` (`clinicStatus`), plus Inactive for archived clinics; a published group field or enum would replace it                                                                                      |
| 3   | No cross-clinic assessments list                                                                                                                                                                                  | Audit Reports page                                                                                                                                                                                                                                                                          |
| 4   | No cross-clinic work-item list (dashboard has counts only)                                                                                                                                                        | DSM work-queue list on the dashboard                                                                                                                                                                                                                                                        |
| 5   | No recent activity, highlights, tile deltas or period filter in `DashboardSummary`                                                                                                                                | Platform Administrator dashboard: no % change or "Last 30 days"; Recent activity and Key highlights are built from the clinics list instead (gap 18)                                                                                                                                        |
| 6   | Social metrics are free-form `metric_key` snapshots with an untyped `value`; no catalog of keys, labels or units                                                                                                  | Web Social Media and mobile Social Media show the latest snapshots, labelling known keys (`instagram.followers`…) and showing others by key; mocks use sample keys until the catalogue is published                                                                                         |
| 7   | No social posts endpoint                                                                                                                                                                                          | Mobile Social Media Detail posts/reels                                                                                                                                                                                                                                                      |
| 8   | Enum labels: codes only (except `ConnectionRead.label`)                                                                                                                                                           | Resolved on the frontend; confirm ownership                                                                                                                                                                                                                                                 |
| 9   | Contract not yet released on GitHub (`v0.1.0`), repo name for `BACKEND_REPO`                                                                                                                                      | `pnpm api:sync`                                                                                                                                                                                                                                                                             |
| 10  | Backend docs say "no fake login anywhere"; the frontend's persona sign-in works only against MSW mocks and is refused in prod                                                                                     | Confirm acceptable for mock development                                                                                                                                                                                                                                                     |
| 11  | `MeResponse.clinics` is empty for `all_clinics` users, so a Platform Administrator's per-clinic permissions are unknown                                                                                           | Admins see every clinic section; the API remains the authority                                                                                                                                                                                                                              |
| 12  | `ChatMessageRead` has only `attachment_asset_id`; no filename/type and no single-asset GET                                                                                                                        | Chat shows "Open attachment" without the file name                                                                                                                                                                                                                                          |
| 13  | `ClinicRead` lacks `dsm` and `primary_practitioner_name` (the list item has them)                                                                                                                                 | Clinic overview resolves the DSM name via `GET /users` (admins) or "You" (the DSM); mobile reads the list item                                                                                                                                                                              |
| 14  | `ComponentDetail.status_reason` is a backend code (e.g. `no_engine_deployed`) with no published list or display text                                                                                              | Never shown; screens explain the component from its `status`                                                                                                                                                                                                                                |
| 15  | No clinic-facing activity feed; notification categories are internal workflows only                                                                                                                               | Mobile Home "Recent activity" and bell (omitted)                                                                                                                                                                                                                                            |
| 16  | No export/download of an assessment (report files under `/reports` exist but V1 Reports = published assessments)                                                                                                  | Mobile Reports download button (omitted); `reportsService` kept in the API layer                                                                                                                                                                                                            |
| 17  | No total-clinics-by-month series (only `new_clinics_by_month`, 6 months)                                                                                                                                          | Platform Administrator "Clinic growth trend" works totals back from `total_clinics`; archived clinics can make earlier months read slightly low                                                                                                                                             |
| 18  | No cross-clinic activity feed or highlight figures; the dashboard derives them from `GET /clinics` rows (`created_at`, `stage`, `stage_changed_at`, `website_url`, `unassigned` total), at most 200 rows per list | Recent activity shows only "added" and stage moves (no enrichment, assignment or report events); Key highlights show new prospects this month, prospects with a website and clinics without a DSM (no Google Business Profile or social coverage); website share hidden above 200 prospects |
| 19  | `AuditEventRead.action` is a backend code (`clinic.stage_change`…) with no published list or display text                                                                                                         | Clinic Activity words known codes and falls back to the code for others                                                                                                                                                                                                                     |

## Other dependencies

1. **Authenticated API access in development:** the gateway needs a Cognito
   access token (Phase 7). Until then only the MSW mocks can be used.
2. **Dev environment:** the dev API base URL for `config.json`, and backend
   `CORS_ALLOWED_ORIGINS` including `http://localhost:4200` (its example lists
   5173 and 8081).
3. **Auth library:** decided — Amplify Auth (`signInWithRedirect`, ADR 0006) on
   web and mobile, Phase 7. Mobile then needs an Expo development build
   (Amplify's native modules do not run in Expo Go).
4. **Tooling:** `pnpm api:sync` needs the GitHub CLI (`gh`, authenticated).
5. **Mobile Connect redirect:** the app's `<scheme>://connect/callback` (per
   environment: `radialpulse-local`, `radialpulse-dev`, `radialpulse`) must be
   on the backend's `OAUTH_REDIRECT_URIS`, and the mobile scheme on Cognito's
   allowed callback URLs (Phase 7).
6. **Platform brand marks:** Lucide has no brand logos; connected platforms use
   neutral icons beside their names until official marks are supplied.

## Agreed workflow

1. Backend publishes a versioned OpenAPI 3.x contract (tagged release).
2. Frontend syncs it (`pnpm api:sync --version <x.y.z>`) in its own reviewed PR.
3. Types are generated; domain aliases are added over the generated schemas.
4. Services and React Query hooks are implemented from the generated types.
5. MSW mocks exist **only** for operations in the published contract.
6. The UI is built against those mocks (`apiMocking: true`, never in prod).
7. Each screen switches to the real API as its endpoints become available; the
   mock is then removed.
