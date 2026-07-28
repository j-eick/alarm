/** Erzeugt einen neuen Alarm-Entwurf mit sinnvollen Defaults. */

import { createId } from '@/lib/id';
import type { Alarm } from '@/types';

export function createAlarmDraft(): Alarm {
  return {
    id: createId(),
    hour: 7,
    minute: 0,
    weekdays: [1, 2, 3, 4, 5], // Mo–Fr
    label: 'Wecker',
    enabled: true,
    context: { mood: 'neutral', note: '' },
    contentType: 'motivationalTalk',
    scheduledIds: [],
  };
}
