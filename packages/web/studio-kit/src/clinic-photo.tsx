import { useAssetDownloadUrl } from '@radial-pulse/api-client-react';
import { Building2 } from 'lucide-react';
import { useState } from 'react';
import './clinic-photo.css';

/**
 * The clinic's cover photo (`ClinicRead.cover_asset_id`), loaded through a
 * short-lived download URL. A neutral placeholder stands in when the clinic
 * has no photo yet or the image cannot load.
 */
export function ClinicPhoto({
  clinicId,
  assetId,
  name,
  className,
}: {
  clinicId: string;
  assetId: string | null;
  name: string;
  className?: string;
}) {
  const download = useAssetDownloadUrl(clinicId, assetId);
  const [failed, setFailed] = useState<string | null>(null);
  const src = download.data?.url;

  if (src && failed !== src) {
    return (
      <img
        className={`rp-clinic-photo ${className ?? ''}`}
        src={src}
        alt={`Photo of ${name}`}
        onError={() => setFailed(src)}
      />
    );
  }
  return (
    <div
      className={`rp-clinic-photo rp-clinic-photo--empty ${className ?? ''}`}
      role="img"
      aria-label={download.isLoading ? `Loading photo of ${name}` : `${name} has no photo yet`}
    >
      <Building2 size={32} aria-hidden="true" />
    </div>
  );
}
