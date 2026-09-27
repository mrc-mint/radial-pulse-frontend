import { useClinic, useUpdateClinic } from '@radial-pulse/api-client/react';
import { tokens as t } from '@radial-pulse/design-tokens';
import { useClinicCan, useClinicId } from '@radial-pulse/platform-shell/core';
import { Screen } from '@radial-pulse/platform-shell/native';
import type { Schema } from '@radial-pulse/shared-types';
import { Button, Card, Input } from '@radial-pulse/ui/native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, type TextInputProps } from 'react-native';
import {
  Callout,
  CardSkeleton,
  DefinitionList,
  fieldErrors,
  mutationErrorMessage,
  QueryErrorState,
} from '../../shell/kit';

type Clinic = Schema<'ClinicRead'>;
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

const FIELDS: ReadonlyArray<{
  key: Editable;
  label: string;
  input?: Pick<TextInputProps, 'keyboardType' | 'autoCapitalize' | 'multiline' | 'autoComplete'>;
}> = [
  { key: 'name', label: 'Clinic name' },
  { key: 'specialty', label: 'Specialty' },
  { key: 'phone', label: 'Phone', input: { keyboardType: 'phone-pad', autoComplete: 'tel' } },
  {
    key: 'email',
    label: 'Email',
    input: { keyboardType: 'email-address', autoCapitalize: 'none', autoComplete: 'email' },
  },
  { key: 'website_url', label: 'Website', input: { keyboardType: 'url', autoCapitalize: 'none' } },
  { key: 'address_line', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'postal_code', label: 'Postal code', input: { keyboardType: 'number-pad' } },
  { key: 'description', label: 'About the clinic', input: { multiline: true } },
];

/** The clinic's details (`ClinicRead`); editable with `clinics:write` (`ClinicUpdate`). */
export function ClinicInformationScreen() {
  const clinicId = useClinicId();
  const query = useClinic(clinicId);
  const canEdit = useClinicCan(clinicId, 'clinics:write');
  const [editing, setEditing] = useState(false);

  return (
    <Screen
      topInset={false}
      fabClearance={false}
      onRefresh={editing ? undefined : () => void query.refetch()}
      refreshing={query.isRefetching}
    >
      <Stack.Screen options={{ title: editing ? 'Edit clinic' : 'Clinic information' }} />
      {query.isLoading ? (
        <CardSkeleton lines={6} />
      ) : query.error || !query.data ? (
        <Card>
          <QueryErrorState error={query.error} onRetry={() => void query.refetch()} />
        </Card>
      ) : editing ? (
        <EditClinic clinic={query.data} onDone={() => setEditing(false)} />
      ) : (
        <>
          <Card padding="sm">
            <View style={styles.inset}>
              <DefinitionList
                items={FIELDS.map(
                  ({ key, label }) => [label, query.data[key]] as [string, string | null],
                )}
              />
            </View>
          </Card>
          {canEdit ? (
            <Button fullWidth onPress={() => setEditing(true)}>
              Edit clinic information
            </Button>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function EditClinic({ clinic, onDone }: { clinic: Clinic; onDone: () => void }) {
  const [draft, setDraft] = useState(
    () =>
      Object.fromEntries(FIELDS.map(({ key }) => [key, clinic[key] ?? ''])) as Record<
        Editable,
        string
      >,
  );
  const update = useUpdateClinic(clinic.id);
  const errors = fieldErrors(update.error);

  function save() {
    // Only changed fields are sent; an emptied field is cleared (null).
    const changes = Object.fromEntries(
      FIELDS.map(({ key }) => [key, draft[key].trim()] as const)
        .filter(([key, value]) => value !== (clinic[key] ?? ''))
        .map(([key, value]) => [key, value === '' ? null : value]),
    ) as Schema<'ClinicUpdate'>;
    if (Object.keys(changes).length === 0) return onDone();
    update.mutate(changes, { onSuccess: onDone });
  }

  const general =
    update.isError && Object.keys(errors).length === 0 ? mutationErrorMessage(update.error) : null;

  return (
    <>
      <Card>
        <View style={styles.form}>
          {FIELDS.map(({ key, label, input }) => (
            <Input
              key={key}
              label={label}
              value={draft[key]}
              onChangeText={(value) => setDraft((d) => ({ ...d, [key]: value }))}
              error={errors[key]?.[0]}
              required={key === 'name'}
              {...input}
            />
          ))}
        </View>
      </Card>
      {general ? <Callout tone="danger">{general}</Callout> : null}
      <View style={styles.actions}>
        <Button fullWidth loading={update.isPending} onPress={save}>
          Save changes
        </Button>
        <Button variant="ghost" fullWidth disabled={update.isPending} onPress={onDone}>
          Cancel
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  inset: { paddingHorizontal: t.space[2] },
  form: { gap: t.space[4] },
  actions: { gap: t.space[2] },
});
