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

export interface DonutDatum extends ChartDatum {
  /** Series colour (a `--rp-color-chart-*` token), assigned per entity. */
  color: string;
}

/** Whole-number share of `whole`, for display. 0 when there is nothing to share. */
export function donutShare(value: number, whole: number): number {
  return whole > 0 ? Math.round((value / whole) * 100) : 0;
}

/**
 * Part-of-whole for a few categories: a donut with the total in the centre
 * and a legend carrying every label, count and share, so identity is never
 * colour alone. Shares are the display ratio of the backend counts.
 */
export function DonutChart({
  label,
  items,
  total,
  centerLabel,
  unit,
  className,
  size = 168,
}: Omit<ChartBaseProps, 'items'> & {
  items: ReadonlyArray<DonutDatum>;
  /** The whole the shares are of; defaults to the sum of the items. */
  total?: number;
  centerLabel: string;
  size?: number;
}) {
  const [active, setActive] = useState<string | null>(null);
  const whole = total ?? items.reduce((sum, d) => sum + d.value, 0);
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // 2px surface gap between neighbouring segments.
  const gap = items.filter((d) => d.value > 0).length > 1 ? 2 : 0;

  let offset = 0;
  const segments = items.map((d) => {
    const length = whole > 0 ? (d.value / whole) * circumference : 0;
    const segment = { ...d, start: offset, length };
    offset += length;
    return segment;
  });

  return (
    <figure className={cx('rp-donut', className)}>
      <div className="rp-donut__ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--rp-color-bg-muted)"
            strokeWidth={stroke}
          />
          {segments.map((s) =>
            s.length > 0 ? (
              <circle
                key={s.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={active === s.id ? stroke + 4 : stroke}
                strokeDasharray={`${Math.max(s.length - gap, 0.5)} ${circumference}`}
                strokeDashoffset={-s.start}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                opacity={active && active !== s.id ? 0.45 : 1}
                onPointerEnter={() => setActive(s.id)}
                onPointerLeave={() => setActive(null)}
              />
            ) : null,
          )}
        </svg>
        <div className="rp-donut__center" aria-hidden="true">
          <span className="rp-donut__total">{fmt(whole)}</span>
          <span className="rp-donut__center-label">{centerLabel}</span>
        </div>
      </div>
      <ul className="rp-donut__legend" aria-label={label}>
        {items.map((d) => (
          <li
            key={d.id}
            className="rp-donut__legend-row"
            data-active={active === d.id || undefined}
            onPointerEnter={() => setActive(d.id)}
            onPointerLeave={() => setActive(null)}
          >
            <span className="rp-donut__swatch" style={{ background: d.color }} aria-hidden="true" />
            <span className="rp-donut__legend-label">{d.label}</span>
            <span className="rp-donut__legend-value">
              {fmt(d.value)}
              <span className="rp-donut__legend-share">({donutShare(d.value, whole)}%)</span>
            </span>
          </li>
        ))}
      </ul>
      <TableView label={label} items={items} unit={unit} />
    </figure>
  );
}

/**
 * A short time series as a 2px line over a light area, with markers, a
 * crosshair tooltip per point and a table view.
 */
export function LineChart({
  label,
  items,
  unit,
  className,
  height = 200,
  color = 'var(--rp-color-chart-series1)',
}: ChartBaseProps & { height?: number; color?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const tooltipId = `rp-chart-tip-${useId()}`;
  const ticks = niceTicks(Math.max(0, ...items.map((d) => d.value)));
  const top = ticks[ticks.length - 1] ?? 1;
  const n = items.length;
  const x = (i: number) => ((i + 0.5) / n) * 100;
  const y = (v: number) => 100 - (v / top) * 100;
  const line = items.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.value)}`).join(' ');
  const area = n > 0 ? `${line} L${x(n - 1)},100 L${x(0)},100 Z` : '';
  const currentIndex = items.findIndex((d) => d.id === active);
  const current = items[currentIndex];

  return (
    <figure className={cx('rp-line', className)}>
      <div className="rp-columns__plot" style={{ height }}>
        <div className="rp-columns__grid" aria-hidden="true">
          {[...ticks].reverse().map((t) => (
            <div key={t} className="rp-columns__gridline">
              <span className="rp-columns__tick">{fmt(t)}</span>
            </div>
          ))}
        </div>
        <svg
          className="rp-line__svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={area} fill={color} fillOpacity={0.1} stroke="none" />
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {current && (
          <span
            className="rp-line__crosshair"
            style={{ left: `${x(currentIndex)}%` }}
            aria-hidden="true"
          />
        )}
        {items.map((d, i) => (
          <span
            key={d.id}
            className="rp-line__marker"
            data-active={active === d.id || undefined}
            style={{ left: `${x(i)}%`, top: `${y(d.value)}%`, background: color }}
            aria-hidden="true"
          />
        ))}
        <div className="rp-columns__bars" onPointerLeave={() => setActive(null)}>
          {items.map((d) => (
            <div
              key={d.id}
              className="rp-columns__slot rp-line__slot"
              tabIndex={0}
              role="img"
              aria-label={`${d.label}: ${fmt(d.value)}${unit ? ` ${unit}` : ''}`}
              aria-describedby={active === d.id ? tooltipId : undefined}
              onPointerEnter={() => setActive(d.id)}
              onFocus={() => setActive(d.id)}
              onBlur={() => setActive(null)}
            />
          ))}
        </div>
        {current && (
          <div
            id={tooltipId}
            role="tooltip"
            className="rp-columns__tooltip"
            style={{ left: `${x(currentIndex)}%` }}
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
