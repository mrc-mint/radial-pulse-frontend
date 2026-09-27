import { formatComponentScore } from '@radial-pulse/utils';
import type { CSSProperties } from 'react';
import {
  formatMetricValue,
  type MetricCardBaseProps,
  type MetricChange,
  type ScoreCardBaseProps,
} from '../shared';
import { ArrowDownIcon, ArrowUpIcon, cx, MinusIcon } from './internal';
import './metrics.css';

const TREND_ICON = { up: ArrowUpIcon, down: ArrowDownIcon, flat: MinusIcon } as const;
const TREND_WORD = { up: 'Up', down: 'Down', flat: 'No change' } as const;

function Change({ change }: { change: MetricChange }) {
  const Icon = TREND_ICON[change.direction];
  return (
    <p className="rp-metric__change">
      <span className={cx('rp-metric__delta', `rp-tone-${change.tone ?? 'neutral'}`)}>
        <Icon size={12} strokeWidth={2.5} />
        <span className="rp-sr-only">{TREND_WORD[change.direction]} </span>
        {change.label}
      </span>
      {change.period && <span className="rp-metric__period">{change.period}</span>}
    </p>
  );
}

export interface MetricCardProps extends MetricCardBaseProps {
  className?: string;
}

/** A single backend-provided figure (clinic counts, followers, reach…). */
export function MetricCard({ label, value, icon, change, hint, className }: MetricCardProps) {
  const text = formatMetricValue(value);
  const missing = value === null || value === undefined || value === '';
  return (
    <section className={cx('rp-metric', className)} aria-label={label}>
      {icon && (
        <div className="rp-metric__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="rp-metric__body">
        <p className="rp-metric__label">{label}</p>
        <p className={cx('rp-metric__value', missing && 'rp-metric__value--missing')}>{text}</p>
        {change && !missing && <Change change={change} />}
        {hint && <p className="rp-metric__hint">{hint}</p>}
      </div>
    </section>
  );
}

export interface ScoreCardProps extends ScoreCardBaseProps {
  className?: string;
}

/**
 * The overall assessment score (or a section score). Displays what the
 * backend sent: `not_available` reads "Not Available", never 0, and the tone
 * is supplied by the caller rather than derived from the number.
 */
export function ScoreCard({
  label,
  score,
  max = 100,
  tone = 'brand',
  caption,
  comparison,
  className,
}: ScoreCardProps) {
  const available = score.availability === 'available';
  const fraction = available ? Math.min(Math.max(score.score / max, 0), 1) : 0;
  const text = formatComponentScore(score);

  return (
    <section className={cx('rp-score', `rp-tone-${tone}`, className)} aria-label={label}>
      <p className="rp-score__label">{label}</p>
      <div className="rp-score__main">
        <div
          className="rp-score__ring"
          data-available={available || undefined}
          style={{ '--_fraction': fraction } as CSSProperties}
          aria-hidden="true"
        >
          <div className="rp-score__ring-inner">
            {available ? (
              <span className="rp-score__figure">
                <span className="rp-score__value">{text}</span>
                <span className="rp-score__max">/{max}</span>
              </span>
            ) : (
              <span className="rp-score__na">{text}</span>
            )}
          </div>
        </div>
        <p className="rp-sr-only">{available ? `${text} out of ${max}` : text}</p>
        {(caption || comparison) && (
          <div className="rp-score__aside">
            {caption && <p className="rp-score__caption">{caption}</p>}
            {comparison && (
              <p className="rp-score__comparison">
                <span>{comparison.label}</span>
                <strong>{formatComponentScore(comparison.score)}</strong>
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
