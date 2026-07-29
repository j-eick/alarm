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
 * Wie der Weck-Text zur Laufzeit entsteht:
 *  - `verbatim` → der eingegebene Text wird 1:1 vorgelesen (keine KI).
 *  - `ai`       → die KI erzeugt den Text (Grundlage siehe `aiBasis`).
 */
export type AlarmSource = 'verbatim' | 'ai';

/**
 * Woraus die KI schöpft (nur bei `source: 'ai'`):
 *  - `topic`  → vordefiniertes Thema.
 *  - `text`   → eigener Text als Inspiration; die KI erfasst Emotion + Semantik
 *               und verstärkt sie leicht.
 *  - `source` → externe Quelle (Text/Link), die die KI zu einem Szenario verarbeitet.
 */
export type AiBasis = 'topic' | 'text' | 'source';

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

  /** Wie der Weck-Text entsteht. */
  source: AlarmSource;
  /** Der (zuletzt) vorzulesende Text. Bei `verbatim` der Eingabetext selbst. */
  text: string;
  /** Sprech-Ton — unabhängig vom Inhalt. */
  tone: ToneId;
  /** Stimme für die Sprachausgabe. */
  voice: VoiceId;

  /** Grundlage der KI-Generierung (nur bei `source: 'ai'`). */
  aiBasis?: AiBasis;
  /** Thema (bei `aiBasis: 'topic'`). */
  topic?: TopicId;
  /** Eigener Text als KI-Inspiration (bei `aiBasis: 'text'`). */
  basisText?: string;
  /** Externe Quelle: URL oder eingefügter Text (bei `aiBasis: 'source'`). */
  sourceUrl?: string;

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
