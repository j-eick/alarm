/**
 * Domänen-Store + Hook: einzige Schnittstelle der UI zu Alarmen.
 *
 * Ein modulweiter Store (via useSyncExternalStore) hält den Alarmzustand, damit
 * alle Screens synchron bleiben (z.B. Liste aktualisiert sich nach dem Speichern
 * im Editor). Bündelt Persistenz (storage), Scheduling (scheduler) und
 * KI-Vorabgenerierung (ai) zu wenigen, klar benannten Aktionen. Screens
 * enthalten dadurch keine Storage-/Notification-/API-Details.
 */

import { useEffect, useSyncExternalStore } from 'react';

import { generateWakeContent } from '@/lib/ai';
import { cancelAlarm, scheduleAlarm } from '@/lib/scheduler';
import { alarmsRepo, contentRepo } from '@/lib/storage';
import type { Alarm } from '@/types';

interface AlarmState {
  alarms: Alarm[];
  loading: boolean;
}

// --- Store-Interna ----------------------------------------------------------

let state: AlarmState = { alarms: [], loading: true };
const listeners = new Set<() => void>();

function setState(next: AlarmState): void {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let initialized = false;
async function init(): Promise<void> {
  if (initialized) return;
  initialized = true;
  const alarms = await alarmsRepo.getAll();
  setState({ alarms, loading: false });
}

/** Persistiert die Liste (sortiert) und aktualisiert den Store. */
async function persist(alarms: Alarm[]): Promise<void> {
  const sorted = [...alarms].sort(byTime);
  setState({ alarms: sorted, loading: false });
  await alarmsRepo.saveAll(sorted);
}

/** Wendet den gewünschten Zustand eines Alarms auf die Notifications an. */
async function reconcileSchedule(alarm: Alarm): Promise<string[]> {
  await cancelAlarm(alarm.scheduledIds);
  return alarm.enabled ? scheduleAlarm(alarm) : [];
}

// --- Aktionen (modulweit stabil) -------------------------------------------

/**
 * Legt einen Alarm an oder aktualisiert ihn. Reconcilet Notifications und
 * stößt die KI-Vorabgenerierung an (nicht-blockierend), damit der Weck-Screen
 * sofort Inhalt hat.
 */
async function saveAlarm(alarm: Alarm): Promise<void> {
  const scheduledIds = await reconcileSchedule(alarm);
  const saved: Alarm = { ...alarm, scheduledIds };

  const others = state.alarms.filter((a) => a.id !== saved.id);
  await persist([...others, saved]);

  void generateWakeContent(saved)
    .then((content) => contentRepo.set(content))
    .catch(() => undefined);
}

/** Aktiviert/deaktiviert einen Alarm (nur Reschedule, keine Neugenerierung). */
async function toggleAlarm(id: string, enabled: boolean): Promise<void> {
  const target = state.alarms.find((a) => a.id === id);
  if (!target) return;
  const scheduledIds = await reconcileSchedule({ ...target, enabled });
  await persist(state.alarms.map((a) => (a.id === id ? { ...a, enabled, scheduledIds } : a)));
}

/** Löscht einen Alarm samt Notifications und zwischengespeichertem Inhalt. */
async function deleteAlarm(id: string): Promise<void> {
  const target = state.alarms.find((a) => a.id === id);
  if (target) await cancelAlarm(target.scheduledIds);
  await contentRepo.remove(id);
  await persist(state.alarms.filter((a) => a.id !== id));
}

function getById(id: string): Alarm | undefined {
  return state.alarms.find((a) => a.id === id);
}

// --- Hook -------------------------------------------------------------------

export function useAlarms() {
  const snapshot = useSyncExternalStore(subscribe, () => state);

  useEffect(() => {
    void init();
  }, []);

  return {
    alarms: snapshot.alarms,
    loading: snapshot.loading,
    saveAlarm,
    toggleAlarm,
    deleteAlarm,
    getById,
  };
}

/** Sortiert Alarme nach Uhrzeit (aufsteigend). */
function byTime(a: Alarm, b: Alarm): number {
  return a.hour * 60 + a.minute - (b.hour * 60 + b.minute);
}
