import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { initNotifications } from '@/lib/notifications';
import type { AlarmNotificationData } from '@/lib/scheduler';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Notifications einmalig initialisieren (Channel + Rechte).
  useEffect(() => {
    void initNotifications();
  }, []);

  // Tap auf eine Alarm-Notification → Weck-Screen öffnen.
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="alarm/[id]"
          options={{
            headerShown: false,
            // Transparentes Modal, damit der Hintergrund hinter dem Sheet durchscheint.
            presentation: 'transparentModal',
            // Kein Modal-Slide: der Backdrop liegt dadurch sofort & konstant über dem
            // ganzen Viewport. Nur das Sheet selbst fährt (per Reanimated) von unten ein.
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
