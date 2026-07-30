/**
 * Persistence layer (AsyncStorage).
 *
 * Wraps all storage access behind typed repository functions. UI and hooks
 * only ever call these functions — never AsyncStorage directly. This keeps
 * the storage technology swappable (e.g. SQLite later).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_TONE } from '@/constants/tones';
import { DEFAULT_TOPIC } from '@/constants/topics';
import { DEFAULT_VOICE } from '@/constants/voices';
import { createId } from '@/lib/id';
import type { AiBasis, Alarm, AlarmSource, GeneratedContent, ToneId, TopicId, VoiceId, Weekday } from '@/types';

const KEYS = {
  alarms: 'aod:alarms',
  content: (alarmId: string) => `aod:content:${alarmId}`,
  linkConsent: 'aod:linkConsentAccepted',
} as const;

/** Reads and parses a JSON value; returns `fallback` when missing/broken. */
async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/** Legacy German tone values (pre-localization) → current English `ToneId`. */
const LEGACY_TONE_MAP: Record<string, ToneId> = {
  sanft: 'gentle',
  froehlich: 'cheerful',
  energetisch: 'energetic',
  motivierend: 'motivating',
  dramatisch: 'dramatic',
  trocken: 'dry',
  streng: 'strict',
};

/** Legacy German topic values (pre-localization) → current English `TopicId`. */
const LEGACY_TOPIC_MAP: Record<string, TopicId> = {
  dankbarkeit: 'gratitude',
  tagesfokus: 'focus',
  achtsamkeit: 'mindfulness',
};

/** Legacy German voice values (pre-localization) → current English `VoiceId`. */
const LEGACY_VOICE_MAP: Record<string, VoiceId> = {
  klar: 'clear',
  tief: 'deep',
};

function migrateTone(value: string): ToneId {
  return (LEGACY_TONE_MAP[value] ?? value) as ToneId;
}

function migrateTopic(value: string): TopicId {
  return (LEGACY_TOPIC_MAP[value] ?? value) as TopicId;
}

function migrateVoice(value: string): VoiceId {
  return (LEGACY_VOICE_MAP[value] ?? value) as VoiceId;
}

/**
 * Normalizes a (possibly old) persisted alarm to the current model.
 * Migrations: the former `source: 'own'` becomes `'verbatim'`; the former
 * German `tone`/`topic`/`voice` literal values are mapped to their current
 * English equivalents; missing fields (aiBasis/topic/…) are filled with
 * defaults.
 */
function normalizeAlarm(input: unknown): Alarm {
  const r = (input ?? {}) as Record<string, unknown>;
  const rawSource = r.source;
  const source: AlarmSource = rawSource === 'verbatim' || rawSource === 'own' ? 'verbatim' : 'ai';
  const rawBasis = r.aiBasis;
  const aiBasis: AiBasis =
    rawBasis === 'text' || rawBasis === 'source' ? rawBasis : 'topic';

  return {
    id: typeof r.id === 'string' ? r.id : createId(),
    hour: typeof r.hour === 'number' ? r.hour : 7,
    minute: typeof r.minute === 'number' ? r.minute : 0,
    weekdays: Array.isArray(r.weekdays) ? (r.weekdays as Weekday[]) : [1, 2, 3, 4, 5],
    onceDays: Array.isArray(r.onceDays) ? (r.onceDays as Weekday[]) : [],
    label: typeof r.label === 'string' ? r.label : 'Alarm',
    enabled: r.enabled !== false,
    source,
    text: typeof r.text === 'string' ? r.text : '',
    tone: typeof r.tone === 'string' ? migrateTone(r.tone) : DEFAULT_TONE,
    voice: typeof r.voice === 'string' ? migrateVoice(r.voice) : DEFAULT_VOICE,
    aiBasis,
    topic: typeof r.topic === 'string' ? migrateTopic(r.topic) : DEFAULT_TOPIC,
    basisText: typeof r.basisText === 'string' ? r.basisText : undefined,
    sourceUrl: typeof r.sourceUrl === 'string' ? r.sourceUrl : undefined,
    scheduledIds: Array.isArray(r.scheduledIds) ? (r.scheduledIds as string[]) : [],
  };
}

// --- Alarms ------------------------------------------------------------------

export const alarmsRepo = {
  async getAll(): Promise<Alarm[]> {
    const raw = await readJson<unknown[]>(KEYS.alarms, []);
    return Array.isArray(raw) ? raw.map(normalizeAlarm) : [];
  },

  async saveAll(alarms: Alarm[]): Promise<void> {
    await writeJson(KEYS.alarms, alarms);
  },
};

// --- Generated wake-up content (per alarm) -----------------------------------

export const contentRepo = {
  async get(alarmId: string): Promise<GeneratedContent | null> {
    return readJson<GeneratedContent | null>(KEYS.content(alarmId), null);
  },

  async set(content: GeneratedContent): Promise<void> {
    await writeJson(KEYS.content(content.alarmId), content);
  },

  async remove(alarmId: string): Promise<void> {
    await AsyncStorage.removeItem(KEYS.content(alarmId));
  },
};

// --- App settings -------------------------------------------------------------

export const settingsRepo = {
  /** Has the user accepted the self-responsibility notice for external sources? */
  async getLinkConsent(): Promise<boolean> {
    return (await AsyncStorage.getItem(KEYS.linkConsent)) === 'true';
  },

  async setLinkConsent(accepted: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.linkConsent, accepted ? 'true' : 'false');
  },
};
