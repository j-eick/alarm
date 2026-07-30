import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { initNotifications } from '@/lib/notifications';
import type { AlarmNotificationData } from '@/lib/scheduler';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* expo-notifications has no web implementation → mount natively only. */}
        {Platform.OS !== 'web' && <NotificationGateway />}
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="alarm/[id]"
            options={{
              headerShown: false,
              // Transparent modal so the background shows through behind the sheet.
              presentation: 'transparentModal',
              // No modal slide: the backdrop is therefore instantly & consistently over
              // the whole viewport. Only the sheet itself slides in (via Reanimated) from below.
              animation: 'none',
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
          <Stack.Screen name="ring" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Initializes notifications and forwards taps on an alarm notification to
 * the ring screen.
 *
 * Extracted into its own component so `useLastNotificationResponse` only
 * runs on native platforms: on web, `ExpoNotifications.getLastNotificationResponse`
 * is unavailable and would crash the whole tree. `Platform.OS` is constant at
 * runtime, so this conditional mounting complies with the Rules of Hooks.
 */
function NotificationGateway() {
  // Initialize notifications once (channel + permissions).
  useEffect(() => {
    void initNotifications();
  }, []);

  // Tap on an alarm notification → open the ring screen.
  const lastResponse = Notifications.useLastNotificationResponse();
  const handledId = useRef<string | null>(null);

  useEffect(() => {
    if (!lastResponse) return;
    const { notification, actionIdentifier } = lastResponse;
    if (actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    if (handledId.current === notification.request.identifier) return;
    handledId.current = notification.request.identifier;

    const data = notification.request.content.data as Partial<AlarmNotificationData>;
    if (data?.alarmId) {
      router.push({ pathname: '/ring', params: { alarmId: data.alarmId } });
    }
  }, [lastResponse]);

  return null;
}
