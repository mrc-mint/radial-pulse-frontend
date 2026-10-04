import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApiClient } from '../http';
import { approvalsService, assetsService, uploadAsset } from '../services';
import { createMockDb } from './data';
import { createMockHandlers } from './handlers';
import { MOCK_TOKEN_PREFIX, type PersonaId } from './personas';

const baseUrl = 'https://api.test.radialpulse.example';
let db = createMockDb();
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function reset(options: { inlineMedia?: boolean } = {}) {
  db = createMockDb();
  server.use(...createMockHandlers({ baseUrl, db, ...options }));
}

function as(persona: PersonaId) {
  return createApiClient({
    baseUrl,
    auth: {
      getAccessToken: async () => `${MOCK_TOKEN_PREFIX}${persona}`,
      onUnauthorized: () => {},
    },
  });
}

const smile = () => db.clinics[0]!.id;
const photo = () => ({
  data: new Blob(['jpeg bytes'], { type: 'image/jpeg' }),
  name: 'doctor-front.jpg',
});

async function awaitingReview(persona: PersonaId) {
  const items = (await assetsService.list(as(persona), smile(), { kind: 'audio' })).items;
  return items.find((a) => a.approval_state === 'submitted')!;
}

describe('clinic media against the contract mocks', () => {
  it('lets a Clinic Administrator upload a doctor photo, which goes to review', async () => {
    reset();
    const admin = as('clinic-administrator');
    const asset = await uploadAsset(admin, smile(), { kind: 'practitioner_photo', file: photo() });

    expect(asset).toMatchObject({ status: 'uploaded', approval_state: 'submitted', version: 1 });
    const listed = await assetsService.list(admin, smile(), { kind: 'practitioner_photo' });
    expect(listed.items.map((a) => a.id)).toContain(asset.id);
    const approvals = await approvalsService.list(as('digital-success-manager'), smile());
    expect(approvals.items.find((a) => a.resource_id === asset.id)?.state).toBe('submitted');
  });

  it('replaces a file as its next version', async () => {
    reset();
    const admin = as('clinic-administrator');
    const first = await uploadAsset(admin, smile(), { kind: 'audio', file: photo() });
    const second = await uploadAsset(admin, smile(), {
      kind: 'audio',
      file: photo(),
      previousVersionId: first.id,
    });
    expect(second).toMatchObject({ version: 2, previous_version_id: first.id });
  });

  it('never lets a Clinic Administrator approve media', async () => {
    reset();
    const sample = await awaitingReview('clinic-administrator');
    const error = await approvalsService
      .applyAction(as('clinic-administrator'), smile(), {
        resource_type: 'asset',
        resource_id: sample.id,
        action: 'approve',
      })
      .catch((e: unknown) => e);
    expect(error).toMatchObject({ kind: 'forbidden' });
  });

  it.each(['digital-success-manager', 'platform-administrator'] as const)(
    'lets a %s approve a file awaiting review, once',
    async (persona) => {
      reset();
      const reviewer = as(persona);
      const sample = await awaitingReview(persona);
      const approval = await approvalsService.applyAction(reviewer, smile(), {
        resource_type: 'asset',
        resource_id: sample.id,
        action: 'approve',
        comment: 'Clear and quiet.',
      });
      expect(approval).toMatchObject({ state: 'approved', last_comment: 'Clear and quiet.' });
      const after = await assetsService.list(reviewer, smile(), { kind: 'audio' });
      expect(after.items.find((a) => a.id === sample.id)?.approval_state).toBe('approved');

      const again = await approvalsService
        .applyAction(reviewer, smile(), {
          resource_type: 'asset',
          resource_id: sample.id,
          action: 'approve',
        })
        .catch((e: unknown) => e);
      expect(again).toMatchObject({ kind: 'conflict' });
    },
  );

  it('hides another clinic’s media: 404 for the list and the download URL', async () => {
    reset();
    const dsm = as('digital-success-manager');
    const unassigned = db.clinics.find(
      (c) => db.assignments.get(c.id)?.user_id !== db.users[1]!.id,
    )!;
    await expect(assetsService.list(dsm, unassigned.id)).rejects.toMatchObject({
      kind: 'not_found',
    });
    const foreign = [...db.assets.values()].find((a) => a.clinic_id === db.clinics[7]!.id)!;
    await expect(
      assetsService.downloadUrl(as('clinic-administrator'), smile(), foreign.id),
    ).rejects.toMatchObject({ kind: 'not_found' });
  });

  it('serves media through a short-lived URL, inline for React Native', async () => {
    reset({ inlineMedia: true });
    const sample = await awaitingReview('digital-success-manager');
    const link = await assetsService.downloadUrl(as('digital-success-manager'), smile(), sample.id);
    expect(link.expires_in).toBeLessThanOrEqual(300);
    expect(link.url.startsWith('data:audio/wav;base64,')).toBe(true);
  });
});
