import type { TopicId } from '@/types';

export interface TopicOption {
  id: TopicId;
  label: string;
  /** Steuert den KI-Prompt: worüber der Weck-Text handeln soll. */
  promptHint: string;
}

/**
 * Themen für die „Überrasch mich"-Generierung. Reihenfolge = Anzeige.
 * Erweiterbar per Registry-Muster (neues Thema = Eintrag hier + in `TopicId`).
 */
export const TOPIC_OPTIONS: TopicOption[] = [
  { id: 'motivation', label: 'Motivation', promptHint: 'ein motivierender Anstoß für den Tag' },
  { id: 'dankbarkeit', label: 'Dankbarkeit', promptHint: 'ein dankbarer, wertschätzender Gedanke zum Start' },
  { id: 'tagesfokus', label: 'Tagesfokus', promptHint: 'ein klarer Fokus für den Tag — das Wichtigste zuerst' },
  { id: 'achtsamkeit', label: 'Achtsamkeit', promptHint: 'ein ruhiger, achtsamer Moment beim Aufwachen' },
  { id: 'humor', label: 'Humor', promptHint: 'ein humorvoller, leichter Weckruf' },
];

const TOPIC_BY_ID: Record<TopicId, TopicOption> = Object.fromEntries(
  TOPIC_OPTIONS.map((t) => [t.id, t]),
) as Record<TopicId, TopicOption>;

export function topicOption(id: TopicId): TopicOption {
  return TOPIC_BY_ID[id];
}

export const DEFAULT_TOPIC: TopicId = 'motivation';
