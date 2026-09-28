import { createFileRoute } from '@tanstack/react-router';
import { ListingsPage } from '../../../../modules/clinics/digital-information-page';

export const Route = createFileRoute('/_app/clinics/$clinicId/listings')({
  component: ListingsPage,
});
