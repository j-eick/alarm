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

/**
 * Nächstes Auftreten an einem bestimmten ISO-Wochentag (1=Mo … 7=So) zur
 * angegebenen Uhrzeit. Ist es heute dieser Wochentag und die Zeit noch nicht
 * vorbei, wird heute genommen — sonst der gleiche Wochentag der Folgewoche.
 */
export function nextOccurrenceOnWeekday(
  isoWeekday: number,
  hour: number,
  minute: number,
  from: Date = new Date(),
): Date {
  // JS getDay(): 0=So … 6=Sa → in ISO (1=Mo … 7=So) umrechnen.
  const fromIso = from.getDay() === 0 ? 7 : from.getDay();
  const target = new Date(from);
  target.setHours(hour, minute, 0, 0);

  let deltaDays = (isoWeekday - fromIso + 7) % 7;
  // Gleicher Wochentag, aber Zeit heute schon vorbei → nächste Woche.
  if (deltaDays === 0 && target.getTime() <= from.getTime()) {
    deltaDays = 7;
  }
  target.setDate(target.getDate() + deltaDays);
  return target;
}
