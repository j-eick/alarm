/**
 * Reine Zeit-/Datums-Hilfsfunktionen (frei von React/Native).
 * Isoliert testbar.
 */

/** Zeitabhängiger Gruß (rein, testbar). */
export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return 'Gute Nacht';
  if (h < 11) return 'Guten Morgen';
  if (h < 17) return 'Guten Tag';
  if (h < 22) return 'Guten Abend';
  return 'Gute Nacht';
}

/** Formatiert Stunde/Minute als "HH:MM" (24h). */
export function formatTime(hour: number, minute: number): string {
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  return `${h}:${m}`;
}

/** Baut ein Date aus Stunde/Minute (heutiges Datum, Sekunden = 0). */
export function dateFromHourMinute(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

/**
 * Berechnet den nächsten Zeitpunkt (Date) für eine einmalige Weckzeit:
 * heute, falls noch in der Zukunft — sonst morgen.
 */
export function nextOccurrence(hour: number, minute: number, from: Date = new Date()): Date {
  const target = new Date(from);
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= from.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}
