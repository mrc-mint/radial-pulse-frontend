import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ClinicSummary } from './session';

/**
 * Clinic context (architecture §4, decision 5g).
 *
 * Every clinic-scoped screen reads the clinic from here — never from its own
 * props or storage — and every clinic-scoped query key includes this clinicId
 * (see `clinicQueryKey` in @radial-pulse/api-client/react), so one clinic's
 * data can never render under another.
 *
 *   web:    the clinic route (/clinics/$clinicId/…) provides ClinicScopeProvider
 *   mobile: ClinicSelectionProvider picks the clinic (Home switcher) and
 *           provides the same scope
 */
const ClinicScopeContext = createContext<string | null>(null);

export function ClinicScopeProvider({
  clinicId,
  children,
}: {
  clinicId: string;
  children: ReactNode;
}) {
  return <ClinicScopeContext.Provider value={clinicId}>{children}</ClinicScopeContext.Provider>;
}

/** The current clinic. Throws outside a clinic scope — a routing bug, not a user error. */
export function useClinicId(): string {
  const clinicId = useContext(ClinicScopeContext);
  if (!clinicId) throw new Error('useClinicId must be used inside a clinic scope.');
  return clinicId;
}

export function useOptionalClinicId(): string | null {
  return useContext(ClinicScopeContext);
}

// ── Selection (Clinic Administrator, one or more clinics) ───────────────────

/**
 * Which clinic to show: the requested one if the user still has access,
 * otherwise the first available clinic. Null when the user has none.
 */
export function resolveSelectedClinic(
  clinics: ReadonlyArray<ClinicSummary>,
  requestedId: string | null | undefined,
): ClinicSummary | null {
  return clinics.find((c) => c.id === requestedId) ?? clinics[0] ?? null;
}

export interface ClinicSelection {
  clinics: ReadonlyArray<ClinicSummary>;
  selectedClinic: ClinicSummary | null;
  /** The switcher is shown only when this is true. */
  hasMultipleClinics: boolean;
  selectClinic: (clinicId: string) => void;
}

const ClinicSelectionContext = createContext<ClinicSelection | null>(null);

export function ClinicSelectionProvider({
  clinics,
  initialClinicId,
  onChange,
  children,
}: {
  clinics: ReadonlyArray<ClinicSummary>;
  /** e.g. the last selection, restored by the app from device storage. */
  initialClinicId?: string | null;
  onChange?: (clinicId: string) => void;
  children: ReactNode;
}) {
  const [requestedId, setRequestedId] = useState(initialClinicId ?? null);
  const selectedClinic = resolveSelectedClinic(clinics, requestedId);

  const selectClinic = useCallback(
    (clinicId: string) => {
      if (!clinics.some((c) => c.id === clinicId)) return;
      setRequestedId(clinicId);
      onChange?.(clinicId);
    },
    [clinics, onChange],
  );

  const value = useMemo<ClinicSelection>(
    () => ({ clinics, selectedClinic, hasMultipleClinics: clinics.length > 1, selectClinic }),
    [clinics, selectedClinic, selectClinic],
  );

  return (
    <ClinicSelectionContext.Provider value={value}>
      {selectedClinic ? (
        // Keyed so clinic-scoped state below resets when the clinic changes.
        <ClinicScopeProvider key={selectedClinic.id} clinicId={selectedClinic.id}>
          {children}
        </ClinicScopeProvider>
      ) : (
        children
      )}
    </ClinicSelectionContext.Provider>
  );
}

export function useClinicSelection(): ClinicSelection {
  const selection = useContext(ClinicSelectionContext);
  if (!selection)
    throw new Error('useClinicSelection must be used inside <ClinicSelectionProvider>.');
  return selection;
}
