import type { CSSProperties, ReactNode } from 'react';
import { getPageItems, getPageRange } from '../shared';
import { Skeleton } from './feedback';
import { ChevronLeftIcon, ChevronRightIcon, cx } from './internal';
import './table.css';

export interface TableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T, rowIndex: number) => ReactNode;
  width?: CSSProperties['width'];
  align?: 'start' | 'center' | 'end';
  /** Visually hidden header text for columns with no visible header (e.g. row actions). */
  headerLabel?: string;
}

export interface TableProps<T> {
  /** Accessible name of the table (rendered as a visually hidden caption). */
  caption: string;
  columns: ReadonlyArray<TableColumn<T>>;
  rows: ReadonlyArray<T>;
  getRowKey: (row: T) => string;
  /** Renders skeleton rows and marks the table busy. */
  loading?: boolean;
  loadingRowCount?: number;
  /** Shown in place of rows when `rows` is empty and not loading. */
  empty?: ReactNode;
  /** Shown in place of rows when set (e.g. an <ErrorState>). */
  error?: ReactNode;
  /** Footer row area, typically <Pagination>. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Presentational data table. Sorting, filtering and paging are server-side
 * concerns handled by the caller; the table only renders what it is given.
 * Put links/buttons inside cells rather than making whole rows clickable.
 */
export function Table<T>({
  caption,
  columns,
  rows,
  getRowKey,
  loading = false,
  loadingRowCount = 5,
  empty,
  error,
  footer,
  className,
}: TableProps<T>) {
  const colSpan = columns.length;
  let body: ReactNode;

  if (error) {
    body = (
      <tr>
        <td colSpan={colSpan} className="rp-table__message">
          {error}
        </td>
      </tr>
    );
  } else if (loading) {
    body = Array.from({ length: loadingRowCount }, (_, r) => (
      <tr key={`loading-${r}`}>
        {columns.map((c, i) => (
          <td key={c.id}>
            <Skeleton width={i === 0 ? '40%' : '70%'} />
          </td>
        ))}
      </tr>
    ));
  } else if (rows.length === 0) {
    body = (
      <tr>
        <td colSpan={colSpan} className="rp-table__message">
          {empty}
        </td>
      </tr>
    );
  } else {
    body = rows.map((row, r) => (
      <tr key={getRowKey(row)}>
        {columns.map((c) => (
          <td key={c.id} data-align={c.align}>
            {c.cell(row, r)}
          </td>
        ))}
      </tr>
    ));
  }

  return (
    <div className={cx('rp-table', className)}>
      <div className="rp-table__scroll">
        <table aria-busy={loading || undefined}>
          <caption className="rp-sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.id} scope="col" data-align={c.align} style={{ width: c.width }}>
                  {c.header}
                  {c.headerLabel && <span className="rp-sr-only">{c.headerLabel}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
      {footer && <div className="rp-table__footer">{footer}</div>}
    </div>
  );
}

export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  pageSize: number;
  /** Total from the API response. */
  totalItems: number;
  onPageChange: (page: number) => void;
  /** Plural noun for the summary, e.g. "clinics". */
  itemLabel?: string;
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  itemLabel = 'results',
  className,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const { start, end } = getPageRange(page, pageSize, totalItems);

  return (
    <div className={cx('rp-pagination', className)}>
      <p className="rp-pagination__summary" aria-live="polite">
        {totalItems === 0
          ? `No ${itemLabel}`
          : `Showing ${start.toLocaleString()}–${end.toLocaleString()} of ${totalItems.toLocaleString()} ${itemLabel}`}
      </p>
      {pageCount > 1 && (
        <nav aria-label="Pagination">
          <ul className="rp-pagination__list">
            <li>
              <button
                type="button"
                className="rp-pagination__button"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                <ChevronLeftIcon />
              </button>
            </li>
            {getPageItems(page, pageCount).map((item) =>
              typeof item === 'number' ? (
                <li key={item}>
                  <button
                    type="button"
                    className="rp-pagination__button"
                    aria-label={`Page ${item}`}
                    aria-current={item === page ? 'page' : undefined}
                    onClick={() => onPageChange(item)}
                  >
                    {item}
                  </button>
                </li>
              ) : (
                <li key={item} className="rp-pagination__ellipsis" aria-hidden="true">
                  …
                </li>
              ),
            )}
            <li>
              <button
                type="button"
                className="rp-pagination__button"
                aria-label="Next page"
                disabled={page >= pageCount}
                onClick={() => onPageChange(page + 1)}
              >
                <ChevronRightIcon />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
