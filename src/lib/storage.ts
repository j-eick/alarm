/**
 * Persistenz-Schicht (AsyncStorage).
 *
 * Kapselt jeglichen Storage-Zugriff hinter typisierten Repository-Funktionen.
 * UI und Hooks rufen ausschließlich diese Funktionen auf — nie AsyncStorage
 * direkt. So bleibt die Speichertechnologie austauschbar (z.B. später SQLite).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Alarm, GeneratedContent } from '@/types';

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

// --- Alarme -----------------------------------------------------------------

export const alarmsRepo = {
  async getAll(): Promise<Alarm[]> {
    return readJson<Alarm[]>(KEYS.alarms, []);
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
