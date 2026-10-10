import type { Schema } from '@radial-pulse/shared-types';
import { describe, expect, it } from 'vitest';
import { findingCardProps, sortByPriority } from './findings';

const finding: Schema<'FindingRead'> = {
  id: 'f1',
  code: 'gbp.hours_mismatch',
  title: 'Opening hours differ',
  description: null,
  recommendation: 'Update Google hours.',
  priority: 'high',
  created_at: '2026-09-01T00:00:00Z',
  evidence: [
    {
      source_url: 'https://maps.google.com/x',
      excerpt: null,
      provider: 'google_business_profile',
      observed_at: '2026-09-01T00:00:00Z',
    },
  ],
};

describe('findingCardProps', () => {
  it('renders backend text as-is and labels the contract priority', () => {
    expect(findingCardProps(finding)).toEqual({
      title: 'Opening hours differ',
      description: undefined,
      recommendation: 'Update Google hours.',
      priority: { label: 'High', tone: 'high' },
      evidence: [
        {
          sourceUrl: 'https://maps.google.com/x',
          excerpt: undefined,
          provider: 'google_business_profile',
          observedAt: '2026-09-01T00:00:00Z',
        },
      ],
    });
  });
});

describe('sortByPriority', () => {
  it('puts the most urgent first and keeps API order within a priority', () => {
    const rows = [
      { id: 'a', priority: 'low' },
      { id: 'b', priority: 'critical' },
      { id: 'c', priority: 'low' },
      { id: 'd', priority: 'info' },
    ] as const;
    expect(sortByPriority(rows).map((r) => r.id)).toEqual(['b', 'a', 'c', 'd']);
  });
});
