/**
 * Display names for social metric snapshots (`MetricSnapshotRead.metric_key`,
 * dotted `<source>.<metric>`, e.g. `instagram.followers`). The API has no
 * published metric catalogue yet (contract gap 6), so known metric names are
 * labelled here and anything else is shown from its key. Values are shown as
 * the API sent them; nothing is recalculated.
 */
const METRIC_NAMES: Readonly<Record<string, { label: string; percent?: boolean }>> = {
  followers: { label: 'Followers' },
  subscribers: { label: 'Subscribers' },
  engagement_rate: { label: 'Engagement rate', percent: true },
  posts_30d: { label: 'Posts (30 days)' },
  reach_30d: { label: 'Reach (30 days)' },
  views_30d: { label: 'Views (30 days)' },
  videos_30d: { label: 'Videos (30 days)' },
};

function metricName(key: string): string {
  const dot = key.indexOf('.');
  return dot === -1 ? key : key.slice(dot + 1);
}

/** "Followers" for `instagram.followers`; an unknown key reads as words ("page likes"). */
export function metricLabel(key: string): string {
  const name = metricName(key);
  const known = METRIC_NAMES[name];
  if (known) return known.label;
  const words = name.replace(/[_.]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** The API's number for display: grouped digits, or a percentage for rates. */
export function formatMetric(key: string, value: number | null | undefined): string {
  if (value === null || value === undefined) return 'Not Available';
  if (METRIC_NAMES[metricName(key)]?.percent) return `${value.toLocaleString()}%`;
  return value.toLocaleString();
}

/** Order of the headline metrics on a platform card (others follow). */
export const METRIC_ORDER = [
  'followers',
  'subscribers',
  'engagement_rate',
  'reach_30d',
  'views_30d',
  'posts_30d',
  'videos_30d',
];

export function metricRank(key: string): number {
  const i = METRIC_ORDER.indexOf(metricName(key));
  return i === -1 ? METRIC_ORDER.length : i;
}
