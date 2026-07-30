/**
 * Alarm scheduling via expo-notifications.
 *
 * Schedules one recurring WEEKLY notification per active weekday; without
 * weekdays, a single one-off DATE notification for the next occurrence. Every
 * notification carries `data.alarmId` so the tap handler opens the ring screen.
 */

import * as Notifications from 'expo-notifications';

import type { Alarm, Weekday } from '@/types';
import { ALARM_CHANNEL_ID } from './notifications';
import { nextOccurrence, nextOccurrenceOnWeekday } from './time';

/** Payload carried by every alarm notification. */
export interface AlarmNotificationData {
  alarmId: string;
}

/**
 * Converts ISO weekday (1=Mon … 7=Sun) to Expo's scheme (1=Sun … 7=Sat).
 */
function toExpoWeekday(isoWeekday: Weekday): number {
  return (isoWeekday % 7) + 1;
}

function buildContent(alarm: Alarm): Notifications.NotificationContentInput {
  return {
    title: alarm.label || 'Alarm',
    body: 'Tap to start your personal wake-up talk.',
    sound: 'default',
    data: { alarmId: alarm.id } satisfies AlarmNotificationData,
  };
}

/**
 * Schedules all notifications for an alarm and returns their IDs.
 * Precondition: `alarm.enabled === true` (checked by the caller).
 */
export async function scheduleAlarm(alarm: Alarm): Promise<string[]> {
  const content = buildContent(alarm);
  const ids: string[] = [];

  const onceDays = alarm.onceDays ?? [];

  // No day marked at all: one-off alarm for the next occurrence.
  if (alarm.weekdays.length === 0 && onceDays.length === 0) {
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

  // `weekly`: one recurring WEEKLY notification per permanent weekday.
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

  // `once`: one one-off DATE notification each, for the next occurrence of the day.
  for (const weekday of onceDays) {
    const date = nextOccurrenceOnWeekday(weekday, alarm.hour, alarm.minute);
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: ALARM_CHANNEL_ID,
      },
    });
    ids.push(id);
  }
  return ids;
}

/** Cancels all scheduled notifications for an alarm. */
export async function cancelAlarm(scheduledIds: string[]): Promise<void> {
  await Promise.all(
    scheduledIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
}

/**
 * Schedules a one-off snooze notification `minutes` in the future, which
 * triggers the same alarm (and thus the same wake-up content) again.
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
