/**
 * Alarm-Scheduling über expo-notifications.
 *
 * Plant pro aktivem Wochentag eine wiederkehrende WEEKLY-Notification; ohne
 * Wochentage eine einmalige DATE-Notification zum nächsten Auftreten. Jede
 * Notification trägt `data.alarmId`, damit der Tap-Handler den Weck-Screen öffnet.
 */

import * as Notifications from 'expo-notifications';

import type { Alarm, Weekday } from '@/types';
import { ALARM_CHANNEL_ID } from './notifications';
import { nextOccurrence } from './time';

/** Nutzlast, die jede Alarm-Notification mitführt. */
export interface AlarmNotificationData {
  alarmId: string;
}

/**
 * Konvertiert ISO-Wochentag (1=Mo … 7=So) in Expos Schema (1=So … 7=Sa).
 */
function toExpoWeekday(isoWeekday: Weekday): number {
  return (isoWeekday % 7) + 1;
}

function buildContent(alarm: Alarm): Notifications.NotificationContentInput {
  return {
    title: alarm.label || 'Wecker',
    body: 'Tippe, um deinen persönlichen Weck-Talk zu starten.',
    sound: 'default',
    data: { alarmId: alarm.id } satisfies AlarmNotificationData,
  };
}

/**
 * Plant alle Notifications für einen Alarm und gibt deren IDs zurück.
 * Voraussetzung: `alarm.enabled === true` (Aufrufer prüft das).
 */
export async function scheduleAlarm(alarm: Alarm): Promise<string[]> {
  const content = buildContent(alarm);
  const ids: string[] = [];

  if (alarm.weekdays.length === 0) {
    // Einmaliger Alarm: nächstes Auftreten von hour:minute.
    const date = nextOccurrence(alarm.hour, alarm.minute);
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: ALARM_CHANNEL_ID,
      },
    });
    ids.push(id);
    return ids;
  }

  // Wiederkehrend: eine WEEKLY-Notification pro aktivem Wochentag.
  for (const weekday of alarm.weekdays) {
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: toExpoWeekday(weekday),
        hour: alarm.hour,
        minute: alarm.minute,
        channelId: ALARM_CHANNEL_ID,
      },
    });
    ids.push(id);
  }
  return ids;
}

/** Bricht alle geplanten Notifications eines Alarms ab. */
export async function cancelAlarm(scheduledIds: string[]): Promise<void> {
  await Promise.all(
    scheduledIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
}

/**
 * Plant eine einmalige Schlummer-Notification `minutes` in der Zukunft, die
 * denselben Alarm (und damit denselben Weck-Inhalt) erneut auslöst.
 */
export async function scheduleSnooze(
  alarm: Alarm,
  minutes: number,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: buildContent(alarm),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(minutes * 60)),
      channelId: ALARM_CHANNEL_ID,
    },
  });
}
