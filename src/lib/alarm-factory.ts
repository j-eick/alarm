/** Creates a new alarm draft with sensible defaults. */

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
    weekdays: [1, 2, 3, 4, 5], // Mon–Fri (permanent)
    onceDays: [],
    label: 'Alarm',
    enabled: true,
    source: 'ai',
    text: '',
    tone: DEFAULT_TONE,
    voice: DEFAULT_VOICE,
    aiBasis: 'topic',
    topic: DEFAULT_TOPIC,
    scheduledIds: [],
  };
}
