import { createFileRoute } from '@tanstack/react-router';
import { ChatPage } from '../../../../modules/chat/chat-page';

export const Route = createFileRoute('/_app/clinics/$clinicId/chat')({
  component: ChatPage,
});
