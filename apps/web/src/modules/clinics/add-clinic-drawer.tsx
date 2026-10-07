import { useCreateClinic } from '@radial-pulse/api-client/react';
import type { Schema } from '@radial-pulse/shared-types';
import { Button, Drawer, Input } from '@radial-pulse/ui/web';
import { useState, type FormEvent } from 'react';
import { fieldErrors, mutationErrorMessage } from '../../app/page-kit';

type Draft = Record<
  | 'name'
  | 'primary_practitioner_name'
  | 'specialty'
  | 'website_url'
  | 'phone'
  | 'email'
  | 'address_line'
  | 'city'
  | 'state'
  | 'postal_code',
  string
>;

const EMPTY: Draft = {
  name: '',
  primary_practitioner_name: '',
  specialty: '',
  website_url: '',
  phone: '',
  email: '',
  address_line: '',
  city: '',
  state: '',
  postal_code: '',
};

/** "Add a client organization" (a prospective client) — contract `ClinicCreate`; blank optional fields are omitted. */
export function AddClinicDrawer({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (clinic: Schema<'ClinicRead'>) => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const create = useCreateClinic();
  const errors = fieldErrors(create.error);
  const set = (k: keyof Draft) => (e: { target: { value: string } }) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));

  function close() {
    setDraft(EMPTY);
    create.reset();
    onClose();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const body = Object.fromEntries(
      Object.entries(draft)
        .map(([k, v]) => [k, v.trim()])
        .filter(([, v]) => v !== ''),
    ) as Schema<'ClinicCreate'>;
    create.mutate(body, {
      onSuccess: (clinic) => {
        close();
        onCreated(clinic);
      },
    });
  }

  const field = (
    k: keyof Draft,
    label: string,
    extra: { type?: string; required?: boolean; hint?: string } = {},
  ) => (
    <Input
      label={label}
      value={draft[k]}
      onChange={set(k)}
      type={extra.type}
      required={extra.required}
      hint={extra.hint}
      error={errors[k]?.[0]}
      autoComplete="off"
    />
  );

  const generalError =
    create.isError && Object.keys(errors).length === 0 ? mutationErrorMessage(create.error) : null;

  return (
    <Drawer
      open={open}
      onClose={close}
      title="Add client organization"
      description="Add a client organization as a new prospective client."
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="add-clinic-form" loading={create.isPending}>
            Add client organization
          </Button>
        </>
      }
    >
      <form id="add-clinic-form" className="rp-form" onSubmit={submit} noValidate>
        {field('name', 'Client organization name', { required: true })}
        {field('primary_practitioner_name', 'Main practitioner', {
          hint: 'For example, Dr. Rahul Mehta',
        })}
        {field('specialty', 'Specialty')}
        {field('website_url', 'Website', { type: 'url', hint: 'Include https://' })}
        <div className="rp-form__grid">
          {field('phone', 'Phone', { type: 'tel' })}
          {field('email', 'Email', { type: 'email' })}
        </div>
        {field('address_line', 'Address')}
        <div className="rp-form__grid">
          {field('city', 'City')}
          {field('state', 'State')}
          {field('postal_code', 'Postal code')}
        </div>
        {generalError && (
          <p className="rp-form__error" role="alert">
            {generalError}
          </p>
        )}
      </form>
    </Drawer>
  );
}
