import type { Schema } from '@radial-pulse/shared-types';

type ClinicStageGroup = Schema<'ClinicStageGroup'>;

/**
 * The status a clinic is shown with: the API's own stage group
 * (`ClinicRead.stage_group`, the `group` list filter, the dashboard tiles),
 * plus archived clinics as "inactive". The API owns the grouping; the
 * frontend only words it.
 */
export type ClinicStatus = 'prospect' | 'in_progress' | 'active' | 'inactive';

/** Every contract stage group as a status (a new group is a compile error). */
export const CLINIC_STATUS_OF_GROUP: Readonly<
  Record<ClinicStageGroup, Exclude<ClinicStatus, 'inactive'>>
> = {
  prospects: 'prospect',
  in_progress: 'in_progress',
  active: 'active',
};

/** The list `group` filter for a status (inactive = `archived=true`). */
export const CLINIC_STATUS_GROUP: Readonly<
  Record<Exclude<ClinicStatus, 'inactive'>, ClinicStageGroup>
> = {
  prospect: 'prospects',
  in_progress: 'in_progress',
  active: 'active',
};

export const CLINIC_STATUS_LABELS: Readonly<Record<ClinicStatus, string>> = {
  prospect: 'Prospective client',
  in_progress: 'In progress',
  active: 'Active',
  inactive: 'Inactive',
};

/** Plural labels for tabs and filters. */
export const CLINIC_STATUS_GROUP_LABELS: Readonly<Record<ClinicStatus, string>> = {
  prospect: 'Prospective clients',
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
export function clinicStatus(clinic: {
  stage_group: ClinicStageGroup;
  is_active: boolean;
}): ClinicStatus {
  return clinic.is_active ? CLINIC_STATUS_OF_GROUP[clinic.stage_group] : 'inactive';
}
