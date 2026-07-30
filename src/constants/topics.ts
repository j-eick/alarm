import type { TopicId } from '@/types';

export interface TopicOption {
  id: TopicId;
  label: string;
  /** Steers the AI prompt: what the wake-up text should be about. */
  promptHint: string;
}

/**
 * Topics for the "surprise me" generation. Order = display order.
 * Extensible via registry pattern (new topic = entry here + in `TopicId`).
 */
export const TOPIC_OPTIONS: TopicOption[] = [
  { id: 'motivation', label: 'Motivation', promptHint: 'a motivating push for the day' },
  { id: 'gratitude', label: 'Gratitude', promptHint: 'a grateful, appreciative thought to start with' },
  { id: 'focus', label: 'Focus', promptHint: 'a clear focus for the day — the most important thing first' },
  { id: 'mindfulness', label: 'Mindfulness', promptHint: 'a calm, mindful moment while waking up' },
  { id: 'humor', label: 'Humor', promptHint: 'a humorous, light-hearted wake-up call' },
];

const TOPIC_BY_ID: Record<TopicId, TopicOption> = Object.fromEntries(
  TOPIC_OPTIONS.map((t) => [t.id, t]),
) as Record<TopicId, TopicOption>;

export function topicOption(id: TopicId): TopicOption {
  return TOPIC_BY_ID[id];
}

export const DEFAULT_TOPIC: TopicId = 'motivation';
