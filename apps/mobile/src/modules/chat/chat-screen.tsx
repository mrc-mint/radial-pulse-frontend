import {
  useAssetDownloadUrl,
  useChatMessages,
  useMarkChatRead,
  useSendChatMessage,
  type ChatAttachment,
} from '@radial-pulse/api-client-react';
import { tokens as t } from '@radial-pulse/design-tokens';
import { useClinicCan, useClinicId } from '@radial-pulse/shell-core';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Avatar,
  EmptyState,
  fontStyle,
  formatDate,
  IconButton,
  LoadingState,
  textStyle,
} from '@radial-pulse/mobile-ui';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { FileText, MessageCircle, Paperclip, Send, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelectedClinicRow } from '../../shell/clinic-data';
import { Callout, mutationErrorMessage, QueryErrorState } from '../../shell/kit';

type Message = Schema<'ChatMessageRead'>;

const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

function dayLabel(iso: string) {
  const day = new Date(iso).toDateString();
  if (day === new Date().toDateString()) return 'Today';
  if (day === new Date(Date.now() - 86_400_000).toDateString()) return 'Yesterday';
  return formatDate(iso);
}

/**
 * Chat with the clinic's Digital Success Manager (modal from the floating
 * button). Polled while open and the app is in the foreground; the chat hook
 * hides how messages arrive. No presence or calling: not in the contract.
 */
export function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const clinicId = useClinicId();
  const clinic = useSelectedClinicRow();
  const canWrite = useClinicCan(clinicId, 'chat:write');
  const chat = useChatMessages(clinicId, { active: true });
  const markRead = useMarkChatRead(clinicId);
  const scroller = useRef<ScrollView>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const dsmName = clinic?.dsm?.full_name ?? clinic?.dsm?.email ?? null;

  const newest = chat.messages.at(-1);
  const { mutate: markReadMutate } = markRead;
  useEffect(() => {
    if (newest && chat.unreadCount > 0) markReadMutate(newest.id);
  }, [newest, chat.unreadCount, markReadMutate]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + t.space[2] }]}>
        <IconButton
          label="Close chat"
          variant="ghost"
          icon={<X size={22} color={t.color.text.primary} />}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
        />
        <Avatar name={dsmName ?? 'Digital Success Manager'} size="md" decorative />
        <View style={styles.headerText}>
          <Text style={styles.headerName} numberOfLines={1} accessibilityRole="header">
            {dsmName ?? 'Your Digital Success Manager'}
          </Text>
          <Text style={styles.headerRole} numberOfLines={1}>
            {dsmName ? 'Your Digital Success Manager' : (clinic?.name ?? '')}
          </Text>
        </View>
      </View>

      {chat.error ? (
        <QueryErrorState error={chat.error} onRetry={() => void chat.refetch()} />
      ) : chat.isLoading ? (
        <LoadingState label="Loading conversation…" />
      ) : (
        <ScrollView
          ref={scroller}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })}
          accessibilityLabel="Messages"
        >
          {chat.hasMore ? (
            <Pressable
              accessibilityRole="button"
              onPress={async () => {
                setLoadingOlder(true);
                await chat.loadOlder().finally(() => setLoadingOlder(false));
              }}
              style={styles.older}
            >
              <Text style={styles.olderText}>
                {loadingOlder ? 'Loading…' : 'Load earlier messages'}
              </Text>
            </Pressable>
          ) : null}
          {chat.messages.length === 0 ? (
            <EmptyState
              icon={<MessageCircle size={22} color={t.color.text.tertiary} />}
              title="No messages yet"
              description="Send a message to your Digital Success Manager. They’ll reply here."
            />
          ) : (
            chat.messages.map((m, i) => {
              const previous = chat.messages[i - 1];
              const showDay = !previous || dayLabel(previous.created_at) !== dayLabel(m.created_at);
              return (
                <View key={m.id}>
                  {showDay ? <Text style={styles.day}>{dayLabel(m.created_at)}</Text> : null}
                  <Bubble message={m} clinicId={clinicId} />
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {canWrite ? (
        <Composer clinicId={clinicId} bottomInset={insets.bottom} />
      ) : (
        <View style={[styles.readOnly, { paddingBottom: insets.bottom + t.space[3] }]}>
          <Text style={styles.readOnlyText}>You can read this conversation.</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function Bubble({ message, clinicId }: { message: Message; clinicId: string }) {
  const mine = message.sender_side === 'clinic';
  const time = TIME.format(new Date(message.created_at));
  return (
    <View
      style={[styles.bubbleRow, mine && styles.bubbleRowMine]}
      accessible
      accessibilityLabel={`${mine ? 'You' : message.sender_name}, ${time}: ${message.body ?? 'Attachment'}`}
    >
      {!mine ? <Text style={styles.sender}>{message.sender_name}</Text> : null}
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {message.body ? (
          <Text style={[styles.body, mine && styles.bodyMine]}>{message.body}</Text>
        ) : null}
        {message.attachment_asset_id ? (
          <AttachmentChip clinicId={clinicId} assetId={message.attachment_asset_id} mine={mine} />
        ) : null}
      </View>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
}

/**
 * An attachment. The contract carries no file name for chat attachments, so
 * it reads "Attachment"; opening fetches a short-lived download URL.
 */
function AttachmentChip({
  clinicId,
  assetId,
  mine,
}: {
  clinicId: string;
  assetId: string;
  mine: boolean;
}) {
  const [requested, setRequested] = useState(false);
  const download = useAssetDownloadUrl(clinicId, requested ? assetId : null);

  useEffect(() => {
    if (requested && download.data) {
      void WebBrowser.openBrowserAsync(download.data.url);
      setRequested(false);
    }
  }, [requested, download.data]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open attachment"
      onPress={() => setRequested(true)}
      style={[styles.attachment, mine && styles.attachmentMine]}
    >
      <FileText size={18} color={mine ? t.color.text.onAction : t.color.text.link} />
      <Text style={[styles.attachmentText, mine && styles.bodyMine]}>
        {download.isError ? 'Attachment unavailable' : requested ? 'Opening…' : 'Attachment'}
      </Text>
    </Pressable>
  );
}

function Composer({ clinicId, bottomInset }: { clinicId: string; bottomInset: number }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<(ChatAttachment & { size: number }) | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const send = useSendChatMessage(clinicId);
  const body = text.trim();

  async function pick() {
    setPickError(null);
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return;
    try {
      // Read the picked file as a Blob for the pre-signed upload.
      // eslint-disable-next-line no-restricted-globals -- reads a local file URI from the picker, not an API call
      const data = await (await fetch(asset.uri)).blob();
      setFile({ data, name: asset.name, size: asset.size ?? data.size });
    } catch {
      setPickError('That file couldn’t be attached. Please try another.');
    }
  }

  function submit() {
    if (!body && !file) return;
    send.mutate(
      { body: body || null, file },
      {
        onSuccess: () => {
          setText('');
          setFile(null);
        },
      },
    );
  }

  const error = pickError ?? (send.isError ? mutationErrorMessage(send.error) : null);

  return (
    <View style={[styles.composer, { paddingBottom: bottomInset + t.space[2] }]}>
      {error ? <Callout tone="danger">{error}</Callout> : null}
      {file ? (
        <View style={styles.pending}>
          <FileText size={16} color={t.color.text.secondary} />
          <Text style={styles.pendingName} numberOfLines={1}>
            {file.name}
          </Text>
          <IconButton
            label={`Remove ${file.name}`}
            variant="ghost"
            size="sm"
            icon={<X size={16} color={t.color.text.secondary} />}
            onPress={() => setFile(null)}
          />
        </View>
      ) : null}
      <View style={styles.composerRow}>
        <IconButton
          label="Attach a file"
          variant="ghost"
          icon={<Paperclip size={22} color={t.color.text.secondary} />}
          disabled={send.isPending}
          onPress={() => void pick()}
        />
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          placeholderTextColor={t.color.text.disabled}
          accessibilityLabel="Message"
          multiline
          editable={!send.isPending}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: (!body && !file) || send.isPending }}
          disabled={(!body && !file) || send.isPending}
          onPress={submit}
          style={({ pressed }) => [
            styles.send,
            ((!body && !file) || send.isPending) && styles.sendDisabled,
            pressed && styles.sendPressed,
          ]}
        >
          <Send size={20} color={t.color.text.onAction} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.color.bg.app },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space[2],
    paddingHorizontal: t.space[2],
    paddingBottom: t.space[3],
    backgroundColor: t.color.bg.surface,
    borderBottomWidth: 1,
    borderBottomColor: t.color.border.default,
  },
  headerText: { flex: 1, gap: 2 },
  headerName: { ...textStyle('h3'), color: t.color.text.primary },
  headerRole: { ...textStyle('bodySm'), color: t.color.text.tertiary },
  messages: { flex: 1 },
  messagesContent: { gap: t.space[3], padding: t.space[4] },
  older: { alignSelf: 'center', minHeight: t.size.touchTarget, justifyContent: 'center' },
  olderText: { ...textStyle('label'), color: t.color.text.link },
  day: {
    alignSelf: 'center',
    marginVertical: t.space[2],
    paddingHorizontal: t.space[3],
    paddingVertical: t.space[1],
    borderRadius: t.radius.full,
    backgroundColor: t.color.bg.muted,
    overflow: 'hidden',
    ...textStyle('caption'),
    color: t.color.text.secondary,
  },
  bubbleRow: { alignItems: 'flex-start', gap: 2, maxWidth: '85%' },
  bubbleRowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  sender: { ...textStyle('caption'), color: t.color.text.tertiary, marginLeft: t.space[1] },
  bubble: {
    gap: t.space[2],
    paddingHorizontal: t.space[3],
    paddingVertical: t.space[2],
    borderRadius: t.radius.xl,
  },
  bubbleTheirs: {
    backgroundColor: t.color.bg.surface,
    borderWidth: 1,
    borderColor: t.color.border.default,
    borderBottomLeftRadius: t.radius.sm,
  },
  bubbleMine: { backgroundColor: t.color.action.primary.bg, borderBottomRightRadius: t.radius.sm },
  body: { ...textStyle('bodyLg'), color: t.color.text.primary },
  bodyMine: { color: t.color.text.onAction },
  time: { ...textStyle('caption'), color: t.color.text.tertiary, marginHorizontal: t.space[1] },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space[2],
    minHeight: t.size.touchTarget,
    paddingHorizontal: t.space[3],
    borderRadius: t.radius.lg,
    backgroundColor: t.color.status.brand.bg,
  },
  attachmentMine: { backgroundColor: 'rgba(255, 255, 255, 0.18)' },
  attachmentText: { ...textStyle('label'), ...fontStyle(600), color: t.color.text.link },
  composer: {
    gap: t.space[2],
    paddingHorizontal: t.space[3],
    paddingTop: t.space[2],
    backgroundColor: t.color.bg.surface,
    borderTopWidth: 1,
    borderTopColor: t.color.border.default,
  },
  pending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space[2],
    paddingLeft: t.space[3],
    borderRadius: t.radius.lg,
    backgroundColor: t.color.bg.muted,
  },
  pendingName: { ...textStyle('bodySm'), flex: 1, color: t.color.text.secondary },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: t.space[2] },
  input: {
    ...textStyle('bodyLg'),
    flex: 1,
    minHeight: t.size.touchTarget,
    maxHeight: 120,
    paddingHorizontal: t.space[4],
    paddingTop: t.space[3],
    paddingBottom: t.space[3],
    borderRadius: t.radius['2xl'],
    borderWidth: 1,
    borderColor: t.color.border.default,
    backgroundColor: t.color.bg.subtle,
    color: t.color.text.primary,
  },
  send: {
    width: t.size.touchTarget,
    height: t.size.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
    backgroundColor: t.color.action.primary.bg,
  },
  sendDisabled: { backgroundColor: t.color.border.strong },
  sendPressed: { backgroundColor: t.color.action.primary.bgActive },
  readOnly: { padding: t.space[3], backgroundColor: t.color.bg.surface },
  readOnlyText: { ...textStyle('bodySm'), color: t.color.text.tertiary, textAlign: 'center' },
});
