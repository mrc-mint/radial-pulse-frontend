import { useAssessment, useAssessments, useClinics } from '@radial-pulse/api-client/react';
import { useClinicId } from '@radial-pulse/platform-shell/core';

/**
 * The clinics list request used for the clinic switcher. The API scopes it to
 * the caller's clinics; screens read the selected clinic's row from the same
 * cached response.
 */
export const CLINICS_QUERY = { limit: 200 } as const;

export function useAccessibleClinics() {
  return useClinics(CLINICS_QUERY);
}

/** The selected clinic's list row (`ClinicListItem`: name, city, doctor, DSM). */
export function useSelectedClinicRow() {
  const clinicId = useClinicId();
  const clinics = useAccessibleClinics();
  return clinics.data?.items.find((c) => c.id === clinicId) ?? null;
}

/**
 * The clinic's assessments. For a Clinic Administrator the API returns
 * published assessments only; the list is newest first.
 */
export function usePublishedAssessments() {
  const clinicId = useClinicId();
  return useAssessments(clinicId, { limit: 50 });
}

/** Detail of one assessment, or of the latest published one when `assessmentId` is null. */
export function useAssessmentDetail(assessmentId: string | null) {
  const clinicId = useClinicId();
  const list = usePublishedAssessments();
  const id = assessmentId ?? list.data?.items[0]?.id ?? null;
  const detail = useAssessment(clinicId, id);
  return {
    list,
    detail,
    /** True once the list has loaded and there is nothing published. */
    none: list.isSuccess && list.data.items.length === 0 && assessmentId === null,
    isLoading: list.isLoading || (id !== null && detail.isLoading),
    error: list.error ?? detail.error,
    refetch: () => Promise.all([list.refetch(), id ? detail.refetch() : null]),
  };
}
