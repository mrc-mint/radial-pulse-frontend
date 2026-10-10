import type { Schema } from '@radial-pulse/shared-types';

type MonthCount = Schema<'MonthCount'>;

/**
 * Clinics on the platform at the end of each month, worked back from today's
 * `total_clinics` and the clinics added in each later month
 * (`new_clinics_by_month`). Counts only: nothing is scored.
 *
 * Interim until the API publishes a total-by-month series (contract gap 17):
 * a clinic created in the window and archived since is in the monthly
 * additions but not in the total, so earlier months can read slightly low.
 * Never below 0.
 */
export function clinicsAtMonthEnd(
  total: number,
  newByMonth: ReadonlyArray<MonthCount>,
): MonthCount[] {
  let running = total;
  const result: MonthCount[] = [];
  for (let i = newByMonth.length - 1; i >= 0; i--) {
    const month = newByMonth[i]!;
    result.unshift({ month: month.month, count: Math.max(running, 0) });
    running -= month.count;
  }
  return result;
}
