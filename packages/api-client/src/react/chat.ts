import type { Schema } from '@radial-pulse/shared-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { chatService, uploadAsset, type UploadFile } from '../services';
import { useApiClient, useStorageFetch } from './provider';
import { clinicQueryKey, platformQueryKey } from './query-keys';

/** Chat (polling today, replaceable by WebSockets without screen changes). */

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
export type ChatAttachment = UploadFile;

/** Sends text and/or one attachment; attachments are uploaded first (contract flow). */
export function useSendChatMessage(clinicId: string) {
  const api = useApiClient();
  const storageFetch = useStorageFetch();
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
        const attachment = 'data' in file ? file : { data: file, name: file.name };
        const asset = await uploadAsset(
          api,
          clinicId,
          { kind: 'chat_attachment', file: attachment },
          storageFetch,
        );
        attachmentId = asset.id;
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
