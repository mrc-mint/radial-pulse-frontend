import {
  displayHost,
  formatDateTime,
  type FindingCardBaseProps,
  type FindingEvidence,
} from '../shared';
import { ExternalLinkIcon, cx } from './internal';
import './finding.css';

function EvidenceItem({ evidence }: { evidence: FindingEvidence }) {
  const observed = evidence.observedAt ? formatDateTime(evidence.observedAt) : null;
  return (
    <li className="rp-evidence">
      {evidence.excerpt && (
        <blockquote className="rp-evidence__excerpt">{evidence.excerpt}</blockquote>
      )}
      <p className="rp-evidence__meta">
        {evidence.sourceUrl && (
          <a
            href={evidence.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rp-evidence__link"
          >
            {displayHost(evidence.sourceUrl)}
            <ExternalLinkIcon size={12} />
            <span className="rp-sr-only"> (opens in a new tab)</span>
          </a>
        )}
        {evidence.provider && <span>{evidence.provider}</span>}
        {observed && evidence.observedAt && (
          <span>
            Observed <time dateTime={evidence.observedAt}>{observed}</time>
          </span>
        )}
      </p>
    </li>
  );
}

export interface FindingCardProps extends FindingCardBaseProps {
  className?: string;
  /** Heading level of the finding title within the page outline. */
  titleAs?: 'h3' | 'h4';
  /** Start with the evidence list expanded. */
  evidenceOpen?: boolean;
}

/**
 * One assessment finding, rendered generically from the contract. Severity
 * label and tone come from the caller's single contract→tone mapping.
 */
export function FindingCard({
  title,
  description,
  priority,
  sectionLabel,
  recommendation,
  evidence = [],
  titleAs: Title = 'h3',
  evidenceOpen,
  className,
}: FindingCardProps) {
  return (
    <article className={cx('rp-finding', `rp-severity-${priority.tone}`, className)}>
      <div className="rp-finding__meta">
        <span className="rp-finding__severity">
          <span className="rp-finding__severity-dot" aria-hidden="true" />
          <span className="rp-sr-only">Priority: </span>
          {priority.label}
        </span>
        {sectionLabel && <span className="rp-finding__section">{sectionLabel}</span>}
      </div>
      <Title className="rp-finding__title">{title}</Title>
      {description && <p className="rp-finding__description">{description}</p>}
      {recommendation && (
        <div className="rp-finding__recommendation">
          <p className="rp-finding__recommendation-label">Recommendation</p>
          <p>{recommendation}</p>
        </div>
      )}
      {evidence.length > 0 && (
        <details className="rp-finding__evidence" open={evidenceOpen}>
          <summary>
            Evidence <span className="rp-finding__count">({evidence.length})</span>
          </summary>
          <ul>
            {evidence.map((e, i) => (
              <EvidenceItem key={e.sourceUrl ?? i} evidence={e} />
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}
