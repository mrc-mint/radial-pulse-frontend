import type { components, Schema } from '@radial-pulse/shared-types';
import { clinicPhotoSvg, mockPractitioners, mockSnapshots } from './extras';
import { mockClinicMedia } from './media';
import { MOCK_PERSONAS } from './personas';

/**
 * DEV/TEST ONLY. In-memory data for the MSW mocks. Every record is typed by a
 * generated contract schema and uses only contract enum values; nothing here
 * adds a field the contract doesn't have. `createMockDb()` returns a fresh,
 * mutable copy so mutations persist for a session and tests stay isolated.
 */

type S<K extends keyof components['schemas']> = Schema<K>;

const NOW = Date.parse('2026-09-27T09:30:00Z');
export const mockNow = () => new Date(NOW).toISOString();
let tick = 0;
/** Strictly increasing timestamps for records created during a mock session. */
export const nextTimestamp = () =>
  new Date(Math.max(Date.now(), NOW) + ++tick * 1000).toISOString();
const ago = (days: number, hours = 0) =>
  new Date(NOW - days * 86_400_000 - hours * 3_600_000).toISOString();
const uuid = (prefix: string, n: number) =>
  `${prefix.padEnd(8, '0')}-0000-4000-8000-${String(n).padStart(12, '0')}`;

const ORG = uuid('0f', 1);

// ── People ──────────────────────────────────────────────────────────────────

interface MockUser extends S<'UserListItem'> {
  personaId?: string;
}

function user(
  n: number,
  full_name: string,
  email: string,
  platform_role: S<'PlatformRole'>,
  status: S<'UserStatus'> = 'active',
  lastLoginDays: number | null = 1,
): MockUser {
  return {
    id: uuid('a1', n),
    full_name,
    email,
    phone: null,
    platform_role,
    status,
    is_active: status !== 'deactivated',
    created_at: ago(200 - n),
    last_invited_at: status === 'invited' ? ago(2) : ago(190 - n),
    last_login_at: lastLoginDays === null ? null : ago(lastLoginDays, n),
    assigned_clinic_count: 0,
  };
}

// ── Clinics ─────────────────────────────────────────────────────────────────

interface ClinicSeed {
  name: string;
  doctor: string;
  city: string;
  state: string;
  specialty: string;
  site: string | null;
  stage: S<'ClinicStage'>;
  dsm: number | null;
  lat: number;
  lng: number;
  /** Archived (inactive, e.g. the clinic said no): the required archive reason. */
  archived?: string;
  createdDaysAgo?: number;
}

const CLINICS: ClinicSeed[] = [
  {
    name: 'Smile Dental Care',
    doctor: 'Dr. Rahul Mehta',
    city: 'Kakinada',
    state: 'Andhra Pradesh',
    specialty: 'General Dentistry, Implants',
    site: 'https://www.smiledentalcare.in',
    stage: 'active_client',
    dsm: 2,
    lat: 16.9891,
    lng: 82.2475,
  },
  {
    name: 'Bright Smile Clinic',
    doctor: 'Dr. Neha Gupta',
    city: 'Bengaluru',
    state: 'Karnataka',
    specialty: 'Cosmetic Dentistry',
    site: 'https://www.brightsmile.in',
    stage: 'client_discussion',
    dsm: 3,
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    name: 'CarePlus Dental',
    doctor: 'Dr. Suresh Reddy',
    city: 'Hyderabad',
    state: 'Telangana',
    specialty: 'Orthodontics',
    site: 'https://www.careplusdental.com',
    stage: 'assessment_completed',
    dsm: 4,
    lat: 17.385,
    lng: 78.4867,
  },
  {
    name: 'Elite Dental Clinic',
    doctor: 'Dr. Kavya Sharma',
    city: 'Pune',
    state: 'Maharashtra',
    specialty: 'Endodontics',
    site: 'https://www.elitedental.in',
    stage: 'active_client',
    dsm: 5,
    lat: 18.5204,
    lng: 73.8567,
  },
  {
    name: 'Happy Teeth',
    doctor: 'Dr. Anil Kumar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    specialty: 'Paediatric Dentistry',
    site: 'https://www.happyteeth.in',
    stage: 'profile_enriched',
    dsm: 2,
    lat: 13.0827,
    lng: 80.2707,
  },
  {
    name: 'Dental Health Hub',
    doctor: 'Dr. Meera Nair',
    city: 'Kochi',
    state: 'Kerala',
    specialty: 'Periodontics',
    site: 'https://www.dentalhub.in',
    stage: 'active_client',
    dsm: 6,
    lat: 9.9312,
    lng: 76.2673,
  },
  {
    name: 'Smile Care Plus',
    doctor: 'Dr. Vikram Singh',
    city: 'Jaipur',
    state: 'Rajasthan',
    specialty: 'Prosthodontics',
    site: 'https://www.smilecareplus.com',
    stage: 'assessment_completed',
    dsm: 4,
    lat: 26.9124,
    lng: 75.7873,
  },
  {
    name: 'Family Dental Clinic',
    doctor: 'Dr. Pooja Shah',
    city: 'Ahmedabad',
    state: 'Gujarat',
    specialty: 'Family Dentistry',
    site: 'https://www.familydental.in',
    stage: 'active_client',
    dsm: 2,
    lat: 23.0225,
    lng: 72.5714,
  },
  {
    name: 'Advanced Dental',
    doctor: 'Dr. Rakesh Menon',
    city: 'Mysuru',
    state: 'Karnataka',
    specialty: 'Oral Surgery',
    site: 'https://www.advanceddental.in',
    stage: 'prospective_client',
    dsm: null,
    lat: 12.2958,
    lng: 76.6394,
  },
  {
    name: 'City Dental Care',
    doctor: 'Dr. Nisha Rao',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    specialty: 'General Dentistry',
    site: 'https://www.citydental.in',
    stage: 'client_discussion',
    dsm: 2,
    lat: 17.6868,
    lng: 83.2185,
  },
  {
    name: 'Pearl Dental Studio',
    doctor: 'Dr. Farah Khan',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    specialty: 'Cosmetic Dentistry',
    site: null,
    stage: 'prospective_client',
    dsm: null,
    lat: 26.8467,
    lng: 80.9462,
  },
  {
    name: 'Sunrise Orthodontics',
    doctor: 'Dr. Arvind Joshi',
    city: 'Indore',
    state: 'Madhya Pradesh',
    specialty: 'Orthodontics',
    site: 'https://www.sunriseortho.in',
    stage: 'profile_enriched',
    dsm: 3,
    lat: 22.7196,
    lng: 75.8577,
  },
  // Inactive (archived) clinics: out of the active totals, counted as `archived`.
  {
    name: 'Lotus Dental Studio',
    doctor: 'Dr. Meera Nair',
    city: 'Chennai',
    state: 'Tamil Nadu',
    specialty: 'General Dentistry',
    site: null,
    stage: 'prospective_client',
    dsm: null,
    lat: 13.0827,
    lng: 80.2707,
    archived: 'Not interested in digital marketing services right now.',
    createdDaysAgo: 120,
  },
  {
    name: 'Sunrise Dental Care',
    doctor: 'Dr. Vikram Rao',
    city: 'Kochi',
    state: 'Kerala',
    specialty: 'Pediatric Dentistry',
    site: 'https://www.sunrisedentalcare.in',
    stage: 'client_discussion',
    dsm: 4,
    lat: 9.9312,
    lng: 76.2673,
    archived: 'Chose to continue with their current agency.',
    createdDaysAgo: 75,
  },
];

export interface MockDb {
  users: MockUser[];
  clinics: Array<S<'ClinicRead'> & { primary_practitioner_name: string }>;
  /** clinicId → active DSM user id. */
  assignments: Map<string, S<'AssignmentRead'>>;
  /** clinicId → clinic user id → clinic role (Clinic Administrator persona). */
  memberships: Map<string, Map<string, S<'ClinicRole'>>>;
  assessments: Array<S<'AssessmentDetail'>>;
  presence: Array<S<'PresenceProfileRead'>>;
  workItems: Array<S<'WorkItemRead'>>;
  connections: Map<string, Array<S<'ConnectionRead'>>>;
  messages: Array<S<'ChatMessageRead'>>;
  /** userId → clinicId → last read message timestamp. */
  chatReads: Map<string, Map<string, string>>;
  assets: Map<string, S<'AssetRead'> & { blob?: Blob }>;
  approvals: Array<S<'ApprovalRead'>>;
  practitioners: Array<S<'PractitionerRead'>>;
  snapshots: Array<S<'MetricSnapshotRead'>>;
  auditEvents: Array<S<'AuditEventRead'>>;
  settings: S<'PlatformSettingsRead'>;
}

// ── Assessments ─────────────────────────────────────────────────────────────

const ENGINE = (key: S<'AssessmentComponentKey'>) => `${key.replace(/_/g, '-')}-engine`;

function component(
  key: S<'AssessmentComponentKey'>,
  status: S<'ComponentStatus'>,
  score: number | null,
  summary: string | null,
  findings: Array<S<'FindingRead'>> = [],
  computedDaysAgo = 1,
): S<'ComponentDetail'> {
  const done = status === 'completed' || status === 'failed';
  return {
    key,
    status,
    score: status === 'completed' ? score : null,
    summary,
    status_reason:
      status === 'not_available'
        ? 'no_engine_deployed'
        : status === 'failed'
          ? 'source_unreachable'
          : null,
    engine_name: status === 'not_available' ? null : ENGINE(key),
    engine_version: status === 'not_available' ? null : '0.1.0',
    computed_at: done ? ago(computedDaysAgo) : null,
    findings,
  };
}

let findingSeq = 0;
function finding(
  code: string,
  priority: S<'FindingPriority'>,
  title: string,
  description: string,
  recommendation: string,
  evidence: Array<S<'EvidenceRead'>>,
): S<'FindingRead'> {
  findingSeq += 1;
  return {
    id: uuid('f1', findingSeq),
    code,
    priority,
    title,
    description,
    recommendation,
    evidence,
    created_at: ago(1),
  };
}

function detailedComponents(
  site: string | null,
  clinicName: string,
  /** False keeps Social Presence `not_available` (no engine yet), as in production today. */
  socialAvailable = true,
): S<'ComponentDetail'>[] {
  const host = site ?? 'https://www.google.com/maps';
  return [
    component(
      'website',
      'completed',
      72,
      'The site is mobile-friendly but slow on 4G and lacks online booking.',
      [
        finding(
          'website.lcp_slow',
          'high',
          'Pages load slowly on mobile networks',
          'The home page takes 5.8 s to show its main content on a typical 4G connection.',
          'Compress the hero images and enable caching so the main content appears in under 2.5 s.',
          [
            {
              source_url: site ?? undefined,
              excerpt: 'Largest Contentful Paint: 5.8 s (mobile, simulated 4G)',
              provider: 'Website crawl',
              observed_at: ago(1, 3),
            },
          ],
        ),
        finding(
          'website.no_booking',
          'medium',
          'No online appointment booking',
          'Patients can only book by phone during clinic hours.',
          'Add a booking form or link to your booking provider on every page.',
          [
            {
              source_url: `${host}/contact`,
              excerpt: 'Call us to book: +91 98765 43210',
              provider: 'Website crawl',
              observed_at: ago(1, 3),
            },
          ],
        ),
      ],
    ),
    component(
      'google_business_profile',
      'completed',
      64,
      'The profile is verified but opening hours differ from the website.',
      [
        finding(
          'gbp.hours_mismatch',
          'critical',
          'Opening hours differ between the website and Google',
          `${clinicName} shows Sunday as open on Google, but the website says the clinic is closed on Sundays.`,
          'Update the Sunday hours on Google Business Profile so patients are not turned away.',
          [
            {
              source_url: `${host}/contact`,
              excerpt: 'Mon–Sat 9:00–19:00 · Sunday closed',
              provider: 'Website crawl',
              observed_at: ago(1, 4),
            },
            {
              source_url: 'https://www.google.com/maps',
              excerpt: 'Sunday: 10:00–14:00',
              provider: 'Google Business Profile',
              observed_at: ago(1, 4),
            },
          ],
        ),
        finding(
          'gbp.few_photos',
          'low',
          'Few recent photos on the profile',
          'Only 4 photos were added in the last 12 months.',
          'Upload photos of the clinic, team and equipment every month.',
          [
            {
              source_url: 'https://www.google.com/maps',
              excerpt: '4 photos in the last 12 months',
              provider: 'Google Business Profile',
              observed_at: ago(1, 4),
            },
          ],
        ),
      ],
    ),
    component(
      'local_search',
      'completed',
      58,
      'Listed in the top 10 for 3 of 8 tracked local searches.',
      [
        finding(
          'local.low_rank_core_term',
          'high',
          'Not in the top 10 for "dentist near me"',
          'The clinic ranks 14th within 3 km for its most valuable search term.',
          'Collect more recent reviews and add service pages for your main treatments.',
          [
            {
              excerpt: 'Rank 14 for "dentist near me" (3 km grid, median)',
              provider: 'Local rank tracker',
              observed_at: ago(2),
            },
          ],
        ),
      ],
    ),
    component(
      'search_readiness',
      'completed',
      49,
      'Covers SEO, AEO and GEO: basic SEO is in place; answer-engine readiness is weak.',
      [
        finding(
          'search.no_faq_schema',
          'medium',
          'No structured answers for common patient questions',
          'AI assistants and answer engines find no FAQ content for treatments offered.',
          'Publish short FAQ sections for your top treatments with FAQ structured data.',
          [
            {
              source_url: site ?? undefined,
              excerpt: 'No FAQPage structured data found on 12 crawled pages',
              provider: 'Website crawl',
              observed_at: ago(1, 2),
            },
          ],
        ),
        finding(
          'search.meta_missing',
          'info',
          'Some pages have no meta description',
          '5 of 12 pages have no meta description.',
          'Write a unique one-sentence description for each page.',
          [],
        ),
      ],
    ),
    socialAvailable
      ? component(
          'social_presence',
          'completed',
          71,
          'Active on Instagram; Facebook and YouTube are posted to less often.',
          [
            finding(
              'social.irregular_posting',
              'medium',
              'Facebook posts are irregular',
              'The Facebook page had 9 posts in the last 30 days, with gaps of up to 12 days.',
              'Post at least twice a week; reuse your Instagram posts on Facebook.',
              [
                {
                  source_url: 'https://www.facebook.com',
                  excerpt: '9 posts in 30 days · longest gap 12 days',
                  provider: 'Facebook',
                  observed_at: ago(1, 6),
                },
              ],
            ),
            finding(
              'social.no_reviews_prompt',
              'low',
              'Posts never ask patients for reviews',
              'None of the last 20 Instagram posts link to the Google review page.',
              'Add a review link to your bio and mention it in one post each month.',
              [
                {
                  source_url: 'https://www.instagram.com',
                  excerpt: '0 of 20 recent posts mention reviews',
                  provider: 'Instagram',
                  observed_at: ago(1, 6),
                },
              ],
            ),
          ],
        )
      : component('social_presence', 'not_available', null, null),
    component(
      'competitor_benchmark',
      'completed',
      66,
      'Compared with 5 nearby clinics offering similar treatments.',
    ),
  ];
}

function assessment(
  clinicId: string,
  sequence: number,
  n: number,
  opts: {
    status: S<'AssessmentStatus'>;
    approval: S<'ApprovalState'>;
    publication: S<'PublicationState'>;
    createdDaysAgo: number;
    components: S<'ComponentDetail'>[];
    overall: number | null;
    summary: string | null;
  },
): S<'AssessmentDetail'> {
  const finished =
    opts.status === 'completed' || opts.status === 'partial' || opts.status === 'failed';
  return {
    id: uuid('e1', n),
    clinic_id: clinicId,
    sequence,
    status: opts.status,
    approval_state: opts.approval,
    publication_state: opts.publication,
    methodology_version: '2026.09',
    overall_score: opts.overall,
    summary: opts.summary,
    requested_by_user_id: MOCK_PERSONAS[1]!.userId,
    created_at: ago(opts.createdDaysAgo),
    started_at: opts.status === 'queued' ? null : ago(opts.createdDaysAgo, -1),
    completed_at: finished ? ago(opts.createdDaysAgo - 1) : null,
    published_at:
      opts.publication === 'published' ? ago(Math.max(0, opts.createdDaysAgo - 3)) : null,
    components: opts.components,
  };
}

// ── Activity ────────────────────────────────────────────────────────────────

let eventSeq = 0;
function event(
  clinicId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  at: string,
  actor: string | null,
  details: Record<string, unknown> = {},
): S<'AuditEventRead'> {
  eventSeq += 1;
  return {
    id: uuid('ev', eventSeq),
    clinic_id: clinicId,
    actor_type: actor ? 'user' : 'service',
    actor_user_id: actor,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    request_id: null,
    occurred_at: at,
  };
}

/** A believable history per clinic, derived from the other mock records (newest first). */
function buildAuditEvents(
  clinics: MockDb['clinics'],
  assignments: MockDb['assignments'],
  presence: MockDb['presence'],
  assessments: MockDb['assessments'],
  connections: MockDb['connections'],
): Array<S<'AuditEventRead'>> {
  eventSeq = 0;
  const admin = uuid('a1', 1);
  const clinicAdmin = uuid('a1', 101);
  const plusHours = (iso: string, hours: number) =>
    new Date(Date.parse(iso) + hours * 3_600_000).toISOString();
  const events = clinics.flatMap((c) => {
    const dsm = assignments.get(c.id)?.user_id ?? null;
    const rows = [event(c.id, 'clinic.create', 'clinic', c.id, c.created_at, admin)];
    if (dsm) {
      rows.push(
        event(c.id, 'assignment.change', 'assignment', c.id, plusHours(c.created_at, 20), admin, {
          user_id: dsm,
        }),
      );
    }
    for (const profile of presence.filter((x) => x.clinic_id === c.id && x.verified_by_user_id)) {
      rows.push(
        event(
          c.id,
          'presence_profile.update',
          'presence_profile',
          profile.id,
          profile.updated_at,
          dsm,
          {
            platform: profile.platform,
            verification: profile.verification,
          },
        ),
      );
    }
    for (const a of assessments.filter((x) => x.clinic_id === c.id && x.completed_at)) {
      rows.push(event(c.id, 'assessment.generated', 'assessment', a.id, a.completed_at!, null));
    }
    for (const x of connections.get(c.id) ?? []) {
      if (x.connected_at) {
        rows.push(
          event(
            c.id,
            'connection.connected',
            'connection',
            x.platform,
            x.connected_at,
            clinicAdmin,
            {
              platform: x.platform,
            },
          ),
        );
      }
    }
    if (Date.parse(c.stage_changed_at) > Date.parse(c.created_at) + 60_000) {
      rows.push(
        event(c.id, 'clinic.stage_change', 'clinic', c.id, c.stage_changed_at, dsm ?? admin, {
          to: c.stage,
        }),
      );
    }
    if (!c.is_active) {
      rows.push(
        event(c.id, 'clinic.archive', 'clinic', c.id, c.updated_at, dsm ?? admin, {
          reason: c.archived_reason,
        }),
      );
    }
    return rows;
  });
  return events.sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
}

// ── Build ───────────────────────────────────────────────────────────────────

export function createMockDb(): MockDb {
  findingSeq = 0;
  const users: MockUser[] = [
    user(
      1,
      'Rohan Agarwal',
      'rohan.agarwal@radialpulse.example',
      'platform_administrator',
      'active',
      0,
    ),
    user(2, 'Priya Shah', 'priya.shah@radialpulse.example', 'digital_success_manager', 'active', 0),
    user(3, 'Amit Kumar', 'amit.kumar@radialpulse.example', 'digital_success_manager'),
    user(4, 'Sneha Iyer', 'sneha.iyer@radialpulse.example', 'digital_success_manager'),
    user(
      5,
      'Rahul Verma',
      'rahul.verma@radialpulse.example',
      'digital_success_manager',
      'active',
      3,
    ),
    user(6, 'Arjun Patel', 'arjun.patel@radialpulse.example', 'digital_success_manager'),
    user(
      7,
      'Neha Singh',
      'neha.singh@radialpulse.example',
      'digital_success_manager',
      'invited',
      null,
    ),
    user(
      8,
      'Kiran Desai',
      'kiran.desai@radialpulse.example',
      'digital_success_manager',
      'deactivated',
      40,
    ),
    user(101, 'Dr. Rahul Mehta', 'rahul.mehta@smiledentalcare.in', 'clinic_user'),
  ];

  const clinics = CLINICS.map((c, i) => {
    const createdDays = c.createdDaysAgo ?? 160 - i * 14;
    // A new clinic starts as a prospective client; later stages were reached
    // after creation.
    const stageDays =
      c.stage === 'prospective_client' ? createdDays : Math.min(5 + i * 3, createdDays - 1);
    return {
      id: uuid('c1', i + 1),
      organization_id: ORG,
      name: c.name,
      primary_practitioner_name: c.doctor,
      specialty: c.specialty,
      description: `${c.specialty} for families in ${c.city}.`,
      website_url: c.site,
      email: c.site ? `info@${new URL(c.site).hostname.replace(/^www\./, '')}` : null,
      phone: `+91 98${String(76543210 + i * 1111).slice(0, 8)}`,
      address_line: `${12 + i * 7}, Main Road`,
      city: c.city,
      state: c.state,
      postal_code: String(500001 + i * 713).slice(0, 6),
      country: 'IN',
      latitude: c.lat,
      longitude: c.lng,
      stage: c.stage,
      stage_changed_at: ago(stageDays),
      is_active: !c.archived,
      archived_reason: c.archived ?? null,
      cover_asset_id: uuid('ph', i + 1),
      created_at: ago(createdDays),
      updated_at: ago(Math.min(1 + i, stageDays)),
    };
  });

  const assignments = new Map<string, S<'AssignmentRead'>>();
  CLINICS.forEach((c, i) => {
    if (c.dsm === null) return;
    const clinicId = clinics[i]!.id;
    assignments.set(clinicId, {
      id: uuid('ad', i + 1),
      clinic_id: clinicId,
      user_id: uuid('a1', c.dsm),
      assigned_by_user_id: uuid('a1', 1),
      is_active: true,
      created_at: ago(90 - i),
      updated_at: ago(90 - i),
    });
  });
  for (const u of users) {
    u.assigned_clinic_count = [...assignments.values()].filter((a) => a.user_id === u.id).length;
  }

  // Dr. Rahul Mehta administers two clinics (multi-clinic Clinic Administrator).
  const memberships = new Map<string, Map<string, S<'ClinicRole'>>>([
    [clinics[0]!.id, new Map([[uuid('a1', 101), 'clinic_administrator' as const]])],
    [clinics[7]!.id, new Map([[uuid('a1', 101), 'clinic_administrator' as const]])],
  ]);

  const smile = clinics[0]!;
  const assessments: Array<S<'AssessmentDetail'>> = [
    assessment(smile.id, 3, 1, {
      status: 'partial',
      approval: 'submitted',
      publication: 'unpublished',
      createdDaysAgo: 2,
      components: detailedComponents(smile.website_url, smile.name, false),
      overall: 62,
      summary:
        'Strong foundations on the website and Google profile. Fixing the opening-hours mismatch and page speed will have the biggest impact.',
    }),
    assessment(smile.id, 2, 2, {
      status: 'partial',
      approval: 'approved',
      publication: 'published',
      createdDaysAgo: 34,
      components: detailedComponents(smile.website_url, smile.name).map((c) =>
        c.status === 'completed' && c.score !== null ? { ...c, score: c.score - 6 } : c,
      ),
      overall: 56,
      summary: 'Good website basics; the Google profile needs attention.',
    }),
    assessment(smile.id, 1, 3, {
      status: 'failed',
      approval: 'draft',
      publication: 'unpublished',
      createdDaysAgo: 64,
      components: detailedComponents(smile.website_url, smile.name).map((c) => ({
        ...c,
        status: c.status === 'not_available' ? c.status : ('failed' as const),
        score: null,
        findings: [],
        summary: null,
        status_reason: c.status === 'not_available' ? c.status_reason : 'source_unreachable',
      })),
      overall: null,
      summary: null,
    }),
  ];
  clinics.slice(1).forEach((c, i) => {
    if (c.stage === 'prospective_client') return;
    const running = c.stage === 'profile_enriched';
    assessments.push(
      assessment(c.id, 1, 10 + i, {
        status: running ? 'running' : 'partial',
        approval: running ? 'draft' : c.stage === 'active_client' ? 'approved' : 'submitted',
        publication: c.stage === 'active_client' ? 'published' : 'unpublished',
        createdDaysAgo: 4 + i * 2,
        components: running
          ? detailedComponents(c.website_url, c.name).map((d) => ({
              ...d,
              status: d.status === 'not_available' ? d.status : ('pending' as const),
              score: null,
              findings: [],
              summary: null,
              computed_at: null,
            }))
          : detailedComponents(c.website_url, c.name),
        overall: running ? null : 55 + ((i * 7) % 20),
        summary: running ? null : 'Assessment completed across five components.',
      }),
    );
  });

  let profileSeq = 0;
  const presence: Array<S<'PresenceProfileRead'>> = clinics.flatMap((c) => {
    const handle = c.name.toLowerCase().replace(/[^a-z]/g, '');
    const rows: Array<
      [S<'PresencePlatform'>, string, S<'PresenceVerification'>, number | null, string]
    > = [
      ['website', c.website_url ?? `https://${handle}.in`, 'confirmed', null, 'Onboarding form'],
      [
        'google_business_profile',
        `https://maps.google.com/?cid=${1000 + profileSeq}`,
        'confirmed',
        0.97,
        'Google Places match',
      ],
      ['instagram', `https://www.instagram.com/${handle}/`, 'unverified', 0.82, 'Website link'],
      [
        'facebook',
        `https://www.facebook.com/${handle}`,
        'unverified',
        0.64,
        'Name and phone match',
      ],
      [
        'practo',
        `https://www.practo.com/${c.city?.toLowerCase()}/clinic/${handle}`,
        'rejected',
        0.41,
        'Directory search',
      ],
      [
        'justdial',
        `https://www.justdial.com/${c.city}/${handle}`,
        'unverified',
        0.58,
        'Directory search',
      ],
    ];
    return rows.map(([platform, url, verification, confidence, discovered_by]) => {
      profileSeq += 1;
      return {
        id: uuid('d1', profileSeq),
        clinic_id: c.id,
        platform,
        url,
        display_name: platform === 'website' ? c.name : `${c.name} (${platform})`,
        external_id: null,
        verification,
        confidence,
        discovered_by,
        verified_by_user_id: verification === 'unverified' ? null : uuid('a1', 2),
        evidence:
          confidence === null
            ? []
            : [
                {
                  source_url: c.website_url,
                  excerpt: `Matched "${c.name}" and phone ${c.phone}`,
                  provider: discovered_by,
                  observed_at: ago(6),
                },
              ],
        created_at: ago(20),
        updated_at: ago(3),
      };
    });
  });

  let workSeq = 0;
  const workItems: Array<S<'WorkItemRead'>> = clinics.flatMap((c, i) => {
    if (c.stage === 'prospective_client') return [];
    const rows: Array<
      [string, S<'WorkArea'>, S<'WorkItemPriority'>, S<'WorkItemStatus'>, string | null]
    > = [
      [
        'Fix Sunday opening hours on Google',
        'google_business_profile',
        'urgent',
        i % 3 === 0 ? 'todo' : 'in_progress',
        'gbp.hours_mismatch',
      ],
      ['Compress home page images', 'website', 'high', 'todo', 'website.lcp_slow'],
      [
        'Add FAQ sections for top treatments',
        'search_readiness',
        'normal',
        i % 2 ? 'in_review' : 'todo',
        'search.no_faq_schema',
      ],
      [
        'Collect 10 new Google reviews',
        'local_search',
        'normal',
        'done',
        'local.low_rank_core_term',
      ],
    ];
    return rows.map(([title, area, priority, status, finding_code]) => {
      workSeq += 1;
      return {
        id: uuid('b1', workSeq),
        clinic_id: c.id,
        title,
        description: null,
        area,
        priority,
        status,
        kind: 'fix_now',
        finding_code,
        source_finding_id: null,
        source_team: 'digital-presence',
        approval_id: null,
        owner_user_id: assignments.get(c.id)?.user_id ?? null,
        created_by_user_id: uuid('a1', 2),
        due_at: ago(-7 - workSeq),
        completed_at: status === 'done' ? ago(2) : null,
        created_at: ago(10),
        updated_at: ago(1),
      };
    });
  });

  const PLATFORMS: Array<[S<'ConnectionPlatform'>, string]> = [
    ['google_business_profile', 'Google Business Profile'],
    ['instagram', 'Instagram'],
    ['facebook', 'Facebook'],
    ['youtube', 'YouTube'],
    ['linkedin', 'LinkedIn'],
    ['x', 'X'],
  ];
  const connections = new Map(
    clinics.map((c, i) => [
      c.id,
      PLATFORMS.map(([platform, label], j): S<'ConnectionRead'> => {
        const status: S<'ConnectionStatus'> =
          i % 4 === 2
            ? 'not_connected'
            : j === 0 || j === 1 || (j === 3 && i % 2 === 1)
              ? 'connected'
              : j === 2
                ? 'needs_reconnect'
                : 'not_connected';
        const connected = status === 'connected' || status === 'needs_reconnect';
        return {
          platform,
          label,
          available: j < 4,
          status,
          external_account_name: connected ? c.name : null,
          connected_at: connected ? ago(40) : null,
          connected_by_user_id: connected ? uuid('a1', 101) : null,
          last_synced_at: status === 'connected' ? ago(0, 3) : connected ? ago(9) : null,
          last_error: status === 'needs_reconnect' ? 'The access token has expired.' : null,
          scopes: connected ? ['read_insights'] : [],
          token_expires_at: connected ? ago(-20) : null,
        };
      }),
    ]),
  );

  const doctor = users.find((u) => u.id === uuid('a1', 101))!;
  const priya = users.find((u) => u.id === uuid('a1', 2))!;
  const attachmentId = uuid('aa', 1);
  const assets = new Map<string, S<'AssetRead'> & { blob?: Blob }>([
    [
      attachmentId,
      {
        id: attachmentId,
        clinic_id: smile.id,
        kind: 'chat_attachment',
        mime_type: 'application/pdf',
        original_filename: 'clinic-timings.pdf',
        size_bytes: 48_213,
        status: 'uploaded',
        approval_state: 'draft',
        owner_user_id: doctor.id,
        previous_version_id: null,
        provenance: {},
        version: 1,
        created_at: ago(1, 5),
        updated_at: ago(1, 5),
      },
    ],
  ]);
  // Sample clinic photos (drawn), one per clinic, served by the mock storage.
  clinics.forEach((c, i) => {
    const id = uuid('ph', i + 1);
    const svg = clinicPhotoSvg(i);
    assets.set(id, {
      id,
      clinic_id: c.id,
      kind: 'clinic_photo',
      mime_type: 'image/svg+xml',
      original_filename: 'reception.svg',
      size_bytes: svg.length,
      status: 'uploaded',
      approval_state: 'approved',
      owner_user_id: uuid('a1', 1),
      previous_version_id: null,
      provenance: {},
      version: 1,
      created_at: c.created_at,
      updated_at: c.created_at,
      blob: new Blob([svg], { type: 'image/svg+xml' }),
    });
  });

  // Sample media with approvals for each clinic Dr. Rahul Mehta administers.
  const approvals: Array<S<'ApprovalRead'>> = [];
  [clinics[0]!, clinics[7]!].forEach((c, i) => {
    const media = mockClinicMedia(
      c.id,
      doctor.id,
      priya.id,
      (n, kind) => uuid(`${kind === 'asset' ? 'md' : 'ap'}${i}`, n),
      (days) => ago(days),
    );
    for (const a of media.assets) assets.set(a.id, a);
    approvals.push(...media.approvals);
  });

  const practitioners = mockPractitioners(clinics, (n) => uuid('b2', n));

  let snapshotSeq = 0;
  const snapshots = clinics.flatMap((c, i) => {
    const linked = (connections.get(c.id) ?? [])
      .filter((x) => x.status === 'connected' || x.status === 'needs_reconnect')
      .map((x) => x.platform as string);
    const rows = mockSnapshots(c.id, i, linked, (n) => uuid('d5', n), ago, snapshotSeq);
    snapshotSeq += rows.length;
    return rows;
  });

  const auditEvents = buildAuditEvents(clinics, assignments, presence, assessments, connections);

  const chat = (
    n: number,
    clinicId: string,
    who: MockUser,
    side: S<'ChatSide'>,
    body: string | null,
    at: string,
    attachment: string | null = null,
  ): S<'ChatMessageRead'> => ({
    id: uuid('ab', n),
    clinic_id: clinicId,
    sender_user_id: who.id,
    sender_name: who.full_name ?? who.email,
    sender_side: side,
    body,
    attachment_asset_id: attachment,
    created_at: at,
  });
  const messages = [
    chat(
      1,
      smile.id,
      priya,
      'radial_pulse',
      'Hello Dr. Mehta, your latest assessment is ready for review. I will walk you through it once it is published.',
      ago(3, 6),
    ),
    chat(
      2,
      smile.id,
      doctor,
      'clinic',
      'Thank you Priya. Could you also check why our Sunday timings look wrong on Google?',
      ago(3, 4),
    ),
    chat(
      3,
      smile.id,
      priya,
      'radial_pulse',
      'Yes, that is one of the critical findings. We have added a task to fix it this week.',
      ago(2, 20),
    ),
    chat(
      4,
      smile.id,
      doctor,
      'clinic',
      'Great. I have attached our current clinic timings.',
      ago(1, 5),
      attachmentId,
    ),
    chat(5, smile.id, doctor, 'clinic', 'Please use these for the website as well.', ago(1, 5)),
    chat(
      6,
      clinics[7]!.id,
      priya,
      'radial_pulse',
      'Hi Dr. Shah, the new photos are live on your Google profile.',
      ago(4),
    ),
    chat(
      7,
      clinics[7]!.id,
      users.find((u) => u.id === uuid('a1', 101))!,
      'clinic',
      'Looks good, thank you!',
      ago(3, 22),
    ),
  ];
  const chatReads = new Map([
    [
      priya.id,
      new Map([
        [smile.id, ago(2, 20)],
        [clinics[7]!.id, ago(3, 22)],
      ]),
    ],
  ]);

  return {
    users,
    clinics,
    assignments,
    memberships,
    assessments,
    presence,
    workItems,
    connections,
    messages,
    chatReads,
    assets,
    approvals,
    practitioners,
    snapshots,
    auditEvents,
    settings: {
      organization_name: 'Radial Pulse',
      support_email: 'support@radialpulse.example',
      support_phone: '+91 40 4000 1234',
      timezone: 'Asia/Kolkata',
      date_format: 'DD MMM YYYY',
      updated_at: ago(12),
    },
  };
}
