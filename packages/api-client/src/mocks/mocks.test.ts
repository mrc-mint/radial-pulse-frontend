import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ApiRequestError } from '../errors';
import { createApiClient } from '../http';
import {
  assessmentsService,
  auditEventsService,
  authService,
  chatService,
  clinicProfileService,
  clinicsService,
  connectionsService,
  practitionersService,
  snapshotsService,
} from '../services';
import { createMockDb } from './data';
import { createMockHandlers } from './handlers';
import { MOCK_TOKEN_PREFIX, type PersonaId } from './personas';

const baseUrl = 'https://api.test.radialpulse.example';
let db = createMockDb();
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function as(persona: PersonaId | null) {
  db = createMockDb();
  server.use(...createMockHandlers({ baseUrl, db }));
  return createApiClient({
    baseUrl,
    auth: {
      getAccessToken: async () => (persona ? `${MOCK_TOKEN_PREFIX}${persona}` : null),
      onUnauthorized: () => {},
    },
  });
}

describe('contract mocks', () => {
  it('rejects requests without a sign-in', async () => {
    const api = as(null);
    await expect(authService.me(api)).rejects.toMatchObject({ kind: 'unauthorized' });
  });

  it('describes a Platform Administrator as all-clinics', async () => {
    const me = await authService.me(as('platform-administrator'));
    expect(me.platform_role).toBe('platform_administrator');
    expect(me.all_clinics).toBe(true);
    expect(me.clinics).toEqual([]);
    expect(me.permissions).toContain('users:manage');
  });

  it('scopes a Digital Success Manager to assigned clinics', async () => {
    const api = as('digital-success-manager');
    const me = await authService.me(api);
    const list = await clinicsService.list(api, {});
    expect(me.all_clinics).toBe(false);
    expect(list.items.map((c) => c.id).sort()).toEqual(me.clinics.map((c) => c.clinic_id).sort());
    expect(list.items.every((c) => c.dsm?.full_name === 'Priya Shah')).toBe(true);
  });

  it('answers 404 for a clinic outside the caller’s access', async () => {
    const api = as('digital-success-manager');
    const other = db.clinics.find((c) => db.assignments.get(c.id)?.user_id !== db.users[1]!.id)!;
    const error = await clinicsService.get(api, other.id).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect((error as ApiRequestError).kind).toBe('not_found');
  });

  it('shows Clinic Administrators published assessments only', async () => {
    const admin = as('clinic-administrator');
    const smile = db.clinics[0]!.id;
    const forClinic = await assessmentsService.list(admin, smile);
    expect(forClinic.items.map((a) => a.publication_state)).toEqual(['published']);

    const staff = as('digital-success-manager');
    const all = await assessmentsService.list(staff, smile);
    expect(all.items.map((a) => a.sequence)).toEqual([3, 2, 1]);
  });

  it('keeps unavailable components unscored', async () => {
    const api = as('digital-success-manager');
    const smile = db.clinics[0]!.id;
    const [latest] = (await assessmentsService.list(api, smile)).items;
    const detail = await assessmentsService.get(api, smile, latest!.id);
    const social = detail.components.find((c) => c.key === 'social_presence');
    expect(social).toMatchObject({ status: 'not_available', score: null });
  });

  it('pages chat for polling with an `after` cursor', async () => {
    const api = as('digital-success-manager');
    const smile = db.clinics[0]!.id;
    const first = await chatService.messages(api, smile, {});
    const newest = first.items.at(-1)!;
    expect(await chatService.messages(api, smile, { after: newest.id })).toMatchObject({
      items: [],
    });

    await chatService.send(api, smile, { body: 'Following up on the Google hours.' });
    const next = await chatService.messages(api, smile, { after: newest.id });
    expect(next.items.map((m) => m.body)).toEqual(['Following up on the Google hours.']);
  });

  it('connects an account with a one-time state, then disconnects it', async () => {
    const admin = as('clinic-administrator');
    const smile = db.clinics[0]!.id;
    const redirect_uri = 'radialpulse-local://connect/callback';
    const started = await connectionsService.start(admin, smile, 'youtube', { redirect_uri });
    const state = new URL(started.authorization_url).searchParams.get('state')!;
    expect((await connectionsService.get(admin, smile, 'youtube')).status).toBe('pending');

    const done = await connectionsService.complete(admin, smile, 'youtube', { code: 'x', state });
    expect(done).toMatchObject({ status: 'connected', external_account_name: 'Smile Dental Care' });
    const replay = (await connectionsService
      .complete(admin, smile, 'youtube', { code: 'x', state })
      .catch((e: unknown) => e)) as ApiRequestError;
    expect(replay.kind).toBe('conflict');

    const off = await connectionsService.disconnect(admin, smile, 'youtube');
    expect(off.status).toBe('disconnected');
  });

  it('refuses to start a platform the server has not set up', async () => {
    const admin = as('clinic-administrator');
    const error = (await connectionsService
      .start(admin, db.clinics[0]!.id, 'x', { redirect_uri: 'radialpulse-local://cb' })
      .catch((e: unknown) => e)) as ApiRequestError;
    expect(error.kind).toBe('unavailable');
  });

  it('archives, restores and moves a clinic, recording each in its activity', async () => {
    const api = as('platform-administrator');
    const clinic = db.clinics[1]!;
    await clinicsService.changeStage(api, clinic.id, { stage: 'active_client' });
    const archived = await clinicsService.archive(api, clinic.id, { reason: 'Said no for now' });
    expect(archived).toMatchObject({ is_active: false, archived_reason: 'Said no for now' });
    const stageWhileArchived = (await clinicsService
      .changeStage(api, clinic.id, { stage: 'prospective_client' })
      .catch((e: unknown) => e)) as ApiRequestError;
    expect(stageWhileArchived.kind).toBe('conflict');
    expect((await clinicsService.restore(api, clinic.id)).is_active).toBe(true);

    const events = await auditEventsService.list(api, clinic.id, { limit: 3 });
    expect(events.items.map((e) => e.action)).toEqual([
      'clinic.restore',
      'clinic.archive',
      'clinic.stage_change',
    ]);
  });

  it('serves the main practitioner and the latest value of each metric', async () => {
    const admin = as('clinic-administrator');
    const smile = db.clinics[0]!.id;
    const practitioners = await practitionersService.list(admin, smile);
    expect(practitioners.items[0]).toMatchObject({
      full_name: 'Dr. Rahul Mehta',
      is_primary: true,
    });

    const latest = await snapshotsService.list(admin, smile, { latest: true, limit: 200 });
    const keys = latest.items.map((s) => `${s.source}|${s.metric_key}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain('instagram|instagram.followers');
  });

  it('returns problem+json validation issues', async () => {
    const api = as('platform-administrator');
    const error = (await clinicsService
      .create(api, { name: ' ' })
      .catch((e: unknown) => e)) as ApiRequestError;
    expect(error.kind).toBe('validation');
    expect(error.fieldErrors).toEqual({ name: ['Field required'] });
  });
  describe('Practitioner Profile (PUT /profile)', () => {
    it('reads the profile with its structured consultation, fee, address and services', async () => {
      const admin = as('clinic-administrator');
      const profile = await clinicProfileService.get(admin, db.clinics[0]!.id);
      expect(profile.practitioner_profile).toMatchObject({
        full_name: 'Dr. Rahul Mehta',
        clinic_name: 'Smile Dental Care',
        clinic_address: { country: 'IN' },
        weekly_holiday: ['sun'],
        consultation_fee: { amount_minor: 50000, currency: 'INR' },
      });
      expect(profile.practitioner_profile.consultation_schedule?.days?.mon).toHaveLength(2);
      expect(profile.practitioner_profile.services[0]).toEqual({
        name: 'Braces',
        category: 'Orthodontics',
        description: null,
      });
    });

    it('applies a partial update, leaves other fields alone and bumps the version', async () => {
      const admin = as('clinic-administrator');
      const smile = db.clinics[0]!.id;
      const before = await clinicProfileService.get(admin, smile);
      const after = await clinicProfileService.update(admin, smile, {
        version: before.version,
        practitioner_profile: {
          years_of_experience: 15,
          qualifications: null,
          consultation_fee: { amount_minor: 75000, currency: 'INR' },
          weekly_holiday: ['sat', 'sun'],
        },
      });
      expect(after.version).toBe(before.version + 1);
      expect(after.practitioner_profile).toEqual({
        ...before.practitioner_profile,
        years_of_experience: 15,
        qualifications: null,
        consultation_fee: { amount_minor: 75000, currency: 'INR' },
        weekly_holiday: ['sat', 'sun'],
      });
    });

    it('answers 409 for a stale version', async () => {
      const admin = as('clinic-administrator');
      const smile = db.clinics[0]!.id;
      const { version } = await clinicProfileService.get(admin, smile);
      await clinicProfileService.update(admin, smile, {
        version,
        practitioner_profile: { patients_treated: 13000 },
      });
      const error = (await clinicProfileService
        .update(admin, smile, { version, practitioner_profile: { patients_treated: 14000 } })
        .catch((e: unknown) => e)) as ApiRequestError;
      expect(error.kind).toBe('conflict');
    });

    it('answers 422 with field paths for overlapping windows', async () => {
      const admin = as('clinic-administrator');
      const smile = db.clinics[0]!.id;
      const { version } = await clinicProfileService.get(admin, smile);
      const error = (await clinicProfileService
        .update(admin, smile, {
          version,
          practitioner_profile: {
            consultation_schedule: {
              days: {
                mon: [
                  { opens: '09:00', closes: '13:00' },
                  { opens: '12:00', closes: '15:00' },
                ],
              },
            },
          },
        })
        .catch((e: unknown) => e)) as ApiRequestError;
      expect(error.kind).toBe('validation');
      expect(error.fieldErrors).toEqual({
        'practitioner_profile.consultation_schedule.days.mon': [
          'Consultation windows must not overlap',
        ],
      });
    });
  });
});
