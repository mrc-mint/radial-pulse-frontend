import {
  useAssetDownloadUrl,
  useChatMessages,
  useMarkChatRead,
  useSendChatMessage,
} from '@radial-pulse/api-client/react';
import { useClinicCan, useClinicId, useCurrentSession } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  formatDate,
  IconButton,
  LoadingState,
} from '@radial-pulse/ui/web';
import { MessageCircle, Paperclip, Send, X } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { mutationErrorMessage, QueryError } from '../../app/page-kit';
import './chat.css';

type Message = Schema<'ChatMessageRead'>;

const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** Polling only while the tab is visible (V1 chat is polled, not pushed). */
function usePageVisible(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange);
      return () => document.removeEventListener('visibilitychange', onChange);
    },
    () => document.visibilityState !== 'hidden',
    () => true,
  );
}

export function ChatPage() {
  const clinicId = useClinicId();
  const session = useCurrentSession();
  const visible = usePageVisible();
  const chat = useChatMessages(clinicId, { active: visible });
  const markRead = useMarkChatRead(clinicId);
  const canWrite = useClinicCan(clinicId, 'chat:write');
  const listRef = useRef<HTMLOListElement>(null);
  const stickToBottom = useRef(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const newest = chat.messages.at(-1);

  // Keep the newest message in view unless the reader has scrolled up.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [newest?.id]);

  // Seen while visible → mark read up to the newest message.
  const { mutate: markReadMutate } = markRead;
  useEffect(() => {
    if (visible && newest && chat.unreadCount > 0) markReadMutate(newest.id);
  }, [visible, newest, chat.unreadCount, markReadMutate]);

  if (chat.error) {
    return (
      <Card>
        <QueryError error={chat.error} onRetry={() => void chat.refetch()} />
      </Card>
    );
  }

  return (
    <Card padding="none" className="rp-chat">
      <div className="rp-chat__messages-wrap">
        {chat.isLoading ? (
          <LoadingState label="Loading conversation…" />
        ) : chat.messages.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={22} />}
            title="No messages yet"
            description={
              canWrite ? 'Start the conversation with this client.' : 'Messages will appear here.'
            }
          />
        ) : (
          <ol
            ref={listRef}
            className="rp-chat__messages"
            aria-label="Messages"
            aria-live="polite"
            onScroll={(e) => {
              const el = e.currentTarget;
              stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
            }}
          >
            {chat.hasMore && (
              <li className="rp-chat__older">
                <Button
                  variant="ghost"
                  size="sm"
                  loading={loadingOlder}
                  onClick={async () => {
                    setLoadingOlder(true);
                    stickToBottom.current = false;
                    try {
                      await chat.loadOlder();
                    } finally {
                      setLoadingOlder(false);
                    }
                  }}
                >
                  Load earlier messages
                </Button>
              </li>
            )}
            {chat.messages.map((m, i) => (
              <MessageItem
                key={m.id}
                clinicId={clinicId}
                message={m}
                mine={m.sender_user_id === session.user.id}
                showDay={i === 0 || !sameDay(chat.messages[i - 1]!.created_at, m.created_at)}
              />
            ))}
          </ol>
        )}
      </div>
      {canWrite ? (
        <Composer clinicId={clinicId} onSent={() => (stickToBottom.current = true)} />
      ) : (
        <p className="rp-chat__readonly">You can read this conversation but not reply.</p>
      )}
    </Card>
  );
}

function sameDay(a: string, b: string) {
  return formatDate(a) === formatDate(b);
}

function MessageItem({
  clinicId,
  message: m,
  mine,
  showDay,
}: {
  clinicId: string;
  message: Message;
  mine: boolean;
  showDay: boolean;
}) {
  return (
    <>
      {showDay && (
        <li className="rp-chat__day" aria-hidden="true">
          <span>{formatDate(m.created_at)}</span>
        </li>
      )}
      <li className="rp-chat__message" data-mine={mine || undefined}>
        {!mine && <Avatar name={m.sender_name} size="sm" decorative />}
        <div className="rp-chat__bubble">
          <p className="rp-chat__meta">
            <span className="rp-chat__sender">{mine ? 'You' : m.sender_name}</span>
            <time dateTime={m.created_at}>{TIME.format(new Date(m.created_at))}</time>
          </p>
          {m.body && <p className="rp-chat__body">{m.body}</p>}
          {m.attachment_asset_id && (
            <Attachment clinicId={clinicId} assetId={m.attachment_asset_id} />
          )}
        </div>
      </li>
    </>
  );
}

/** Attachment link from a short-lived download URL (contract `download-url`). */
function Attachment({ clinicId, assetId }: { clinicId: string; assetId: string }) {
  const download = useAssetDownloadUrl(clinicId, assetId);
  return (
    <p className="rp-chat__attachment">
      <Paperclip size={14} aria-hidden="true" />
      {download.data ? (
        <a href={download.data.url} target="_blank" rel="noopener noreferrer" className="rp-link">
          Open attachment<span className="rp-sr-only"> (opens in a new tab)</span>
        </a>
      ) : download.isError ? (
        <span className="rp-muted">Attachment unavailable</span>
      ) : (
        <span className="rp-muted">Preparing attachment…</span>
      )}
    </p>
  );
}

const MAX_FILE_BYTES = 20 * 1024 * 1024;

function Composer({ clinicId, onSent }: { clinicId: string; onSent: () => void }) {
  const send = useSendChatMessage(clinicId);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const textareaId = useId();
  const canSend = (text.trim() !== '' || file !== null) && !send.isPending;

  function submit() {
    if (!canSend) return;
    send.mutate(
      { body: text.trim() || null, file },
      {
        onSuccess: () => {
          setText('');
          setFile(null);
          onSent();
        },
      },
    );
  }

  return (
    <form
      className="rp-chat__composer"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {(file || fileError || send.isError) && (
        <div className="rp-chat__composer-status">
          {file && (
            <span className="rp-chat__file">
              <Paperclip size={14} aria-hidden="true" />
              {file.name}
              <IconButton
                size="sm"
                label={`Remove ${file.name}`}
                icon={<X size={14} />}
                onClick={() => setFile(null)}
              />
            </span>
          )}
          {(fileError || send.isError) && (
            <p className="rp-form__error" role="alert">
              {fileError ?? mutationErrorMessage(send.error)}
            </p>
          )}
        </div>
      )}
      <div className="rp-chat__composer-row">
        <input
          ref={fileInput}
          type="file"
          hidden
          onChange={(e) => {
            const picked = e.target.files?.[0] ?? null;
            e.target.value = '';
            if (picked && picked.size > MAX_FILE_BYTES) {
              setFileError('Files can be up to 20 MB.');
              return;
            }
            setFileError(null);
            setFile(picked);
          }}
        />
        <IconButton
          label="Attach a file"
          icon={<Paperclip size={18} />}
          onClick={() => fileInput.current?.click()}
          disabled={send.isPending}
        />
        <label htmlFor={textareaId} className="rp-sr-only">
          Message
        </label>
        <textarea
          id={textareaId}
          className="rp-chat__input"
          rows={1}
          placeholder="Write a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button
          type="submit"
          leadingIcon={<Send size={16} />}
          loading={send.isPending}
          disabled={!canSend}
        >
          Send
        </Button>
      </div>
      <p className="rp-chat__hint">Enter to send · Shift + Enter for a new line</p>
    </form>
  );
}
