import {
  useArchiveClinic,
  useChangeClinicStage,
  useRestoreClinic,
} from '@radial-pulse/api-client-react';
import type { Schema } from '@radial-pulse/shared-types';
import { Button, DropdownMenu, Input, Modal, Select } from '@radial-pulse/web-ui';
import { CLINIC_STAGE_LABELS } from '@radial-pulse/utils';
import { Archive, ArchiveRestore, ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';
import { fieldErrors, mutationErrorMessage } from '../../app/page-kit';

type Clinic = Schema<'ClinicRead'>;
type Stage = Schema<'ClinicStage'>;

const STAGES = Object.keys(CLINIC_STAGE_LABELS) as Stage[];

/**
 * "More" actions for a clinic (Radial Pulse staff, `clinics:manage`):
 * change status (the contract stage), archive with a reason, or restore.
 */
export function ClinicMoreMenu({ clinic }: { clinic: Clinic }) {
  const [dialog, setDialog] = useState<'status' | 'archive' | null>(null);
  const restore = useRestoreClinic(clinic.id);

  return (
    <>
      <DropdownMenu
        label="More"
        trigger="button"
        triggerVariant="secondary"
        align="end"
        items={
          clinic.is_active
            ? [
                {
                  id: 'status',
                  label: 'Change status',
                  icon: <ArrowRightLeft size={16} />,
                  onSelect: () => setDialog('status'),
                },
                {
                  id: 'archive',
                  label: 'Archive client organization',
                  icon: <Archive size={16} />,
                  tone: 'danger',
                  onSelect: () => setDialog('archive'),
                },
              ]
            : [
                {
                  id: 'restore',
                  label: restore.isPending ? 'Restoring…' : 'Restore client organization',
                  icon: <ArchiveRestore size={16} />,
                  disabled: restore.isPending,
                  onSelect: () => restore.mutate(),
                },
              ]
        }
      />
      {restore.isError && (
        <p className="rp-form__error" role="alert">
          {mutationErrorMessage(restore.error)}
        </p>
      )}
      {dialog === 'status' && (
        <ChangeStatusDialog clinic={clinic} onClose={() => setDialog(null)} />
      )}
      {dialog === 'archive' && <ArchiveDialog clinic={clinic} onClose={() => setDialog(null)} />}
    </>
  );
}

/**
 * Status is shown as a group, but the API moves a clinic to a precise stage,
 * so each option names both (e.g. "In progress · Client discussion").
 */
function ChangeStatusDialog({ clinic, onClose }: { clinic: Clinic; onClose: () => void }) {
  const change = useChangeClinicStage(clinic.id);
  const [stage, setStage] = useState<Stage | null>(null);
  const [note, setNote] = useState('');

  return (
    <Modal
      open
      onClose={onClose}
      title="Change status"
      description={`Move ${clinic.name} to another step of its journey.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={change.isPending}
            disabled={!stage}
            onClick={() =>
              stage && change.mutate({ stage, note: note.trim() || null }, { onSuccess: onClose })
            }
          >
            Change status
          </Button>
        </>
      }
    >
      <div className="rp-form">
        <Select
          label="New status"
          value={stage}
          placeholder="Choose a status"
          onChange={setStage}
          options={STAGES.map((s) => ({
            value: s,
            label: CLINIC_STAGE_LABELS[s],
            disabled: s === clinic.stage,
          }))}
        />
        <Input
          label="Note"
          hint="Optional. Shown in the client organization’s activity."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {change.isError && (
          <p className="rp-form__error" role="alert">
            {mutationErrorMessage(change.error)}
          </p>
        )}
      </div>
    </Modal>
  );
}

function ArchiveDialog({ clinic, onClose }: { clinic: Clinic; onClose: () => void }) {
  const archive = useArchiveClinic(clinic.id);
  const [reason, setReason] = useState('');
  const errors = fieldErrors(archive.error);
  const valid = reason.trim().length >= 3;

  return (
    <Modal
      open
      onClose={onClose}
      title="Archive client organization"
      description={`${clinic.name} will move to Inactive. You can restore it later.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={archive.isPending}
            disabled={!valid}
            onClick={() => archive.mutate(reason.trim(), { onSuccess: onClose })}
          >
            Archive client organization
          </Button>
        </>
      }
    >
      <div className="rp-form">
        <Input
          label="Reason"
          required
          hint="For example: not interested right now."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={errors.reason?.[0]}
        />
        {archive.isError && !errors.reason && (
          <p className="rp-form__error" role="alert">
            {mutationErrorMessage(archive.error)}
          </p>
        )}
      </div>
    </Modal>
  );
}
