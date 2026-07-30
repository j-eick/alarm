/**
 * Domain store + hook: the UI's single interface to alarms.
 *
 * A module-wide store (via useSyncExternalStore) holds the alarm state so
 * all screens stay in sync (e.g. the list updates after saving in the
 * editor). Bundles persistence (storage), scheduling (scheduler) and
 * AI pre-generation (ai) into a few clearly named actions. This keeps
 * screens free of storage/notification/API details.
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

// --- Store internals ----------------------------------------------------------

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

/** Persists the list (sorted) and updates the store. */
async function persist(alarms: Alarm[]): Promise<void> {
  const sorted = [...alarms].sort(byTime);
  setState({ alarms: sorted, loading: false });
  await alarmsRepo.saveAll(sorted);
}

/** Applies the desired state of an alarm to the notifications. */
async function reconcileSchedule(alarm: Alarm): Promise<string[]> {
  await cancelAlarm(alarm.scheduledIds);
  return alarm.enabled ? scheduleAlarm(alarm) : [];
}

// --- Actions (module-wide stable) --------------------------------------------

/**
 * Creates or updates an alarm. Reconciles notifications and kicks off
 * AI pre-generation (non-blocking) so the ring screen has content right away.
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

/** Enables/disables an alarm (reschedule only, no regeneration). */
async function toggleAlarm(id: string, enabled: boolean): Promise<void> {
  const target = state.alarms.find((a) => a.id === id);
  if (!target) return;
  const scheduledIds = await reconcileSchedule({ ...target, enabled });
  await persist(state.alarms.map((a) => (a.id === id ? { ...a, enabled, scheduledIds } : a)));
}

/** Deletes an alarm along with its notifications and cached content. */
async function deleteAlarm(id: string): Promise<void> {
  const target = state.alarms.find((a) => a.id === id);
  if (target) await cancelAlarm(target.scheduledIds);
  await contentRepo.remove(id);
  await persist(state.alarms.filter((a) => a.id !== id));
}

function getById(id: string): Alarm | undefined {
  return state.alarms.find((a) => a.id === id);
}

// --- Hook -----------------------------------------------------------------

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

/** Sorts alarms by time (ascending). */
function byTime(a: Alarm, b: Alarm): number {
  return a.hour * 60 + a.minute - (b.hour * 60 + b.minute);
}
