import { tokens as t } from '@radial-pulse/design-tokens';
import { fontStyle } from '@radial-pulse/ui/native';
import { Stack } from 'expo-router';
import { ClinicAdministratorGate } from '../../src/shell/clinic-administrator-gate';

/**
 * The signed-in Clinic Administrator app: tabs, the chat modal and detail
 * screens, all scoped to the selected clinic by the gate.
 */
export default function SignedInLayout() {
  return (
    <ClinicAdministratorGate>
      <Stack
        screenOptions={{
          headerShown: false,
          headerTintColor: t.color.text.link,
          headerTitleStyle: { ...fontStyle(600), color: t.color.text.primary },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: t.color.bg.app },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: t.color.bg.app },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(setup)/connect-accounts" options={{ headerShown: true, title: '' }} />
        <Stack.Screen
          name="assessment/[assessmentId]"
          options={{ headerShown: true, title: 'Assessment' }}
        />
        <Stack.Screen name="connection/[platform]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen
          name="clinic-information"
          options={{ headerShown: true, title: 'Clinic information' }}
        />
        <Stack.Screen
          name="practitioner-profile"
          options={{ headerShown: true, title: 'Practitioner Profile' }}
        />
      </Stack>
    </ClinicAdministratorGate>
  );
}
