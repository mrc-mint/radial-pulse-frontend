import type { components, Schema } from '@radial-pulse/shared-types';

/**
 * Display labels for contract enums. The API returns codes only (except
 * `ConnectionRead.label`), so the frontend owns the wording — but not the
 * values: every map is `Record<ContractEnum, string>`, so a value added to or
 * removed from the contract is a compile error here, never a silent gap.
 */
type Labels<K extends keyof components['schemas']> = Readonly<Record<Schema<K> & string, string>>;

export const PLATFORM_ROLE_LABELS: Labels<'PlatformRole'> = {
  platform_administrator: 'Platform Administrator',
  digital_success_manager: 'Digital Success Manager',
  // An account type, never a role name in the UI: clinic-side people are shown
  // by their clinic role (CLINIC_ROLE_LABELS), e.g. "Clinic Administrator".
  clinic_user: 'Clinic account',
};

export const CLINIC_ROLE_LABELS: Labels<'ClinicRole'> = {
  clinic_administrator: 'Clinic Administrator',
  clinic_team_member: 'Clinic Team Member',
};

export const CLINIC_STAGE_LABELS: Labels<'ClinicStage'> = {
  prospective_client: 'Prospective client',
  profile_enriched: 'Profile enriched',
  assessment_completed: 'Assessment completed',
  client_discussion: 'Client discussion',
  active_client: 'Active client',
};

export const ASSESSMENT_STATUS_LABELS: Labels<'AssessmentStatus'> = {
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  partial: 'Partially completed',
  failed: 'Failed',
};

export const COMPONENT_STATUS_LABELS: Labels<'ComponentStatus'> = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  not_available: 'Not Available',
};

/**
 * Assessment sections as named in the product: the `website` section is
 * shown as SEO and `search_readiness` as AEO (answer-engine readiness).
 */
export const ASSESSMENT_COMPONENT_LABELS: Labels<'AssessmentComponentKey'> = {
  website: 'SEO',
  google_business_profile: 'Google Business Profile',
  local_search: 'Local Search',
  search_readiness: 'AEO',
  social_presence: 'Social Presence',
  competitor_benchmark: 'Competitor Benchmark',
};

export const APPROVAL_STATE_LABELS: Labels<'ApprovalState'> = {
  draft: 'Draft',
  submitted: 'In review',
  approved: 'Approved',
  rejected: 'Rejected',
  redo_requested: 'Changes requested',
};

export const PUBLICATION_STATE_LABELS: Labels<'PublicationState'> = {
  unpublished: 'Not published',
  published: 'Published',
  retracted: 'Retracted',
};

export const FINDING_PRIORITY_LABELS: Labels<'FindingPriority'> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};

export const PRESENCE_PLATFORM_LABELS: Labels<'PresencePlatform'> = {
  website: 'Website',
  google_business_profile: 'Google Business Profile',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  x: 'X',
  practo: 'Practo',
  justdial: 'Justdial',
  other: 'Other',
};

export const PRESENCE_VERIFICATION_LABELS: Labels<'PresenceVerification'> = {
  unverified: 'Unverified',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
};

export const CONNECTION_STATUS_LABELS: Labels<'ConnectionStatus'> = {
  not_connected: 'Not connected',
  pending: 'Connecting',
  connected: 'Connected',
  needs_reconnect: 'Needs reconnect',
  disconnected: 'Disconnected',
};

export const WORK_ITEM_STATUS_LABELS: Labels<'WorkItemStatus'> = {
  todo: 'To do',
  in_progress: 'In progress',
  blocked: 'Blocked',
  in_review: 'In review',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const WORK_ITEM_PRIORITY_LABELS: Labels<'WorkItemPriority'> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const WORK_AREA_LABELS: Labels<'WorkArea'> = {
  ...ASSESSMENT_COMPONENT_LABELS,
  clinic_profile: 'Clinic profile',
  other: 'Other',
};

export const USER_STATUS_LABELS: Labels<'UserStatus'> = {
  invited: 'Invited',
  active: 'Active',
  deactivated: 'Deactivated',
};
