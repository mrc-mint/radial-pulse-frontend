import { useApplyApprovalAction, useAssetDownloadUrl } from '@radial-pulse/api-client/react';
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
} from '@radial-pulse/ui/web';
import {
  approvalForResource,
  MEDIA_REVIEW_ACTION_LABELS,
  mediaReviewDecisions,
  mediaReviewLabel,
  type MediaReviewDecision,
} from '@radial-pulse/utils';
import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { mutationErrorMessage } from '../../app/page-kit';

type Asset = Schema<'AssetRead'>;

/**
 * Review one clinic photo or voice sample: view it (protected viewer, no
 * download), see its review status and the last reviewer note, and approve,
 * request a retake or reject it when allowed. A retake or rejection needs a
 * note, so the clinic knows what to change.
 */
export function MediaReviewDialog({
  clinicId,
  asset,
  title,
  approvals,
  canDecide,
  onClose,
}: {
  clinicId: string;
  asset: Asset;
  title: string;
  approvals: ReadonlyArray<Schema<'ApprovalRead'>>;
  canDecide: boolean;
  onClose: () => void;
}) {
  const url = useAssetDownloadUrl(clinicId, asset.id);
  const apply = useApplyApprovalAction(clinicId);
  const [note, setNote] = useState('');
  const approval = approvalForResource(approvals, asset.id);
  // Actions need the approval record: it carries the resource_type to send.
  const decisions = approval ? mediaReviewDecisions(asset.approval_state, canDecide) : [];
  const isAudio = asset.kind === 'audio';
  const decisionLabel = (d: MediaReviewDecision) =>
    d === 'redo' && isAudio ? 'Request re-record' : MEDIA_REVIEW_ACTION_LABELS[d];

  const decide = (action: MediaReviewDecision) => {
    if (!approval) return;
    apply.mutate(
      {
        resource_type: approval.resource_type,
        resource_id: approval.resource_id,
        action,
        comment: note.trim() || null,
      },
      { onSuccess: onClose },
    );
  };
  const needsNote = note.trim().length < 3;

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={title}
      description={asset.original_filename ?? undefined}
      footer={
        decisions.length > 0 ? (
          <>
            {decisions.includes('reject') && (
              <Button
                variant="danger"
                disabled={needsNote || apply.isPending}
                onClick={() => decide('reject')}
              >
                {decisionLabel('reject')}
              </Button>
            )}
            {decisions.includes('redo') && (
              <Button
                variant="secondary"
                disabled={needsNote || apply.isPending}
                onClick={() => decide('redo')}
              >
                {decisionLabel('redo')}
              </Button>
            )}
            {decisions.includes('approve') && (
              <Button loading={apply.isPending} onClick={() => decide('approve')}>
                {decisionLabel('approve')}
              </Button>
            )}
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
          {approval?.last_comment && (
            <div>
              <dt>Reviewer note</dt>
              <dd>{approval.last_comment}</dd>
            </div>
          )}
        </dl>

        {decisions.length > 0 && (
          <Input
            label="Note to the clinic"
            hint="Required to request a retake or reject. Optional when approving."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={2000}
          />
        )}
        {decisions.length === 0 && asset.approval_state === 'submitted' && (
          <p className="rp-media-review__hint">
            {canDecide
              ? 'This file has no review record yet.'
              : 'You can view this file, but reviewing it needs approval permission.'}
          </p>
        )}
        {apply.isError && (
          <p className="rp-form__error" role="alert">
            {mutationErrorMessage(apply.error)}
          </p>
        )}
      </div>
    </Modal>
  );
}
