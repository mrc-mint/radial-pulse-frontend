// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { DonutChart, donutShare, LineChart } from './index';
import { cleanup, render } from './test-utils';

afterEach(cleanup);

describe('DonutChart', () => {
  it('labels every segment with its count and share, never colour alone', () => {
    const { container } = render(
      <DonutChart
        label="Clinics by status"
        centerLabel="Total clinics"
        total={128}
        items={[
          { id: 'active', label: 'Active', value: 76, color: 'green' },
          { id: 'prospects', label: 'Prospects', value: 38, color: 'blue' },
          { id: 'in_progress', label: 'In progress', value: 14, color: 'orange' },
        ]}
      />,
    );
    const rows = [...container.querySelectorAll('.rp-donut__legend-row')].map(
      (row) => row.textContent,
    );
    expect(rows).toEqual(['Active76(59%)', 'Prospects38(30%)', 'In progress14(11%)']);
    expect(container.querySelector('.rp-donut__total')?.textContent).toBe('128');
    expect(container.querySelector('table caption')?.textContent).toBe('Clinics by status');
  });

  it('shares nothing of an empty whole', () => {
    expect(donutShare(5, 0)).toBe(0);
    expect(donutShare(1, 3)).toBe(33);
  });
});

describe('LineChart', () => {
  it('draws one marker per point and keeps every value in the table view', () => {
    const { container } = render(
      <LineChart
        label="Total clinics by month"
        unit="clinics"
        items={[
          { id: '2026-08', label: 'Aug', value: 10 },
          { id: '2026-09', label: 'Sep', value: 12 },
        ]}
      />,
    );
    expect(container.querySelectorAll('.rp-line__marker')).toHaveLength(2);
    const cells = [...container.querySelectorAll('tbody td')].map((c) => c.textContent);
    expect(cells).toEqual(['10', '12']);
    expect(container.querySelector('[role="img"][aria-label="Sep: 12 clinics"]')).not.toBeNull();
  });
});
