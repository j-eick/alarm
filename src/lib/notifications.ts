/**
 * Base notification configuration: display behavior, Android channel, permissions.
 * Called once on app start (see app/_layout.tsx).
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const ALARM_CHANNEL_ID = 'alarms';

/** Defines how a notification is displayed in the foreground (SDK 57 API). */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Creates the Android alarm channel (no-op on iOS). Idempotent. */
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
    name: 'Alarms',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
}

/** Requests notification permissions and reports whether they were granted. */
export async function ensurePermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return requested.granted;
}

/** One-time initialization (channel + permissions). */
export async function initNotifications(): Promise<boolean> {
  await ensureAndroidChannel();
  return ensurePermissions();
}
