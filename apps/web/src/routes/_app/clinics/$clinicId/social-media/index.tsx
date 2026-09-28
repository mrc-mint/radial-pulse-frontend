import { createFileRoute } from '@tanstack/react-router';
import { SocialMediaPage } from '../../../../../modules/social-media/social-media-page';

export const Route = createFileRoute('/_app/clinics/$clinicId/social-media/')({
  component: SocialMediaPage,
});
