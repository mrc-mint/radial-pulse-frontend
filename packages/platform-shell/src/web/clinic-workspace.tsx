import type { ReactNode } from 'react';
import { isRouteActive, type ResolvedClinicSection } from '../core';
import './clinic-workspace.css';
import type { RenderLink } from './link';

export interface ClinicWorkspaceProps {
  /** Output of resolveClinicSections() for this clinic. */
  sections: ReadonlyArray<ResolvedClinicSection>;
  pathname: string;
  renderLink: RenderLink;
  /** Clinic header (name, status, actions) supplied by the clinics module. */
  header: ReactNode;
  /** Optional counts per section id (e.g. unread chat messages). */
  badges?: Readonly<Partial<Record<string, { count: number; label: string }>>>;
  children: ReactNode;
}

/**
 * Frame for every clinic-scoped page: clinic header, section navigation
 * (Overview, Unified Audit, Social Media, Chat, …) and the section content.
 * Sections are links — each one is a URL — so they use navigation semantics
 * rather than ARIA tabs.
 */
export function ClinicWorkspace({
  sections,
  pathname,
  renderLink,
  header,
  badges,
  children,
}: ClinicWorkspaceProps) {
  return (
    <div className="rp-clinic">
      {header}
      <nav aria-label="Clinic sections" className="rp-clinic__nav">
        <ul className="rp-clinic__list">
          {sections.map((section) => {
            const active = isRouteActive(section.to, pathname, section.exact);
            const badge = badges?.[section.id];
            return (
              <li key={section.id}>
                {renderLink({
                  to: section.to,
                  className: 'rp-clinic__link',
                  'aria-current': active ? 'page' : undefined,
                  children: (
                    <>
                      {section.label}
                      {badge && badge.count > 0 && (
                        <span className="rp-clinic__badge">
                          {badge.count}
                          <span className="rp-sr-only"> {badge.label}</span>
                        </span>
                      )}
                    </>
                  ),
                })}
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="rp-clinic__content">{children}</div>
    </div>
  );
}
