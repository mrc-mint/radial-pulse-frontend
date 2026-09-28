import type { Schema } from '@radial-pulse/shared-types';
import { FINDING_PRIORITY_LABELS } from '@radial-pulse/utils';
import type { FindingCardBaseProps } from './contracts';
import { FINDING_PRIORITY_TONES } from './tones';

type Finding = Schema<'FindingRead'>;
type FindingPriority = Schema<'FindingPriority'>;

/**
 * FindingCard props for a contract finding: title, description, backend
 * recommendation and evidence rendered as-is, priority labelled and toned
 * from the contract value. Shared by web and native.
 */
export function findingCardProps(finding: Finding): FindingCardBaseProps {
  return {
    title: finding.title,
    description: finding.description ?? undefined,
    recommendation: finding.recommendation ?? undefined,
    priority: {
      label: FINDING_PRIORITY_LABELS[finding.priority],
      tone: FINDING_PRIORITY_TONES[finding.priority],
    },
    evidence: finding.evidence.map((e) => ({
      sourceUrl: e.source_url ?? undefined,
      excerpt: e.excerpt ?? undefined,
      provider: e.provider,
      observedAt: e.observed_at,
    })),
  };
}

/** Display order of the contract's priorities, most urgent first (exhaustive). */
const PRIORITY_RANK: Readonly<Record<FindingPriority, number>> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

/**
 * Orders findings by their backend priority for display ("key findings").
 * Stable, so findings of equal priority keep the API's order. Nothing is
 * scored or re-prioritised here.
 */
export function sortByPriority<T extends Pick<Finding, 'priority'>>(
  findings: ReadonlyArray<T>,
): T[] {
  return [...findings].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}
