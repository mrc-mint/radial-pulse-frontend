import { createFileRoute, redirect } from '@tanstack/react-router';
import { STUDIO_FEATURES } from '../../../../app/release';
import { ChatPage } from '../../../../modules/chat/chat-page';

/** Client Collaboration is V2: until it ships, the URL goes to the clinic's Overview. */
export const Route = createFileRoute('/_app/clinics/$clinicId/chat')({
  beforeLoad: ({ params }) => {
    if (!STUDIO_FEATURES.clientCollaboration) {
      throw redirect({ to: '/clinics/$clinicId', params, replace: true });
    }
  },
  component: ChatPage,
});
