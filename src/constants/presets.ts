import type { ToneId, VoiceId } from '@/types';

/**
 * Ready-made wake-up-sound presets. A preset pre-fills the draft's tone +
 * voice and points at a curated quote category (`constants/quotes.ts`); the
 * user then picks one specific verbatim quote from that category in the
 * 'quotes' step before moving on to schedule.
 *
 * Extensible via registry pattern: new preset = entry here (+ a matching
 * category in `constants/quotes.ts` if it's a new one).
 */
export interface PresetOption {
  id: string;
  label: string;
  /** Short, snappy line under the label — sets the vibe, not a restatement. */
  subtitle: string;
  /** Accent color of the tile (works in light & dark). */
  color: string;
  /** Key into `quotesForCategory()`. */
  quoteCategory: string;
  tone: ToneId;
  voice: VoiceId;
}

export const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'gentle-start',
    label: 'Gentle Start',
    subtitle: 'Ease in, don’t snap awake.',
    color: '#3C9EFF',
    quoteCategory: 'mindfulness',
    tone: 'gentle',
    voice: 'warm',
  },
  {
    id: 'power-motivation',
    label: 'Power Motivation',
    subtitle: 'No snooze. Just go.',
    color: '#F76B15',
    quoteCategory: 'motivation',
    tone: 'energetic',
    voice: 'clear',
  },
  {
    id: 'daily-focus',
    label: 'Daily Focus',
    subtitle: 'One thing first. Then the rest.',
    color: '#30A46C',
    quoteCategory: 'focus',
    tone: 'motivating',
    voice: 'warm',
  },
  {
    id: 'good-mood',
    label: 'Good Mood',
    subtitle: 'Wake up thankful, not groggy.',
    color: '#E5484D',
    quoteCategory: 'gratitude',
    tone: 'cheerful',
    voice: 'warm',
  },
  {
    id: 'laugh-track',
    label: 'Laugh Track',
    subtitle: 'Wit before coffee.',
    color: '#FFC53D',
    quoteCategory: 'humor',
    tone: 'dry',
    voice: 'clear',
  },
  {
    id: 'main-character',
    label: 'Main Character',
    subtitle: 'Walk in like you own it.',
    color: '#8E4EC6',
    quoteCategory: 'confidence',
    tone: 'dramatic',
    voice: 'deep',
  },
  {
    id: 'open-mind',
    label: 'Open Mind',
    subtitle: 'What will you notice today?',
    color: '#12A594',
    quoteCategory: 'curiosity',
    tone: 'cheerful',
    voice: 'warm',
  },
  {
    id: 'unfiltered',
    label: 'Unfiltered',
    subtitle: 'Raw takes, zero chill.',
    color: '#E93D82',
    quoteCategory: 'social-media',
    tone: 'strict',
    voice: 'clear',
  },
  {
    id: 'old-souls',
    label: 'Old Souls',
    subtitle: 'Timeless lines, still true.',
    color: '#6E56CF',
    quoteCategory: 'wisdom',
    tone: 'dry',
    voice: 'deep',
  },
];

export function presetOption(id: string): PresetOption | undefined {
  return PRESET_OPTIONS.find((p) => p.id === id);
}
