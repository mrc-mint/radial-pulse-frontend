import { useClinic } from '@radial-pulse/api-client/react';
import { Badge, CLINIC_STAGE_TONES, displayHost, PageHeader, Skeleton } from '@radial-pulse/ui/web';
import { CLINIC_STAGE_LABELS } from '@radial-pulse/utils';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { ExternalLink, mapsUrl, QueryError } from '../../app/page-kit';
import './clinic.css';

/** Clinic workspace header from the contract `ClinicRead`. */
export function ClinicHeader({ clinicId, back }: { clinicId: string; back: ReactNode }) {
  const clinic = useClinic(clinicId);

  if (clinic.isError) {
    return (
      <div className="rp-stack">
        {back}
        <QueryError
          error={clinic.error}
          title="This clinic isn’t available"
          onRetry={() => void clinic.refetch()}
        />
      </div>
    );
  }

  const c = clinic.data;
  if (!c) {
    return (
      <div className="rp-stack-sm" aria-busy="true">
        <Skeleton width={280} height={28} />
        <Skeleton width={360} />
      </div>
    );
  }

  const map = mapsUrl(c);
  return (
    <div className="rp-clinic-header">
      <PageHeader
        back={back}
        title={c.name}
        description={[c.specialty, [c.city, c.state].filter(Boolean).join(', ')]
          .filter(Boolean)
          .join(' · ')}
        actions={
          <Badge tone={CLINIC_STAGE_TONES[c.stage]} dot>
            {CLINIC_STAGE_LABELS[c.stage]}
          </Badge>
        }
      />
      <ul className="rp-clinic-header__contacts" aria-label="Clinic contact details">
        {c.website_url && (
          <li>
            <Globe size={14} aria-hidden="true" />
            <ExternalLink href={c.website_url}>{displayHost(c.website_url)}</ExternalLink>
          </li>
        )}
        {c.phone && (
          <li>
            <Phone size={14} aria-hidden="true" />
            <a className="rp-link" href={`tel:${c.phone.replace(/\s+/g, '')}`}>
              {c.phone}
            </a>
          </li>
        )}
        {c.email && (
          <li>
            <Mail size={14} aria-hidden="true" />
            <a className="rp-link" href={`mailto:${c.email}`}>
              {c.email}
            </a>
          </li>
        )}
        {map && (
          <li>
            <MapPin size={14} aria-hidden="true" />
            <ExternalLink href={map}>View on Google Maps</ExternalLink>
          </li>
        )}
      </ul>
    </div>
  );
}
