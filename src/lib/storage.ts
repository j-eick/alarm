/**
 * Persistenz-Schicht (AsyncStorage).
 *
 * Kapselt jeglichen Storage-Zugriff hinter typisierten Repository-Funktionen.
 * UI und Hooks rufen ausschließlich diese Funktionen auf — nie AsyncStorage
 * direkt. So bleibt die Speichertechnologie austauschbar (z.B. später SQLite).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_TONE } from '@/constants/tones';
import { DEFAULT_TOPIC } from '@/constants/topics';
import { DEFAULT_VOICE } from '@/constants/voices';
import { createId } from '@/lib/id';
import type { Alarm, GeneratedContent, ToneId, TopicId, VoiceId, Weekday } from '@/types';

const KEYS = {
  alarms: 'aod:alarms',
  content: (alarmId: string) => `aod:content:${alarmId}`,
} as const;

/** Liest und parst einen JSON-Wert; gibt `fallback` bei fehlendem/kaputtem Wert. */
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

/**
 * Normalisiert einen (evtl. alten) persistierten Alarm auf das aktuelle Modell.
 * Alte Alarme hatten `context`/`contentType` statt `source`/`text`/`topic`/
 * `tone`/`voice` — fehlende Felder werden mit Defaults aufgefüllt, damit die
 * App nach dem Umstieg auf `topic + tone` nicht an Altdaten scheitert.
 */
function normalizeAlarm(input: unknown): Alarm {
  const r = (input ?? {}) as Record<string, unknown>;
  return {
    id: typeof r.id === 'string' ? r.id : createId(),
    hour: typeof r.hour === 'number' ? r.hour : 7,
    minute: typeof r.minute === 'number' ? r.minute : 0,
    weekdays: Array.isArray(r.weekdays) ? (r.weekdays as Weekday[]) : [1, 2, 3, 4, 5],
    label: typeof r.label === 'string' ? r.label : 'Wecker',
    enabled: r.enabled !== false,
    source: r.source === 'own' ? 'own' : 'ai',
    text: typeof r.text === 'string' ? r.text : '',
    topic: typeof r.topic === 'string' ? (r.topic as TopicId) : DEFAULT_TOPIC,
    tone: typeof r.tone === 'string' ? (r.tone as ToneId) : DEFAULT_TONE,
    voice: typeof r.voice === 'string' ? (r.voice as VoiceId) : DEFAULT_VOICE,
    scheduledIds: Array.isArray(r.scheduledIds) ? (r.scheduledIds as string[]) : [],
  };
}

// --- Alarme -----------------------------------------------------------------

export const alarmsRepo = {
  async getAll(): Promise<Alarm[]> {
    const raw = await readJson<unknown[]>(KEYS.alarms, []);
    return Array.isArray(raw) ? raw.map(normalizeAlarm) : [];
  },

  async saveAll(alarms: Alarm[]): Promise<void> {
    await writeJson(KEYS.alarms, alarms);
  },
};

// --- Generierte Weck-Inhalte (pro Alarm) ------------------------------------

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
