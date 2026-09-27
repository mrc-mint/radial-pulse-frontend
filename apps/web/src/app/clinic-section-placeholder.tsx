import { useClinicId } from '@radial-pulse/platform-shell/core';
import { PagePlaceholder } from './page-placeholder';

/** TEMPORARY clinic section body; proves the section runs in the clinic scope. */
export function ClinicSectionPlaceholder({ title }: { title: string }) {
  const clinicId = useClinicId();
  return (
    <PagePlaceholder
      embedded
      title={title}
      detail={<span data-testid="clinic-scope">Scoped to clinic {clinicId}</span>}
    />
  );
}
