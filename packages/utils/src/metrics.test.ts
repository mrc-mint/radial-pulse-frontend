import { describe, expect, it } from 'vitest';
import { formatMetric, metricLabel, metricRank } from './metrics';

describe('social metric display', () => {
  it('labels known metrics and reads unknown keys as words', () => {
    expect(metricLabel('instagram.followers')).toBe('Followers');
    expect(metricLabel('facebook.page_likes')).toBe('Page likes');
  });

  it('shows the API value, as a percentage for rates, and never 0 for missing', () => {
    expect(formatMetric('instagram.engagement_rate', 4.8)).toBe('4.8%');
    expect(formatMetric('instagram.followers', 5432)).toBe((5432).toLocaleString());
    expect(formatMetric('instagram.followers', null)).toBe('Not Available');
  });

  it('puts headline metrics first', () => {
    expect(metricRank('youtube.subscribers')).toBeLessThan(metricRank('youtube.videos_30d'));
    expect(metricRank('x.unknown')).toBeGreaterThan(metricRank('x.posts_30d'));
  });
});
