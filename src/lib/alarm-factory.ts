/** Erzeugt einen neuen Alarm-Entwurf mit sinnvollen Defaults. */

import { DEFAULT_TONE } from '@/constants/tones';
import { DEFAULT_TOPIC } from '@/constants/topics';
import { DEFAULT_VOICE } from '@/constants/voices';
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
    source: 'ai',
    text: '',
    topic: DEFAULT_TOPIC,
    tone: DEFAULT_TONE,
    voice: DEFAULT_VOICE,
    scheduledIds: [],
  };
}
