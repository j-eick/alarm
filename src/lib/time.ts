/**
 * Pure time/date helper functions (free of React/Native).
 * Testable in isolation.
 */

/** Time-dependent greeting (pure, testable). */
export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return 'Good Night';
  if (h < 11) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 22) return 'Good Evening';
  return 'Good Night';
}

/** Formats hour/minute as "HH:MM" (24h). */
export function formatTime(hour: number, minute: number): string {
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  return `${h}:${m}`;
}

/** Builds a Date from hour/minute (today's date, seconds = 0). */
export function dateFromHourMinute(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

/**
 * Computes the next point in time (Date) for a one-off alarm time:
 * today, if still in the future — otherwise tomorrow.
 */
export function nextOccurrence(hour: number, minute: number, from: Date = new Date()): Date {
  const target = new Date(from);
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= from.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

/**
 * Next occurrence on a given ISO weekday (1=Mon … 7=Sun) at the given time.
 * If today is that weekday and the time hasn't passed yet, today is used —
 * otherwise the same weekday of the following week.
 */
export function nextOccurrenceOnWeekday(
  isoWeekday: number,
  hour: number,
  minute: number,
  from: Date = new Date(),
): Date {
  // JS getDay(): 0=Sun … 6=Sat → convert to ISO (1=Mon … 7=Sun).
  const fromIso = from.getDay() === 0 ? 7 : from.getDay();
  const target = new Date(from);
  target.setHours(hour, minute, 0, 0);

  let deltaDays = (isoWeekday - fromIso + 7) % 7;
  // Same weekday, but the time has already passed today → next week.
  if (deltaDays === 0 && target.getTime() <= from.getTime()) {
    deltaDays = 7;
  }
  target.setDate(target.getDate() + deltaDays);
  return target;
}
