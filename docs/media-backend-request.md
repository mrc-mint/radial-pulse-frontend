# Clinic media: backend and DevOps request

Feature: Clinic Media & Voice Samples (V1). Clinic Administrators upload
doctor photos, hospital photos and voice samples in the mobile app. Platform
Administrators and Digital Success Managers review them on the web (approve,
request a retake / re-record, reject). Staff never upload, replace or delete
clinic media. Practitioner logins and a Clinic Team Member portal are future
scope.

The frontend is built on contract 0.1.0 and its mocks. This page lists what
the contract cannot express yet. Nothing below is invented in the frontend:
until each item ships, the screens fall back as described.

## What the contract already supports (used as is)

| Need              | Contract                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------- |
| Media types       | `AssetKind`: `practitioner_photo`, `clinic_photo`, `logo`, `audio`                          |
| Upload            | `POST …/assets/uploads` (pre-signed PUT), then `POST …/assets/{id}/confirm`                 |
| Replace           | `AssetUploadRequest.previous_version_id`; `AssetRead.version`, `previous_version_id`        |
| List              | `GET …/assets?kind=` (max 200 per page)                                                     |
| View / play       | `GET …/assets/{id}/download-url` → `{ url, expires_in }`                                    |
| Review status     | `AssetRead.approval_state` (`draft`, `submitted`, `approved`, `rejected`, `redo_requested`) |
| Review actions    | `POST …/approvals/actions` (`approve`, `reject`, `redo`, with `comment`)                    |
| Reviewer note     | `ApprovalRead.last_comment`                                                                 |
| Cover photo       | `ClinicRead.cover_asset_id` (Logo & cover photo row)                                        |
| Main practitioner | `PractitionerRead.is_primary` (Profile header)                                              |

## Requests

### 1. Category / slot metadata (gap 20) — blocks the slot layout

The product reference has fixed slots:

- **Doctor photos:** outfits, each **with apron** or **without apron**, and
  five angles per outfit: **90° L, 45° L, 0°, 45° R, 90° R**.
- **Hospital photos:** **Exterior & signage**, **Reception & waiting**,
  **Consult & procedure rooms**, **Equipment & facilities**, **Team at work**
  (target 3 each), **Logo & cover photo** (2).

Please add to `AssetUploadRequest` and `AssetRead` (all nullable):

| Field            | Type                                                                                                            | For                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------- | -------------------- |
| `photo_category` | enum `exterior_signage`, `reception_waiting`, `consult_procedure_rooms`, `equipment_facilities`, `team_at_work` | `clinic_photo`       |
| `photo_attire`   | enum `with_apron`, `without_apron`                                                                              | `practitioner_photo` |
| `photo_angle`    | enum `left_90`, `left_45`, `front`, `right_45`, `right_90`                                                      | `practitioner_photo` |
| `outfit_number`  | integer ≥ 1                                                                                                     | `practitioner_photo` |

Plus list filters for each, and a rule for what a second upload into a filled
slot means (we suggest: it must be a replace, `previous_version_id` set).
The enum values above are a suggestion; the frontend adopts whatever is
published. Until then uploads are stored with their kind only and appear under
"Uploaded photos — not yet matched / sorted".

### 2. Practitioner link (gap 21)

`practitioner_id` (nullable uuid) on `AssetUploadRequest`, `AssetRead` and as
a list filter, for doctor photos and voice samples. V1 always uses the main
practitioner (`is_primary`); the field keeps multiple practitioners possible
later without changing the media model.

### 3. Approval link (gap 22)

- Publish the `resource_type` value(s) used for files (the mocks use `asset`).
- Add `resource_type` and `resource_id` filters to `GET …/approvals`.
- Define when review starts: does `confirm` open a `submitted` approval for
  `clinic_photo`, `practitioner_photo`, `logo` and `audio`? (The mocks do
  this; Clinic Administrators should not need `approvals:submit`.)
- Can a Clinic Administrator read approvals (for `last_comment`), and with
  which permission?

### 4. Allowed actions (gap 23, same as gap 1)

`available_actions: ApprovalAction[]` on `ApprovalRead` (or `AssetRead`),
computed for the caller. The web shows exactly those buttons. Until then it
offers approve / request retake / reject when the caller has
`approvals:decide` and the file is `submitted`; the API decides.

### 5. Role permissions (gap 24) — security boundary

V1 rule: Clinic Administrators upload but never review; staff review but
never upload clinic media. Current role grants (as mirrored in the mocks)
give Clinic Administrators `approvals:decide` and Digital Success Managers
`assets:upload`. Please:

- remove `approvals:decide` from the Clinic Administrator role (the mocks
  already do), and
- stop staff uploading or replacing `clinic_photo`, `practitioner_photo`,
  `logo` and `audio`. `assets:upload` is also used for chat attachments, so
  this needs a per-kind rule or a separate permission (e.g. `media:upload`).

The UI already follows the rule (web has no upload code; mobile has no review
code), but only the API can enforce it.

### 6. Versions and replace (gap 25)

- Does `GET …/assets` return replaced versions? The frontend hides any file
  that another listed file names as `previous_version_id`. A `current_only`
  filter (or `is_current`) would be cleaner.
- Does a replacement restart review (new `submitted` approval)? We assume yes.
- No delete operation exists, so the UI has no remove (×) control. If the
  product wants Clinic Administrators to remove a photo, please add
  `DELETE …/assets/{id}` (status `deleted`) for the uploader only.

### 7. File limits (gap 26)

Publish allowed MIME types and maximum size per kind (the avatar upload
documents JPEG / PNG / WebP, 5 MB). Suggested: photos JPEG / PNG / HEIC /
WebP up to 15 MB; audio MP3 / M4A / WAV up to 25 MB. Return 422 with field
errors when exceeded.

### 8. Thumbnails (gap 28, optional)

A thumbnail URL (or `?variant=thumb` on download-url) so grids do not load
full-size photos.

## DevOps: protected media (gap 27)

The browser cannot stop a permitted viewer from capturing a file. The UI
only removes the casual routes (no download button or link, no context menu,
no drag-out, no visible URL). Real protection is here:

1. **Private bucket:** S3 Block Public Access on; no public ACLs or bucket
   policy grants; no `ListBucket` for clients.
2. **Short-lived pre-signed GET URLs:** 5 minutes or less (`expires_in` in the
   response), issued only after the API checks clinic access and
   `assets:read`. Clinic Administrators only for their own clinics.
3. **Headers on GET:** `Cache-Control: private, no-store`,
   `Content-Disposition: inline` (no `attachment`), correct `Content-Type`,
   `X-Content-Type-Options: nosniff`.
4. **No CDN caching** of protected objects unless signed (CloudFront signed
   URLs with the same lifetime).
5. **CORS:** GET and PUT only from the app origins.
6. **Object keys:** not guessable (UUIDs), never containing names or emails.
7. **Logging:** S3 server access or CloudTrail data events on the bucket.
8. **Uploads:** pre-signed PUT bound to the declared `Content-Type` and size;
   `confirm` verifies the object (already in the contract).

The frontend keeps URLs in memory only (TanStack Query, dropped 30 seconds
after the last screen using it closes) and never in storage or logs.
