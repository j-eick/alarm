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
 * Woher der Weck-Text kommt:
 *  - `own` → der Nutzer tippt/diktiert ihn selbst.
 *  - `ai`  → die KI schreibt ihn aus einem gewählten Thema.
 */
export type AlarmSource = 'own' | 'ai';

/** Sprech-Ton (Delivery-Stil). Registry: `constants/tones.ts`. */
export type ToneId =
  | 'sanft'
  | 'froehlich'
  | 'energetisch'
  | 'motivierend'
  | 'dramatisch'
  | 'trocken'
  | 'streng';

/** Thema für die KI-Generierung. Registry: `constants/topics.ts`. */
export type TopicId = 'motivation' | 'dankbarkeit' | 'tagesfokus' | 'achtsamkeit' | 'humor';

/** Stimme für die TTS-Ausgabe. Registry: `constants/voices.ts`. */
export type VoiceId = 'warm' | 'klar' | 'tief';

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

  /** Quelle des Weck-Texts. */
  source: AlarmSource;
  /** Der Weck-Text. Bei `own` vom Nutzer; bei `ai` das (zuletzt) generierte Ergebnis. */
  text: string;
  /** Nur bei `source: 'ai'` relevant: Thema, aus dem die KI schreibt. */
  topic?: TopicId;
  /** Sprech-Ton — unabhängig vom Inhalt. */
  tone: ToneId;
  /** Stimme für die Sprachausgabe. */
  voice: VoiceId;

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
  source: 'claude' | 'mock' | 'user';
  /** Unix-ms, wann erzeugt. */
  generatedAt: number;
}
