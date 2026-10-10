import { useClinic, usePractitioners } from '@radial-pulse/api-client-react';
import { useClinicCan } from '@radial-pulse/shell-core';
import { Button, displayHost, PageHeader, Skeleton } from '@radial-pulse/web-ui';
import { Globe, Mail, MapPin, Pencil, Phone } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { ClinicStatusBadge, ExternalLink, mapsUrl, QueryError } from '../../app/page-kit';
import { ClinicMoreMenu } from './clinic-actions';
import { ClinicPhoto } from '../../app/clinic-photo';
import { EditClinicDrawer } from './edit-clinic-drawer';
import './clinic.css';

/**
 * Clinic details header: title bar with Edit and More, then the clinic card
 * (photo, name, status, main practitioner, description, contacts) and a map
 * card. All from the contract (`ClinicRead`, practitioners, assets).
 */
export function ClinicHeader({ clinicId, back }: { clinicId: string; back: ReactNode }) {
  const clinic = useClinic(clinicId);
  const canPractitioners = useClinicCan(clinicId, 'practitioners:read');
  const practitioners = usePractitioners(clinicId, { enabled: canPractitioners });
  const canEdit = useClinicCan(clinicId, 'clinics:write');
  const canManage = useClinicCan(clinicId, 'clinics:manage');
  const [editing, setEditing] = useState(false);

  if (clinic.isError) {
    return (
      <div className="rp-stack">
        <PageHeader back={back} title="Client organization details" />
        <QueryError
          error={clinic.error}
          title="This client organization isn’t available"
          onRetry={() => void clinic.refetch()}
        />
      </div>
    );
  }

  const c = clinic.data;
  const practitioner =
    practitioners.data?.items.find((p) => p.is_primary && p.is_active) ??
    practitioners.data?.items[0];

  return (
    <div className="rp-clinic-header">
      <PageHeader
        back={back}
        title="Client organization details"
        actions={
          c && (
            <>
              {canEdit && (
                <Button
                  variant="secondary"
                  leadingIcon={<Pencil size={16} />}
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              )}
              {canManage && <ClinicMoreMenu clinic={c} />}
            </>
          )
        }
      />

      {!c ? (
        <div className="rp-clinic-card" aria-busy="true">
          <Skeleton width={200} height={150} radius="lg" />
          <div className="rp-stack-sm">
            <Skeleton width={260} height={28} />
            <Skeleton width={180} />
            <Skeleton width={320} />
          </div>
        </div>
      ) : (
        <section className="rp-clinic-card" aria-label={c.name}>
          <ClinicPhoto clinicId={c.id} assetId={c.cover_asset_id} name={c.name} />
          <div className="rp-clinic-card__body">
            <div className="rp-clinic-card__title">
              <h2>{c.name}</h2>
              <ClinicStatusBadge clinic={c} />
            </div>
            {practitioner && <p className="rp-clinic-card__doctor">{practitioner.full_name}</p>}
            {c.description && <p className="rp-clinic-card__description">{c.description}</p>}
            {!c.is_active && c.archived_reason && (
              <p className="rp-muted rp-small">Archived: {c.archived_reason}</p>
            )}
            <ul
              className="rp-clinic-header__contacts"
              aria-label="Client organization contact details"
            >
              {c.website_url && (
                <li>
                  <Globe size={16} aria-hidden="true" />
                  <ExternalLink href={c.website_url}>{displayHost(c.website_url)}</ExternalLink>
                </li>
              )}
              {c.phone && (
                <li>
                  <Phone size={16} aria-hidden="true" />
                  <a className="rp-link" href={`tel:${c.phone.replace(/\s+/g, '')}`}>
                    {c.phone}
                  </a>
                </li>
              )}
              {c.email && (
                <li>
                  <Mail size={16} aria-hidden="true" />
                  <a className="rp-link" href={`mailto:${c.email}`}>
                    {c.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
          <MapCard clinic={c} />
        </section>
      )}

      {c && <EditClinicDrawer clinic={c} open={editing} onClose={() => setEditing(false)} />}
    </div>
  );
}

/**
 * A map-style card with the address and a link to Google Maps. Deliberately
 * static: no third-party map is loaded into the page.
 */
function MapCard({
  clinic,
}: {
  clinic: Parameters<typeof mapsUrl>[0] & {
    state: string | null;
    postal_code: string | null;
  };
}) {
  const url = mapsUrl(clinic);
  const address = [clinic.address_line, clinic.city, clinic.state, clinic.postal_code]
    .filter(Boolean)
    .join(', ');
  return (
    <div className="rp-map-card">
      <div className="rp-map-card__art" aria-hidden="true">
        <span className="rp-map-card__pin">
          <MapPin size={28} />
        </span>
      </div>
      <div className="rp-map-card__footer">
        {address && <span className="rp-map-card__address">{address}</span>}
        {url ? (
          <ExternalLink href={url}>
            <MapPin size={14} aria-hidden="true" /> View on Google Maps
          </ExternalLink>
        ) : (
          <span className="rp-muted rp-small">No location yet</span>
        )}
      </div>
    </div>
  );
}
