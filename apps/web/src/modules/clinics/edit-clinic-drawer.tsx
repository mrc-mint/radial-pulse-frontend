import { useSetClinicPhoto, useUpdateClinic } from '@radial-pulse/api-client-react';
import type { Schema } from '@radial-pulse/shared-types';
import { Button, Drawer, Input } from '@radial-pulse/web-ui';
import { ImageUp } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { fieldErrors, mutationErrorMessage } from '../../app/page-kit';
import { ClinicPhoto } from '../../app/clinic-photo';

type Editable =
  | 'name'
  | 'specialty'
  | 'description'
  | 'website_url'
  | 'phone'
  | 'email'
  | 'address_line'
  | 'city'
  | 'state'
  | 'postal_code';

const FIELDS: Array<[Editable, string, string?]> = [
  ['name', 'Client organization name'],
  ['specialty', 'Specialty'],
  ['description', 'Description'],
  ['website_url', 'Website', 'url'],
  ['phone', 'Phone', 'tel'],
  ['email', 'Email', 'email'],
  ['address_line', 'Address'],
  ['city', 'City'],
  ['state', 'State'],
  ['postal_code', 'Postal code'],
];

/** Edit clinic details — contract `ClinicUpdate`; only changed fields are sent. */
export function EditClinicDrawer({
  clinic,
  open,
  onClose,
}: {
  clinic: Schema<'ClinicRead'>;
  open: boolean;
  onClose: () => void;
}) {
  const initial = () =>
    Object.fromEntries(FIELDS.map(([k]) => [k, clinic[k] ?? ''])) as Record<Editable, string>;
  const [draft, setDraft] = useState(initial);
  const update = useUpdateClinic(clinic.id);
  const errors = fieldErrors(update.error);

  function close() {
    setDraft(initial());
    update.reset();
    onClose();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const changes = Object.fromEntries(
      FIELDS.map(([k]) => [k, draft[k].trim()] as const)
        .filter(([k, v]) => v !== (clinic[k] ?? ''))
        .map(([k, v]) => [k, v === '' ? null : v]),
    ) as Schema<'ClinicUpdate'>;
    if (Object.keys(changes).length === 0) return close();
    update.mutate(changes, { onSuccess: close });
  }

  const generalError =
    update.isError && Object.keys(errors).length === 0 ? mutationErrorMessage(update.error) : null;

  return (
    <Drawer
      open={open}
      onClose={close}
      title="Edit client organization"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="edit-clinic-form" loading={update.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      <PhotoField clinic={clinic} />
      <form id="edit-clinic-form" className="rp-form" onSubmit={submit} noValidate>
        {FIELDS.map(([k, label, type]) => (
          <Input
            key={k}
            label={label}
            type={type}
            required={k === 'name'}
            value={draft[k]}
            onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
            error={errors[k]?.[0]}
          />
        ))}
        {generalError && (
          <p className="rp-form__error" role="alert">
            {generalError}
          </p>
        )}
      </form>
    </Drawer>
  );
}

/**
 * Clinic photo: uploads a `clinic_photo` asset and sets it as the cover
 * photo straight away (separate from the text fields' Save).
 */
function PhotoField({ clinic }: { clinic: Schema<'ClinicRead'> }) {
  const setPhoto = useSetClinicPhoto(clinic.id);
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="rp-photo-field">
      <ClinicPhoto clinicId={clinic.id} assetId={clinic.cover_asset_id} name={clinic.name} />
      <div className="rp-stack-sm">
        <span className="rp-photo-field__label">Photo</span>
        <span className="rp-muted rp-small">
          Shown on the client organization page. JPG or PNG works best.
        </span>
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="rp-sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPhoto.mutate(file);
            e.target.value = '';
          }}
        />
        <div>
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<ImageUp size={14} />}
            loading={setPhoto.isPending}
            onClick={() => input.current?.click()}
          >
            Change photo
          </Button>
        </div>
        {setPhoto.isError && (
          <p className="rp-form__error" role="alert">
            {mutationErrorMessage(setPhoto.error)}
          </p>
        )}
      </div>
    </div>
  );
}
