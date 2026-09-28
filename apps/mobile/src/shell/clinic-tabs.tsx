import { useChatInbox } from '@radial-pulse/api-client/react';
import { tokens as t } from '@radial-pulse/design-tokens';
import { useClinicCan, useClinicId, useClinicPermissions } from '@radial-pulse/platform-shell/core';
import { ChatFab, NAV_ICONS } from '@radial-pulse/platform-shell/native';
import { fontStyle } from '@radial-pulse/ui/native';
import { Tabs, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHAT_PERMISSION } from '../modules/chat/manifest';
import { isTabVisible, TAB_SECTIONS } from './module-registry';

const TAB_BAR_HEIGHT = 60;

/**
 * Bottom tabs of the Clinic Administrator app (from the module manifests,
 * filtered by the selected clinic's permissions) with the floating chat
 * button on top. Chat is a modal, never a tab.
 */
export function ClinicTabsLayout() {
  const clinicId = useClinicId();
  const permissions = useClinicPermissions(clinicId);
  const canChat = useClinicCan(clinicId, CHAT_PERMISSION);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const inbox = useChatInbox({ enabled: canChat });
  const unread =
    inbox.data?.items.find((thread) => thread.clinic_id === clinicId)?.unread_count ?? 0;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: t.color.text.link,
          tabBarInactiveTintColor: t.color.text.tertiary,
          // 10pt keeps five labels ("Social Media") unclipped on 320–375pt phones.
          tabBarLabelStyle: { ...fontStyle(500), fontSize: 10, letterSpacing: -0.1 },
          tabBarStyle: {
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingTop: t.space[1],
            backgroundColor: t.color.bg.surface,
            borderTopColor: t.color.border.default,
          },
          sceneStyle: { backgroundColor: t.color.bg.app },
        }}
      >
        {TAB_SECTIONS.map((section) => {
          const Icon = section.icon ? NAV_ICONS[section.icon] : null;
          return (
            <Tabs.Screen
              key={section.id}
              name={section.path}
              options={{
                title: section.label,
                // Hidden (not just disabled) without the clinic permission.
                href: isTabVisible(section, permissions) ? undefined : null,
                tabBarIcon: Icon
                  ? ({ color, focused }) => (
                      <Icon size={22} color={color} strokeWidth={focused ? 2.4 : 2} />
                    )
                  : undefined,
              }}
            />
          );
        })}
      </Tabs>
      {canChat ? (
        <ChatFab
          unread={unread}
          bottom={TAB_BAR_HEIGHT + insets.bottom + t.space[3]}
          onPress={() => router.push('/chat')}
        />
      ) : null}
    </View>
  );
}
