import type { Schema } from '@radial-pulse/shared-types';
import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  assessmentsService,
  assetsService,
  assignmentsService,
  auditEventsService,
  chatService,
  clinicsService,
  connectionsService,
  dashboardService,
  practitionersService,
  presenceService,
  settingsService,
  snapshotsService,
  uploadToPresignedUrl,
  usersService,
  workItemsService,
  type BodyOf,
  type QueryOf,
} from '../services';
import { useApiClient } from './provider';
import { clinicQueryKey, platformQueryKey } from './query-keys';

/**
 * Resource hooks for the screens. Every clinic-scoped key goes through
 * `clinicQueryKey`, so one clinic's data can never appear under another.
 */

// ── Platform-level ──────────────────────────────────────────────────────────

export function useDashboardSummary() {
  const api = useApiClient();
  return useQuery({
    queryKey: platformQueryKey('dashboard-summary'),
    queryFn: () => dashboardService.summary(api),
  });
}

export function useClinics(query: QueryOf<'/api/v1/clinics', 'get'>) {
  const api = useApiClient();
  return useQuery({
    queryKey: platformQueryKey('clinics', query),
    queryFn: () => clinicsService.list(api, query),
    placeholderData: keepPreviousData,
  });
}

export function useCreateClinic() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BodyOf<'/api/v1/clinics', 'post'>) => clinicsService.create(api, body),
    onSuccess: () => invalidatePlatformLists(queryClient),
  });
}

export function useUsers(
  query: QueryOf<'/api/v1/users', 'get'>,
  options: { enabled?: boolean } = {},
) {
  const api = useApiClient();
  return useQuery({
    queryKey: platformQueryKey('users', query),
    queryFn: () => usersService.list(api, query),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useCreateUser() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BodyOf<'/api/v1/users', 'post'>) => usersService.create(api, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: platformQueryKey('users') }),
  });
}

export function useResendInvite() {
  const api = useApiClient();
  return useMutation({ mutationFn: (userId: string) => usersService.resendInvite(api, userId) });
}

export function usePlatformSettings(options: { enabled?: boolean } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: platformQueryKey('settings', 'platform'),
    queryFn: () => settingsService.platform(api),
    enabled: options.enabled ?? true,
  });
}

export function useUpdatePlatformSettings() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BodyOf<'/api/v1/settings/platform', 'patch'>) =>
      settingsService.updatePlatform(api, body),
    onSuccess: (data) => queryClient.setQueryData(platformQueryKey('settings', 'platform'), data),
  });
}

/** Chat threads across clinics; slower polling for unread badges. */
export function useChatInbox(options: { refetchIntervalMs?: number; enabled?: boolean } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: platformQueryKey('chat-inbox'),
    queryFn: () => chatService.inbox(api),
    refetchInterval: options.refetchIntervalMs ?? 30_000,
    enabled: options.enabled ?? true,
  });
}

function invalidatePlatformLists(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: platformQueryKey('clinics') }),
    queryClient.invalidateQueries({ queryKey: platformQueryKey('dashboard-summary') }),
  ]);
}

// ── Clinic-scoped ───────────────────────────────────────────────────────────

export function useClinic(clinicId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'detail'),
    queryFn: () => clinicsService.get(api, clinicId),
  });
}

export function useUpdateClinic(clinicId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BodyOf<'/api/v1/clinics/{clinic_id}', 'patch'>) =>
      clinicsService.update(api, clinicId, body),
    onSuccess: (data) => {
      queryClient.setQueryData(clinicQueryKey(clinicId, 'detail'), data);
      return invalidatePlatformLists(queryClient);
    },
  });
}

/** Invalidates everything that shows a clinic's status or details. */
function useInvalidateClinicEverywhere(clinicId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'detail') }),
      queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'activity') }),
      invalidatePlatformLists(queryClient),
    ]);
}

export function useChangeClinicStage(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateClinicEverywhere(clinicId);
  return useMutation({
    mutationFn: (body: BodyOf<'/api/v1/clinics/{clinic_id}/stage', 'post'>) =>
      clinicsService.changeStage(api, clinicId, body),
    onSuccess: invalidate,
  });
}

export function useArchiveClinic(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateClinicEverywhere(clinicId);
  return useMutation({
    mutationFn: (reason: string) => clinicsService.archive(api, clinicId, { reason }),
    onSuccess: invalidate,
  });
}

export function useRestoreClinic(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateClinicEverywhere(clinicId);
  return useMutation({
    mutationFn: () => clinicsService.restore(api, clinicId),
    onSuccess: invalidate,
  });
}

/**
 * Uploads a clinic photo (contract asset flow: request upload, PUT to the
 * pre-signed URL, confirm) and sets it as the clinic's cover photo.
 */
export function useSetClinicPhoto(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateClinicEverywhere(clinicId);
  return useMutation({
    mutationFn: async (file: File) => {
      const upload = await assetsService.requestUpload(api, clinicId, {
        kind: 'clinic_photo',
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
        original_filename: file.name,
      });
      await uploadToPresignedUrl(upload, file);
      const asset = await assetsService.confirm(api, clinicId, upload.asset.id);
      return clinicsService.update(api, clinicId, { cover_asset_id: asset.id });
    },
    onSuccess: invalidate,
  });
}

/** Practitioners, main one first. */
export function usePractitioners(clinicId: string, options: { enabled?: boolean } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'practitioners'),
    queryFn: () => practitionersService.list(api, clinicId, { limit: 50 }),
    enabled: options.enabled ?? true,
  });
}

/** The newest value of each metric (`latest=true`). */
export function useLatestSnapshots(clinicId: string, options: { enabled?: boolean } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'snapshots', 'latest'),
    queryFn: () => snapshotsService.list(api, clinicId, { latest: true, limit: 200 }),
    enabled: options.enabled ?? true,
  });
}

export function useClinicActivity(
  clinicId: string,
  query: { limit?: number; offset?: number } = {},
) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'activity', query),
    queryFn: () => auditEventsService.list(api, clinicId, query),
    placeholderData: keepPreviousData,
  });
}

// ── Several clinics at once (dashboards) ────────────────────────────────────
// One request per clinic, cached under the same keys as the single-clinic
// hooks, so opening a clinic afterwards reuses the data.

const SUMMARY_PAGE = { limit: 5 } as const;

export function useClinicsAssessments(clinicIds: ReadonlyArray<string>) {
  const api = useApiClient();
  return useQueries({
    queries: clinicIds.map((id) => ({
      queryKey: clinicQueryKey(id, 'assessments', SUMMARY_PAGE),
      queryFn: () => assessmentsService.list(api, id, SUMMARY_PAGE),
    })),
  });
}

export function useClinicsPresence(clinicIds: ReadonlyArray<string>) {
  const api = useApiClient();
  return useQueries({
    queries: clinicIds.map((id) => ({
      queryKey: clinicQueryKey(id, 'presence-profiles'),
      queryFn: () => presenceService.list(api, id),
    })),
  });
}

export function useClinicsActivity(clinicIds: ReadonlyArray<string>) {
  const api = useApiClient();
  return useQueries({
    queries: clinicIds.map((id) => ({
      queryKey: clinicQueryKey(id, 'activity', SUMMARY_PAGE),
      queryFn: () => auditEventsService.list(api, id, SUMMARY_PAGE),
    })),
  });
}

export function useClinicAssignments(clinicId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'assignments'),
    queryFn: () => assignmentsService.list(api, clinicId),
  });
}

export function useSetClinicAssignment(clinicId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => assignmentsService.set(api, clinicId, userId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'assignments') }),
        invalidatePlatformLists(queryClient),
      ]),
  });
}

export function usePresenceProfiles(clinicId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'presence-profiles'),
    queryFn: () => presenceService.list(api, clinicId),
  });
}

export function useUpdatePresenceProfile(clinicId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      profileId,
      body,
    }: {
      profileId: string;
      body: BodyOf<'/api/v1/clinics/{clinic_id}/presence-profiles/{profile_id}', 'patch'>;
    }) => presenceService.update(api, clinicId, profileId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'presence-profiles') }),
  });
}

export function useAssessments(
  clinicId: string,
  query: QueryOf<'/api/v1/clinics/{clinic_id}/assessments', 'get'> = {},
) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'assessments', query),
    queryFn: () => assessmentsService.list(api, clinicId, query),
    placeholderData: keepPreviousData,
  });
}

export function useAssessment(clinicId: string, assessmentId: string | null) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'assessment', assessmentId),
    queryFn: () => assessmentsService.get(api, clinicId, assessmentId!),
    enabled: assessmentId !== null,
  });
}

export function useRequestAssessment(clinicId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BodyOf<'/api/v1/clinics/{clinic_id}/assessments', 'post'> = {}) =>
      assessmentsService.request(api, clinicId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'assessments') }),
  });
}

export function useWorkItems(
  clinicId: string,
  query: QueryOf<'/api/v1/clinics/{clinic_id}/work-items', 'get'> = {},
) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'work-items', query),
    queryFn: () => workItemsService.list(api, clinicId, query),
  });
}

export function useConnections(clinicId: string, options: { enabled?: boolean } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'connections'),
    queryFn: () => connectionsService.list(api, clinicId),
    enabled: options.enabled ?? true,
  });
}

type ConnectionPlatform = Schema<'ConnectionPlatform'>;

export function useConnection(clinicId: string, platform: ConnectionPlatform) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'connections', platform),
    queryFn: () => connectionsService.get(api, clinicId, platform),
  });
}

function useInvalidateConnections(clinicId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: clinicQueryKey(clinicId, 'connections') });
}

/** Step 1 of Connect: the platform's sign-in address for this redirect URI. */
export function useStartConnection(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateConnections(clinicId);
  return useMutation({
    mutationFn: ({
      platform,
      redirectUri,
    }: {
      platform: ConnectionPlatform;
      redirectUri: string;
    }) => connectionsService.start(api, clinicId, platform, { redirect_uri: redirectUri }),
    onSettled: invalidate,
  });
}

/** Step 2 of Connect: hand the platform's `code` + `state` back to the API. */
export function useCompleteConnection(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateConnections(clinicId);
  return useMutation({
    mutationFn: ({
      platform,
      code,
      state,
    }: {
      platform: ConnectionPlatform;
      code: string;
      state: string;
    }) => connectionsService.complete(api, clinicId, platform, { code, state }),
    onSettled: invalidate,
  });
}

export function useDisconnectConnection(clinicId: string) {
  const api = useApiClient();
  const invalidate = useInvalidateConnections(clinicId);
  return useMutation({
    mutationFn: (platform: ConnectionPlatform) =>
      connectionsService.disconnect(api, clinicId, platform),
    onSettled: invalidate,
  });
}

/** A short-lived download URL for a clinic file (e.g. a chat attachment). */
export function useAssetDownloadUrl(clinicId: string, assetId: string | null) {
  const api = useApiClient();
  return useQuery({
    queryKey: clinicQueryKey(clinicId, 'asset-url', assetId),
    queryFn: () => assetsService.downloadUrl(api, clinicId, assetId!),
    enabled: assetId !== null,
    // Refresh well before the URL expires.
    staleTime: (query) => Math.max(0, ((query.state.data?.expires_in ?? 60) - 30) * 1000),
  });
}

// ── Chat (polling today, replaceable by WebSockets without screen changes) ──

type ChatMessage = Schema<'ChatMessageRead'>;

interface ChatCache {
  messages: ChatMessage[];
  hasMore: boolean;
  unreadCount: number;
}

const CHAT_PAGE_SIZE = 50;

function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map(existing.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  // Contract order: oldest first.
  return [...byId.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

/**
 * The clinic's chat. The ONE chat abstraction for screens: today it polls
 * (`after` = newest known message) only while `active`; a WebSocket
 * implementation can replace the internals without changing callers.
 */
export function useChatMessages(
  clinicId: string,
  options: { active: boolean; pollIntervalMs?: number },
) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const key = clinicQueryKey(clinicId, 'chat', 'messages');

  const query = useQuery({
    queryKey: key,
    queryFn: async (): Promise<ChatCache> => {
      const cached = queryClient.getQueryData<ChatCache>(key);
      const newest = cached?.messages.at(-1);
      if (!cached || !newest) {
        const page = await chatService.messages(api, clinicId, { limit: CHAT_PAGE_SIZE });
        return { messages: page.items, hasMore: page.has_more, unreadCount: page.unread_count };
      }
      const page = await chatService.messages(api, clinicId, {
        after: newest.id,
        limit: CHAT_PAGE_SIZE,
      });
      return {
        messages: mergeMessages(cached.messages, page.items),
        hasMore: cached.hasMore,
        unreadCount: page.unread_count,
      };
    },
    refetchInterval: options.active ? (options.pollIntervalMs ?? 5_000) : false,
    refetchIntervalInBackground: false,
    enabled: options.active,
  });

  const loadOlder = useCallback(async () => {
    const cached = queryClient.getQueryData<ChatCache>(key);
    const oldest = cached?.messages[0];
    if (!cached || !oldest || !cached.hasMore) return;
    const page = await chatService.messages(api, clinicId, {
      before: oldest.id,
      limit: CHAT_PAGE_SIZE,
    });
    queryClient.setQueryData<ChatCache>(key, (prev) =>
      prev
        ? { ...prev, messages: mergeMessages(prev.messages, page.items), hasMore: page.has_more }
        : prev,
    );
    // key is derived from clinicId; listing it would re-create the callback each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, clinicId, queryClient]);

  return useMemo(
    () => ({
      messages: query.data?.messages ?? [],
      hasMore: query.data?.hasMore ?? false,
      unreadCount: query.data?.unreadCount ?? 0,
      isLoading: query.isLoading,
      error: query.error,
      refetch: query.refetch,
      loadOlder,
    }),
    [query.data, query.isLoading, query.error, query.refetch, loadOlder],
  );
}

/**
 * A file to attach: a web `File`, or (React Native) a Blob read from the
 * picked document with its name passed alongside.
 */
export interface ChatAttachment {
  data: Blob;
  name: string;
}

/** Sends text and/or one attachment; attachments are uploaded first (contract flow). */
export function useSendChatMessage(clinicId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      body,
      file,
    }: {
      body: string | null;
      file?: File | ChatAttachment | null;
    }) => {
      let attachmentId: string | null = null;
      if (file) {
        const { data, name } = 'data' in file ? file : { data: file, name: file.name };
        const upload = await assetsService.requestUpload(api, clinicId, {
          kind: 'chat_attachment',
          mime_type: data.type || 'application/octet-stream',
          size_bytes: data.size,
          original_filename: name,
        });
        await uploadToPresignedUrl(upload, data);
        attachmentId = (await assetsService.confirm(api, clinicId, upload.asset.id)).id;
      }
      return chatService.send(api, clinicId, { body, attachment_asset_id: attachmentId });
    },
    onSuccess: (message) => {
      const key = clinicQueryKey(clinicId, 'chat', 'messages');
      queryClient.setQueryData<ChatCache>(key, (prev) =>
        prev ? { ...prev, messages: mergeMessages(prev.messages, [message]) } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: platformQueryKey('chat-inbox') });
    },
  });
}

export function useMarkChatRead(clinicId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (upToMessageId: string | null) =>
      chatService.markRead(api, clinicId, { up_to_message_id: upToMessageId }),
    onSuccess: () => {
      queryClient.setQueryData<ChatCache>(clinicQueryKey(clinicId, 'chat', 'messages'), (prev) =>
        prev ? { ...prev, unreadCount: 0 } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: platformQueryKey('chat-inbox') });
    },
  });
}
