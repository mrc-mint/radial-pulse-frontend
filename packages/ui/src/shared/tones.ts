import type { SeverityTone, StatusTone } from '@radial-pulse/design-tokens';
import type { components, Schema } from '@radial-pulse/shared-types';

/**
 * Visual tone for each contract enum value — the ONE place contract codes
 * meet colours. Typed as `Record<ContractEnum, Tone>`, so a new or removed
 * value in the contract is a compile error. Tones are presentation only: they
 * never drive behaviour.
 */
type Tones<K extends keyof components['schemas']> = Readonly<
  Record<Schema<K> & string, StatusTone>
>;

export const CLINIC_STAGE_TONES: Tones<'ClinicStage'> = {
  prospective_client: 'neutral',
  profile_enriched: 'info',
  assessment_completed: 'warning',
  client_discussion: 'warning',
  active_client: 'success',
};

export const ASSESSMENT_STATUS_TONES: Tones<'AssessmentStatus'> = {
  queued: 'neutral',
  running: 'info',
  completed: 'success',
  partial: 'warning',
  failed: 'danger',
};

export const COMPONENT_STATUS_TONES: Tones<'ComponentStatus'> = {
  pending: 'info',
  completed: 'brand',
  failed: 'danger',
  not_available: 'neutral',
};

export const APPROVAL_STATE_TONES: Tones<'ApprovalState'> = {
  draft: 'neutral',
  submitted: 'info',
  approved: 'success',
  rejected: 'danger',
  redo_requested: 'warning',
};

export const PUBLICATION_STATE_TONES: Tones<'PublicationState'> = {
  unpublished: 'neutral',
  published: 'success',
  retracted: 'danger',
};

export const PRESENCE_VERIFICATION_TONES: Tones<'PresenceVerification'> = {
  unverified: 'warning',
  confirmed: 'success',
  rejected: 'neutral',
};

export const CONNECTION_STATUS_TONES: Tones<'ConnectionStatus'> = {
  not_connected: 'neutral',
  pending: 'info',
  connected: 'success',
  needs_reconnect: 'warning',
  disconnected: 'neutral',
};

export const WORK_ITEM_STATUS_TONES: Tones<'WorkItemStatus'> = {
  todo: 'neutral',
  in_progress: 'info',
  blocked: 'danger',
  in_review: 'warning',
  done: 'success',
  cancelled: 'neutral',
};

export const WORK_ITEM_PRIORITY_TONES: Tones<'WorkItemPriority'> = {
  low: 'neutral',
  normal: 'info',
  high: 'warning',
  urgent: 'danger',
};

export const USER_STATUS_TONES: Tones<'UserStatus'> = {
  invited: 'info',
  active: 'success',
  deactivated: 'neutral',
};

/** Finding priority uses the severity scale, whose steps match the contract 1:1. */
export const FINDING_PRIORITY_TONES: Readonly<Record<Schema<'FindingPriority'>, SeverityTone>> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
  info: 'info',
};
