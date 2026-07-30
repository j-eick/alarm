import type { AiBasis, AlarmSource, ToneId, TopicId, VoiceId } from '@/types';

/**
 * Ready-made wake-up-sound presets. A preset pre-fills the draft (source +
 * tone + voice, optionally topic) and jumps straight to the schedule step.
 *
 * Extensible via registry pattern: new preset = entry here.
 */
export interface PresetOption {
  id: string;
  label: string;
  description: string;
  /** Accent color of the tile (works in light & dark). */
  color: string;
  source: AlarmSource;
  /** When `source: 'ai'`. */
  aiBasis?: AiBasis;
  topic?: TopicId;
  /** When `source: 'verbatim'`, the text to read out. */
  text?: string;
  tone: ToneId;
  voice: VoiceId;
}

export const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'gentle-start',
    label: 'Gentle Start',
    description: 'Calm and mindful out of sleep.',
    color: '#3C9EFF',
    source: 'ai',
    aiBasis: 'topic',
    topic: 'mindfulness',
    tone: 'gentle',
    voice: 'warm',
  },
  {
    id: 'power-motivation',
    label: 'Power Motivation',
    description: 'A direct push that accepts no excuses.',
    color: '#F76B15',
    source: 'ai',
    aiBasis: 'topic',
    topic: 'motivation',
    tone: 'energetic',
    voice: 'clear',
  },
  {
    id: 'daily-focus',
    label: 'Daily Focus',
    description: 'The most important thing first — a clear start to the day.',
    color: '#30A46C',
    source: 'ai',
    aiBasis: 'topic',
    topic: 'focus',
    tone: 'motivating',
    voice: 'warm',
  },
  {
    id: 'good-mood',
    label: 'Good Mood',
    description: 'Greet the day with gratitude and cheer.',
    color: '#E5484D',
    source: 'ai',
    aiBasis: 'topic',
    topic: 'gratitude',
    tone: 'cheerful',
    voice: 'warm',
  },
];

export function presetOption(id: string): PresetOption | undefined {
  return PRESET_OPTIONS.find((p) => p.id === id);
}
