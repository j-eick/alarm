/**
 * Central data models of the app.
 *
 * All modules (UI, storage, scheduler, AI) share these types. They are
 * deliberately free of React/Native dependencies so pure logic (time,
 * prompt building) can be tested independently.
 */

/** Weekday as ISO number: 1 = Monday … 7 = Sunday. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

/**
 * State of a weekday in the picker:
 *  - `off`    → doesn't ring on this day (not marked).
 *  - `once`   → rings exactly once in this cycle (current week), then never
 *               again (small dot top-right on the button).
 *  - `weekly` → rings permanently every week (fully filled button).
 */
export type WeekdayMode = 'off' | 'once' | 'weekly';

/** Short labels for the UI (index 0 = Monday). */
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
};

/**
 * How the wake-up text is created at runtime:
 *  - `verbatim` → the entered text is read out 1:1 (no AI).
 *  - `ai`       → the AI generates the text (basis: see `aiBasis`).
 */
export type AlarmSource = 'verbatim' | 'ai';

/**
 * What the AI draws from (only when `source: 'ai'`):
 *  - `topic`  → predefined topic.
 *  - `text`   → own text as inspiration; the AI picks up emotion + semantics
 *               and amplifies them slightly.
 *  - `source` → external source (text/link) that the AI turns into a scenario.
 */
export type AiBasis = 'topic' | 'text' | 'source';

/** Speaking tone (delivery style). Registry: `constants/tones.ts`. */
export type ToneId =
  | 'gentle'
  | 'cheerful'
  | 'energetic'
  | 'motivating'
  | 'dramatic'
  | 'dry'
  | 'strict';

/** Topic for AI generation. Registry: `constants/topics.ts`. */
export type TopicId = 'motivation' | 'gratitude' | 'focus' | 'mindfulness' | 'humor';

/** Voice for the TTS output. Registry: `constants/voices.ts`. */
export type VoiceId = 'warm' | 'clear' | 'deep';

/** A single alarm. */
export interface Alarm {
  id: string;
  /** Hour 0–23. */
  hour: number;
  /** Minute 0–59. */
  minute: number;
  /** Weekdays on which the alarm rings permanently every week (`weekly`). */
  weekdays: Weekday[];
  /**
   * Weekdays on which the alarm rings exactly once in this cycle (`once`)
   * and never again afterwards. Mutually exclusive with `weekdays` per day.
   */
  onceDays: Weekday[];
  label: string;
  enabled: boolean;

  /** How the wake-up text is created. */
  source: AlarmSource;
  /** The (most recently) spoken text. For `verbatim`, the input text itself. */
  text: string;
  /** Speaking tone — independent of content. */
  tone: ToneId;
  /** Voice for the speech output. */
  voice: VoiceId;

  /** Basis of the AI generation (only when `source: 'ai'`). */
  aiBasis?: AiBasis;
  /** Topic (when `aiBasis: 'topic'`). */
  topic?: TopicId;
  /** Own text as AI inspiration (when `aiBasis: 'text'`). */
  basisText?: string;
  /** External source: URL or pasted text (when `aiBasis: 'source'`). */
  sourceUrl?: string;

  /** IDs of the scheduled notifications (one per weekday). Set by the scheduler. */
  scheduledIds: string[];
}

/** AI-generated wake-up content, cached per alarm. */
export interface GeneratedContent {
  alarmId: string;
  /** The spoken/displayed text. */
  text: string;
  /** Local or remote URI of the audio file; null → device TTS as fallback. */
  audioUri: string | null;
  /** Which source produced the text (for debug/display). */
  source: 'claude' | 'mock' | 'user';
  /** Unix ms when generated. */
  generatedAt: number;
}
