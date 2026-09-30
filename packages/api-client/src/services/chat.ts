import { unwrap, type ApiClient } from '../http';
import { clinicPath, type BodyOf, type QueryOf } from './types';

/** Clinic chat and the inbox. */
export const chatService = {
  inbox: (api: ApiClient, query: QueryOf<'/api/v1/chat/inbox', 'get'> = {}) =>
    unwrap(api.GET('/api/v1/chat/inbox', { params: { query } })),
  messages: (
    api: ApiClient,
    clinicId: string,
    query: QueryOf<'/api/v1/clinics/{clinic_id}/chat/messages', 'get'> = {},
  ) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/chat/messages', {
        params: { ...clinicPath(clinicId), query },
      }),
    ),
  send: (
    api: ApiClient,
    clinicId: string,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/chat/messages', 'post'>,
  ) =>
    unwrap(
      api.POST('/api/v1/clinics/{clinic_id}/chat/messages', { params: clinicPath(clinicId), body }),
    ),
  markRead: (
    api: ApiClient,
    clinicId: string,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/chat/read', 'post'>,
  ) =>
    unwrap(
      api.POST('/api/v1/clinics/{clinic_id}/chat/read', { params: clinicPath(clinicId), body }),
    ),
};
