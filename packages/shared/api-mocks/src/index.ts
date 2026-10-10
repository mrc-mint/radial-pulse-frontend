/**
 * @radial-pulse/api-mocks — MSW handlers (dev/test only).
 *
 * Rules (see ./README.md):
 *   - A mock may exist only for an endpoint that is in the published contract.
 *   - Enabled only when AppConfig.apiMocking is true, which createConfig()
 *     rejects in prod.
 *   - Data is typed by the generated contract; no invented fields or enums.
 *
 * Import this entry dynamically (only when mocking) so it never ships in a
 * production bundle.
 */
export { createMockHandlers } from './handlers';
export { createMockFetch } from './in-process';
export type { MockOptions } from './handlers';
export { createMockDb } from './data';
export type { MockDb } from './data';
export { MOCK_PERSONAS, MOCK_TOKEN_PREFIX, PERSONA_IDS } from './personas';
export type { MockPersona, PersonaId } from './personas';

/** Contract operations with a mock handler (kept in sync with README.md). */
export const mockedEndpoints: ReadonlyArray<{ operation: string; contractVersion: string }> = [
  'GET /api/v1/auth/me',
  'GET /api/v1/dashboard/summary',
  'GET /api/v1/clinics',
  'POST /api/v1/clinics',
  'GET /api/v1/clinics/{clinic_id}',
  'PATCH /api/v1/clinics/{clinic_id}',
  'POST /api/v1/clinics/{clinic_id}/stage',
  'POST /api/v1/clinics/{clinic_id}/archive',
  'POST /api/v1/clinics/{clinic_id}/restore',
  'GET /api/v1/clinics/{clinic_id}/practitioners',
  'GET /api/v1/clinics/{clinic_id}/snapshots',
  'GET /api/v1/clinics/{clinic_id}/audit-events',
  'GET /api/v1/clinics/{clinic_id}/assignments',
  'PUT /api/v1/clinics/{clinic_id}/assignment',
  'GET /api/v1/users',
  'POST /api/v1/users',
  'POST /api/v1/users/{user_id}/resend-invite',
  'GET /api/v1/clinics/{clinic_id}/presence-profiles',
  'PATCH /api/v1/clinics/{clinic_id}/presence-profiles/{profile_id}',
  'GET /api/v1/clinics/{clinic_id}/assessments',
  'POST /api/v1/clinics/{clinic_id}/assessments',
  'GET /api/v1/clinics/{clinic_id}/assessments/{assessment_id}',
  'GET /api/v1/clinics/{clinic_id}/work-items',
  'GET /api/v1/clinics/{clinic_id}/connections',
  'GET /api/v1/clinics/{clinic_id}/connections/{platform}',
  'POST /api/v1/clinics/{clinic_id}/connections/{platform}/start',
  'POST /api/v1/clinics/{clinic_id}/connections/{platform}/complete',
  'POST /api/v1/clinics/{clinic_id}/connections/{platform}/disconnect',
  'GET /api/v1/chat/inbox',
  'GET /api/v1/clinics/{clinic_id}/chat/messages',
  'POST /api/v1/clinics/{clinic_id}/chat/messages',
  'POST /api/v1/clinics/{clinic_id}/chat/read',
  'GET /api/v1/media/taxonomy',
  'GET /api/v1/clinics/{clinic_id}/assets',
  'GET /api/v1/clinics/{clinic_id}/assets/{asset_id}',
  'POST /api/v1/clinics/{clinic_id}/assets/uploads',
  'POST /api/v1/clinics/{clinic_id}/assets/{asset_id}/confirm',
  'GET /api/v1/clinics/{clinic_id}/assets/{asset_id}/download-url',
  'GET /api/v1/clinics/{clinic_id}/approvals',
  'GET /api/v1/clinics/{clinic_id}/approvals/{approval_id}',
  'POST /api/v1/clinics/{clinic_id}/approvals/actions',
  'GET /api/v1/settings/platform',
  'PATCH /api/v1/settings/platform',
  'GET /health',
].map((operation) => ({ operation, contractVersion: '0.3.0' }));
