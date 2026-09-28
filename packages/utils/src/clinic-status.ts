import type { Schema } from '@radial-pulse/shared-types';

type ClinicStage = Schema<'ClinicStage'>;

/**
 * The status a clinic is shown with: the backend's own stage groups
 * (`DashboardSummary.prospects / in_progress / active`, and the clinics list
 * `stage` filter "Prospects tab = prospective_client + profile_enriched"),
 * plus archived clinics as "inactive". A display grouping of contract values,
 * not a new domain value: the API still stores and filters by `ClinicStage`.
 */
export type ClinicStatus = 'prospect' | 'in_progress' | 'active' | 'inactive';

/** Every contract stage in exactly one group (a new stage is a compile error). */
export const CLINIC_STATUS_OF_STAGE: Readonly<
  Record<ClinicStage, Exclude<ClinicStatus, 'inactive'>>
> = {
  prospective_client: 'prospect',
  profile_enriched: 'prospect',
  assessment_completed: 'in_progress',
  client_discussion: 'in_progress',
  active_client: 'active',
};

/** Stages to send as the list `stage` filter for a status (inactive = `archived=true`). */
export const CLINIC_STATUS_STAGES: Readonly<
  Record<Exclude<ClinicStatus, 'inactive'>, ClinicStage[]>
> = {
  prospect: ['prospective_client', 'profile_enriched'],
  in_progress: ['assessment_completed', 'client_discussion'],
  active: ['active_client'],
};

export const CLINIC_STATUS_LABELS: Readonly<Record<ClinicStatus, string>> = {
  prospect: 'Prospect',
  in_progress: 'In progress',
  active: 'Active',
  inactive: 'Inactive',
};

/** Plural labels for tabs and filters. */
export const CLINIC_STATUS_GROUP_LABELS: Readonly<Record<ClinicStatus, string>> = {
  prospect: 'Prospects',
  in_progress: 'In progress',
  active: 'Active',
  inactive: 'Inactive',
};

/** Display order: the journey, then inactive. */
export const CLINIC_STATUSES: ReadonlyArray<ClinicStatus> = [
  'active',
  'prospect',
  'in_progress',
  'inactive',
];

/** A clinic's status from its contract fields: archived first, else its stage group. */
export function clinicStatus(clinic: { stage: ClinicStage; is_active: boolean }): ClinicStatus {
  return clinic.is_active ? CLINIC_STATUS_OF_STAGE[clinic.stage] : 'inactive';
}
