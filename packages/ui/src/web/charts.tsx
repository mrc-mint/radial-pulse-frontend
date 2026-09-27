import { useId, useState } from 'react';
import './charts.css';
import { cx } from './internal';

/**
 * Minimal single-series charts for dashboards (dataviz method: thin marks,
 * 4px rounded data-ends on a single baseline, recessive hairline grid, text in
 * text tokens, hover/focus tooltip, and a table view so no value is gated).
 * Values come from the backend; charts only draw them.
 */
export interface ChartDatum {
  id: string;
  label: string;
  value: number;
}

interface ChartBaseProps {
  /** Accessible name; also the caption of the table view. */
  label: string;
  items: ReadonlyArray<ChartDatum>;
  /** Unit for the tooltip and table, e.g. "clinics". */
  unit?: string;
  className?: string;
}

const fmt = (n: number) => n.toLocaleString();

function TableView({ label, items, unit }: ChartBaseProps) {
  return (
    <table className="rp-sr-only">
      <caption>{label}</caption>
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col">{unit ? `Value (${unit})` : 'Value'}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((d) => (
          <tr key={d.id}>
            <th scope="row">{d.label}</th>
            <td>{fmt(d.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Horizontal bars for a small set of categories; values sit at the bar tips. */
export function BarList({ label, items, unit, className }: ChartBaseProps) {
  const max = Math.max(0, ...items.map((d) => d.value));
  return (
    <figure className={cx('rp-barlist', className)}>
      <ul className="rp-barlist__rows" aria-hidden="true">
        {items.map((d) => (
          <li
            key={d.id}
            className="rp-barlist__row"
            title={`${d.label}: ${fmt(d.value)}${unit ? ` ${unit}` : ''}`}
          >
            <span className="rp-barlist__label">{d.label}</span>
            <span className="rp-barlist__track">
              <span
                className="rp-barlist__bar"
                style={{ width: max > 0 ? `${(d.value / max) * 100}%` : '0%' }}
              />
              <span className="rp-barlist__value">{fmt(d.value)}</span>
            </span>
          </li>
        ))}
      </ul>
      <TableView label={label} items={items} unit={unit} />
    </figure>
  );
}

/** Clean axis maximum and ticks (0, step, 2·step, …) for small counts. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
}

/** Vertical columns for a short time series (e.g. per month). */
export function ColumnChart({
  label,
  items,
  unit,
  className,
  height = 180,
}: ChartBaseProps & { height?: number }) {
  const [active, setActive] = useState<string | null>(null);
  const tooltipId = `rp-chart-tip-${useId()}`;
  const ticks = niceTicks(Math.max(0, ...items.map((d) => d.value)));
  const top = ticks[ticks.length - 1] ?? 1;
  const peak = items.reduce<ChartDatum | null>((p, d) => (!p || d.value > p.value ? d : p), null);
  const current = items.find((d) => d.id === active);

  return (
    <figure className={cx('rp-columns', className)}>
      <div className="rp-columns__plot" style={{ height }}>
        <div className="rp-columns__grid" aria-hidden="true">
          {[...ticks].reverse().map((t) => (
            <div key={t} className="rp-columns__gridline">
              <span className="rp-columns__tick">{fmt(t)}</span>
            </div>
          ))}
        </div>
        <div className="rp-columns__bars" onPointerLeave={() => setActive(null)}>
          {items.map((d) => (
            <div
              key={d.id}
              className="rp-columns__slot"
              tabIndex={0}
              role="img"
              aria-label={`${d.label}: ${fmt(d.value)}${unit ? ` ${unit}` : ''}`}
              aria-describedby={active === d.id ? tooltipId : undefined}
              data-active={active === d.id || undefined}
              onPointerEnter={() => setActive(d.id)}
              onFocus={() => setActive(d.id)}
              onBlur={() => setActive(null)}
            >
              {d.id === peak?.id && d.value > 0 && (
                <span
                  className="rp-columns__cap"
                  style={{ bottom: `${(d.value / top) * 100}%` }}
                  aria-hidden="true"
                >
                  {fmt(d.value)}
                </span>
              )}
              <span className="rp-columns__bar" style={{ height: `${(d.value / top) * 100}%` }} />
            </div>
          ))}
        </div>
        {current && (
          <div
            id={tooltipId}
            role="tooltip"
            className="rp-columns__tooltip"
            style={{
              left: `${((items.indexOf(current) + 0.5) / items.length) * 100}%`,
            }}
          >
            <strong>{fmt(current.value)}</strong> {unit} · {current.label}
          </div>
        )}
      </div>
      <div className="rp-columns__labels" aria-hidden="true">
        {items.map((d) => (
          <span key={d.id}>{d.label}</span>
        ))}
      </div>
      <TableView label={label} items={items} unit={unit} />
    </figure>
  );
}
