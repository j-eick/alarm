/**
 * Notification-Grundkonfiguration: Anzeigeverhalten, Android-Channel, Rechte.
 * Wird einmal beim App-Start aufgerufen (siehe app/_layout.tsx).
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const ALARM_CHANNEL_ID = 'alarms';

/** Legt fest, wie eine Notification im Vordergrund angezeigt wird (SDK 57 API). */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Erstellt den Android-Alarm-Channel (No-op auf iOS). Idempotent. */
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
    name: 'Wecker',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
}

/** Fragt Benachrichtigungsrechte an und meldet, ob sie erteilt sind. */
export async function ensurePermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return requested.granted;
}

/** Einmalige Initialisierung (Channel + Rechte). */
export async function initNotifications(): Promise<boolean> {
  await ensureAndroidChannel();
  return ensurePermissions();
}
