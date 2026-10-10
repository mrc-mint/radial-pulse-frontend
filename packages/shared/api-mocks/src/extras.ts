import type { Schema } from '@radial-pulse/shared-types';

/**
 * DEV/TEST ONLY. Extra mock records for UI prototyping: clinic photos,
 * practitioners, social metric snapshots and activity (audit) events. Every
 * record is a contract schema (`Schema<…>`); values are sample data.
 */

const PALETTES = [
  { wall: '#e8f1fb', accent: '#2152d6', wood: '#c89b6d', plant: '#2f8f5b' },
  { wall: '#eef7f1', accent: '#039855', wood: '#b88a5a', plant: '#2b7a4b' },
  { wall: '#fdf3e7', accent: '#dc6803', wood: '#a67c52', plant: '#3a8a55' },
  { wall: '#f1eefb', accent: '#5925dc', wood: '#c29a70', plant: '#2f8f5b' },
] as const;

/**
 * A drawn "photo" of a clinic reception (SVG), varied per clinic. Stands in
 * for the real `clinic_photo` asset until clinics upload their own.
 */
export function clinicPhotoSvg(seed: number): string {
  const p = PALETTES[seed % PALETTES.length]!;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" width="480" height="320">
  <defs>
    <linearGradient id="light-${seed}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${p.wall}"/>
    </linearGradient>
    <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bfdcf5"/><stop offset="1" stop-color="#e9f4fd"/>
    </linearGradient>
  </defs>
  <rect width="480" height="320" fill="url(#light-${seed})"/>
  <rect y="236" width="480" height="84" fill="#e4e1dc"/>
  <path d="M0 236 L480 236" stroke="#d3cec6" stroke-width="3"/>
  <rect x="36" y="44" width="150" height="150" rx="6" fill="url(#sky-${seed})" stroke="#ffffff" stroke-width="8"/>
  <path d="M111 44 V194 M36 119 H186" stroke="#ffffff" stroke-width="6"/>
  <rect x="226" y="58" width="96" height="62" rx="6" fill="${p.accent}" opacity="0.14"/>
  <circle cx="274" cy="89" r="17" fill="none" stroke="${p.accent}" stroke-width="5"/>
  <circle cx="274" cy="89" r="6" fill="${p.accent}"/>
  <rect x="216" y="176" width="200" height="66" rx="10" fill="${p.wood}"/>
  <rect x="216" y="170" width="200" height="14" rx="6" fill="#f6f1ea"/>
  <rect x="236" y="196" width="160" height="6" rx="3" fill="#ffffff" opacity="0.35"/>
  <rect x="300" y="138" width="52" height="34" rx="4" fill="#2a2f3a"/>
  <rect x="322" y="170" width="8" height="8" fill="#2a2f3a"/>
  <rect x="60" y="214" width="96" height="30" rx="8" fill="${p.accent}" opacity="0.85"/>
  <rect x="60" y="196" width="96" height="22" rx="8" fill="${p.accent}"/>
  <rect x="64" y="244" width="6" height="18" fill="#6b7280"/>
  <rect x="146" y="244" width="6" height="18" fill="#6b7280"/>
  <rect x="432" y="206" width="30" height="36" rx="4" fill="#d9d3ca"/>
  <path d="M447 206 C430 170 418 176 427 150 C440 168 446 160 447 128 C452 160 460 166 468 148 C474 176 462 172 447 206Z" fill="${p.plant}"/>
  <rect x="0" y="0" width="480" height="320" fill="#000" opacity="0.03"/>
</svg>`;
}

// ── Practitioners ───────────────────────────────────────────────────────────

const QUALIFICATIONS = ['BDS, MDS', 'BDS', 'BDS, MDS (Orthodontics)', 'BDS, FAGE'];

export function mockPractitioners(
  clinics: ReadonlyArray<{
    id: string;
    primary_practitioner_name: string;
    specialty: string | null;
    created_at: string;
  }>,
  id: (n: number) => string,
): Array<Schema<'PractitionerRead'>> {
  return clinics.map((c, i) => ({
    id: id(i + 1),
    clinic_id: c.id,
    user_id: null,
    full_name: c.primary_practitioner_name,
    specialty: c.specialty,
    qualifications: QUALIFICATIONS[i % QUALIFICATIONS.length]!,
    registration_number: `DCI-${48210 + i * 37}`,
    bio: null,
    years_of_experience: 8 + ((i * 5) % 17),
    patients_treated: i % 3 === 2 ? null : 4000 + i * 1500,
    professional_highlights:
      i === 0
        ? 'Invisalign-certified provider. Speaker at the Indian Dental Conference 2024.'
        : null,
    is_primary: true,
    is_active: true,
    // Two consultation windows on weekdays, mornings only on Saturday, Sunday off.
    consultation_schedule:
      i % 3 === 2
        ? null
        : {
            timezone: 'Asia/Kolkata',
            days: {
              ...Object.fromEntries(
                (['mon', 'tue', 'wed', 'thu', 'fri'] as const).map((d) => [d, WEEKDAY_WINDOWS]),
              ),
              sat: [{ opens: '09:30', closes: '13:00' }],
            },
            notes: i === 0 ? 'By appointment on public holidays.' : null,
          },
    weekly_holiday: i % 3 === 2 ? [] : ['sun'],
    consultation_fee: i % 3 === 2 ? null : { amount_minor: 50000 + i * 10000, currency: 'INR' },
    created_at: c.created_at,
  }));
}

const WEEKDAY_WINDOWS = [
  { opens: '09:30', closes: '13:00' },
  { opens: '17:00', closes: '20:00' },
];

// ── Social metric snapshots ─────────────────────────────────────────────────

/**
 * Sample social metrics per connected platform. Keys follow the backend's
 * dotted convention (`instagram.followers`); the real catalogue is not
 * published yet (contract gap 6).
 */
const METRICS: Record<
  'instagram' | 'facebook' | 'youtube' | 'linkedin',
  Array<[metric: string, base: number]>
> = {
  instagram: [
    ['followers', 5432],
    ['engagement_rate', 4.8],
    ['posts_30d', 18],
    ['reach_30d', 12400],
  ],
  facebook: [
    ['followers', 2341],
    ['engagement_rate', 2.1],
    ['posts_30d', 9],
    ['reach_30d', 6800],
  ],
  youtube: [
    ['subscribers', 1120],
    ['views_30d', 3900],
    ['videos_30d', 2],
  ],
  linkedin: [
    ['followers', 892],
    ['posts_30d', 4],
  ],
};

type Source = keyof typeof METRICS;

export function mockSnapshots(
  clinicId: string,
  clinicIndex: number,
  connected: ReadonlyArray<string>,
  id: (n: number) => string,
  at: (daysAgo: number) => string,
  startSeq: number,
): Array<Schema<'MetricSnapshotRead'>> {
  let seq = startSeq;
  const scale = 0.55 + ((clinicIndex * 37) % 90) / 100;
  return (Object.keys(METRICS) as Source[])
    .filter((source) => connected.includes(source))
    .flatMap((source) =>
      METRICS[source].flatMap(([metric, base]) =>
        // Two readings: 30 days ago and today.
        [30, 0].map((daysAgo) => {
          const growth = daysAgo === 0 ? 1 : 0.9;
          const raw = base * scale * growth;
          const value = metric === 'engagement_rate' ? Math.round(raw * 10) / 10 : Math.round(raw);
          seq += 1;
          return {
            id: id(seq),
            clinic_id: clinicId,
            source,
            metric_key: `${source}.${metric}`,
            value: { value },
            value_number: value,
            status: 'ok',
            error_code: null,
            error_message: null,
            retry_count: 0,
            next_retry_at: null,
            schema_version: 1,
            fetched_at: at(daysAgo),
            created_at: at(daysAgo),
          } satisfies Schema<'MetricSnapshotRead'>;
        }),
      ),
    );
}
