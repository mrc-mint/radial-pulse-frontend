import { useAssetDownloadUrl, useReviewAsset } from '@radial-pulse/api-client-react';
import type { Schema } from '@radial-pulse/shared-types';
import {
  APPROVAL_STATE_TONES,
  Badge,
  Button,
  formatDateTime,
  Input,
  Modal,
  ProtectedAudio,
  ProtectedImage,
} from '@radial-pulse/web-ui';
import { MEDIA_REVIEW_ACTION_LABELS, mediaActions, mediaReviewLabel } from '@radial-pulse/utils';
import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { mutationErrorMessage } from '../../app/page-kit';

type Asset = Schema<'AssetRead'>;
type Action = Schema<'ApprovalAction'>;

/** Actions that send a file back: the clinic must be told why. */
const NEEDS_MESSAGE: ReadonlySet<Action> = new Set(['redo', 'reject']);
/** Button order: send back first, approve last (primary). */
const ORDER: ReadonlyArray<Action> = ['reject', 'redo', 'submit', 'handoff', 'publish', 'approve'];

/**
 * Review one clinic photo or voice sample: view it (protected viewer, no
 * download), see its review status and notes, and take the actions the API
 * offers (`review.available_actions`). A retake or rejection needs a message
 * the clinic reads; the internal note stays with Radial Pulse staff.
 */
export function MediaReviewDialog({
  clinicId,
  asset,
  title,
  onClose,
}: {
  clinicId: string;
  asset: Asset;
  title: string;
  onClose: () => void;
}) {
  const url = useAssetDownloadUrl(clinicId, asset.id);
  const review = useReviewAsset(clinicId);
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const actions = ORDER.filter((a) => mediaActions(asset).includes(a));
  const isAudio = asset.kind === 'audio';
  const label = (a: Action) =>
    a === 'redo' && isAudio ? 'Request re-record' : MEDIA_REVIEW_ACTION_LABELS[a];
  const hasMessage = message.trim().length >= 3;

  const decide = (action: Action) =>
    review.mutate(
      { assetId: asset.id, action, clinicMessage: message.trim(), internalNote: note.trim() },
      { onSuccess: onClose },
    );

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={title}
      description={asset.original_filename ?? undefined}
      footer={
        actions.length > 0 ? (
          <>
            {actions.map((action) => (
              <Button
                key={action}
                variant={
                  action === 'approve' ? 'primary' : action === 'reject' ? 'danger' : 'secondary'
                }
                loading={review.isPending && action === 'approve'}
                disabled={review.isPending || (NEEDS_MESSAGE.has(action) && !hasMessage)}
                onClick={() => decide(action)}
              >
                {label(action)}
              </Button>
            ))}
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      <div className="rp-media-review">
        {isAudio ? (
          <ProtectedAudio src={url.data?.url} label={title} />
        ) : (
          <div className="rp-media-review__photo">
            <ProtectedImage
              src={url.data?.url}
              alt={title}
              fit="contain"
              placeholder={url.isError ? <ImageOff size={24} aria-hidden="true" /> : null}
            />
          </div>
        )}
        {url.isError && (
          <p className="rp-form__error" role="alert">
            This file could not be loaded. It may have been removed, or you may not have access.
          </p>
        )}

        <dl className="rp-media-review__facts">
          <div>
            <dt>Status</dt>
            <dd>
              <Badge tone={APPROVAL_STATE_TONES[asset.approval_state]}>
                {mediaReviewLabel(asset.approval_state, asset.kind)}
              </Badge>
            </dd>
          </div>
          <div>
            <dt>Uploaded</dt>
            <dd>
              {formatDateTime(asset.created_at)}
              {asset.version > 1 ? ` · Version ${asset.version}` : ''}
            </dd>
          </div>
          {asset.review?.clinic_message && (
            <div>
              <dt>Message to the client</dt>
              <dd>{asset.review.clinic_message}</dd>
            </div>
          )}
          {asset.review?.internal_note && (
            <div>
              <dt>Internal note</dt>
              <dd>{asset.review.internal_note}</dd>
            </div>
          )}
        </dl>

        {actions.length > 0 && (
          <div className="rp-form">
            <Input
              label="Message to the client"
              hint="The client sees this. Required to request a retake or reject."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
            />
            <Input
              label="Internal note"
              hint="Optional. Only Radial Pulse staff see this."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={2000}
            />
          </div>
        )}
        {actions.length === 0 && asset.approval_state === 'submitted' && (
          <p className="rp-media-review__hint">You can view this file, but you can’t review it.</p>
        )}
        {review.isError && (
          <p className="rp-form__error" role="alert">
            {mutationErrorMessage(review.error)}
          </p>
        )}
      </div>
    </Modal>
  );
}
