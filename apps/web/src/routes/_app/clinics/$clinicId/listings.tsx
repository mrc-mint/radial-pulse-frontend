import { createFileRoute } from '@tanstack/react-router';
import { ListingsPage } from '@radial-pulse/studio-clinics';

export const Route = createFileRoute('/_app/clinics/$clinicId/listings')({
  component: ListingsPage,
});
