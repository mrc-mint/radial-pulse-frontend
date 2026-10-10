import { createFileRoute } from '@tanstack/react-router';
import { SocialMediaPage } from '@radial-pulse/studio-social-media';

export const Route = createFileRoute('/_app/clinics/$clinicId/social-media/')({
  component: SocialMediaPage,
});
