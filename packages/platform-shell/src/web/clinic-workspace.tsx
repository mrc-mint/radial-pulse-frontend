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
  children,
}: ClinicWorkspaceProps) {
  return (
    <div className="rp-clinic">
      {header}
      <nav aria-label="Clinic sections" className="rp-clinic__nav">
        <ul className="rp-clinic__list">
          {sections.map((section) => {
            const active = isRouteActive(section.to, pathname, section.exact);
            return (
              <li key={section.id}>
                {renderLink({
                  to: section.to,
                  className: 'rp-clinic__link',
                  'aria-current': active ? 'page' : undefined,
                  children: section.label,
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
