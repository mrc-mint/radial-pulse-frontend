export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/**
 * Page buttons to show: first, last, the current page with `siblings` on each
 * side, and ellipses for gaps. Pages are 1-based.
 *   (1, 13) → 1 2 3 4 5 … 13
 *   (7, 13) → 1 … 6 7 8 … 13
 */
export function getPageItems(page: number, pageCount: number, siblings = 1): PageItem[] {
  if (pageCount <= 0) return [];
  const current = Math.min(Math.max(page, 1), pageCount);
  // first + last + current + siblings + two ellipses
  const slots = 2 * siblings + 5;
  if (pageCount <= slots) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const edge = slots - 2; // pages shown on one side when the other side collapses

  if (current <= edge - siblings) return [...range(1, edge), 'ellipsis-end', pageCount];
  if (current >= pageCount - edge + 1 + siblings) {
    return [1, 'ellipsis-start', ...range(pageCount - edge + 1, pageCount)];
  }
  return [
    1,
    'ellipsis-start',
    ...range(current - siblings, current + siblings),
    'ellipsis-end',
    pageCount,
  ];
}

/** "Showing 11–20 of 128" range, clamped to the total. 1-based page. */
export function getPageRange(
  page: number,
  pageSize: number,
  totalItems: number,
): { start: number; end: number } {
  if (totalItems <= 0) return { start: 0, end: 0 };
  const start = (page - 1) * pageSize + 1;
  return { start: Math.min(start, totalItems), end: Math.min(page * pageSize, totalItems) };
}
