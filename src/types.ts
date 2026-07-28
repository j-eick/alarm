/**
 * Zentrale Datenmodelle der App.
 *
 * Alle Module (UI, Storage, Scheduler, KI) teilen sich diese Typen. Sie sind
 * bewusst frei von React-/Native-Abhängigkeiten, damit reine Logik (Zeit,
 * Prompt-Bau) unabhängig getestet werden kann.
 */

/** Wochentag als ISO-Zahl: 1 = Montag … 7 = Sonntag. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

/** Kurzlabels für die UI (Index 0 = Montag). */
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  1: 'Mo',
  2: 'Di',
  3: 'Mi',
  4: 'Do',
  5: 'Fr',
  6: 'Sa',
  7: 'So',
};

/**
 * Vom Nutzer manuell erfasster Kontext, aus dem die KI den Weck-Inhalt ableitet.
 * `mood` ist eine grobe Voreinstellung, `note` optionaler Freitext.
 */
export interface MoodContext {
  mood: MoodId;
  /** Optionaler Freitext, z.B. "Wichtiges Meeting um 9 Uhr". */
  note?: string;
}

export type MoodId =
  | 'tired'
  | 'stressed'
  | 'motivated'
  | 'anxious'
  | 'neutral'
  | 'happy'
  | 'calm'
  | 'sad'
  | 'energetic'
  | 'focused'
  | 'overwhelmed';

/**
 * Art des zu generierenden Inhalts. Erweiterbar: ein neuer Typ wird in der
 * Registry (`lib/ai/content-types.ts`) ergänzt, ohne aufrufenden Code zu ändern.
 */
export type ContentTypeId = 'motivationalTalk' | 'affirmation' | 'newsBriefing';

/** Ein einzelner Wecker. */
export interface Alarm {
  id: string;
  /** Stunde 0–23. */
  hour: number;
  /** Minute 0–59. */
  minute: number;
  /** Aktive Wochentage. Leer = einmalig beim nächsten Auftreten. */
  weekdays: Weekday[];
  label: string;
  enabled: boolean;
  context: MoodContext;
  contentType: ContentTypeId;
  /** IDs der geplanten Notifications (eine pro Wochentag). Vom Scheduler gesetzt. */
  scheduledIds: string[];
}

/** Von der KI erzeugter Weck-Inhalt, pro Alarm zwischengespeichert. */
export interface GeneratedContent {
  alarmId: string;
  /** Der vorgelesene/angezeigte Text. */
  text: string;
  /** Lokaler oder Remote-URI der Audiodatei; null → Geräte-TTS als Fallback. */
  audioUri: string | null;
  /** Welche Quelle den Text erzeugt hat (für Debug/Anzeige). */
  source: 'claude' | 'mock';
  /** Unix-ms, wann erzeugt. */
  generatedAt: number;
}
