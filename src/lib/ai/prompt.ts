/**
 * Prompt construction for AI generation.
 *
 * Pure functions with no side effects. The tone steers the speaking style,
 * the `aiBasis` steers the content:
 *  - topic  → predefined topic.
 *  - text   → own text; pick up emotion + semantics and amplify them slightly.
 *  - source → build a short wake-up scenario from extracted source text.
 */

import { toneOption } from '@/constants/tones';
import { DEFAULT_TOPIC, topicOption, type TopicOption } from '@/constants/topics';
import type { Alarm, ToneId } from '@/types';

const SYSTEM_BASE =
  'You are a wake-up speaker for an alarm app. Address the user directly and ' +
  'personally. Respond in English with 2–4 sentences that can be read aloud in ' +
  '~20–30 seconds. No markdown, no bullet points, no emojis — ' +
  'just spoken prose.';

/** System prompt including the desired speaking tone. */
export function buildSystemPrompt(tone: ToneId): string {
  return `${SYSTEM_BASE} Keep the tone ${toneOption(tone).promptHint}.`;
}

/**
 * User prompt depending on the basis. `sourceContent` is the already-fetched
 * external source text (only for `aiBasis: 'source'`).
 */
export function buildUserPrompt(alarm: Alarm, sourceContent?: string): string {
  switch (alarm.aiBasis) {
    case 'text': {
      const t = (alarm.basisText ?? '').trim();
      return (
        'Take the following text as a basis. Pick up its emotion and meaning ' +
        'and amplify them slightly, without changing the meaning or overdoing it. ' +
        `Shape it into a spoken wake-up call.\n\nText: "${t}"`
      );
    }
    case 'source': {
      const c = (sourceContent ?? '').trim();
      return (
        'The following content comes from an external source. Create a short, ' +
        'coherent wake-up scenario from it that gets the user in the mood for the day — ' +
        `pick up the essentials without quoting verbatim.\n\nSource: "${c}"`
      );
    }
    case 'topic':
    default: {
      const t = topicOption(alarm.topic ?? DEFAULT_TOPIC);
      return `Wake me up with something about "${t.label}": ${t.promptHint}.`;
    }
  }
}

/**
 * Distinct phrasing templates for the mock topic draft, applied to a topic's
 * label/hint. Templates (not per-topic literals) so a new topic added to the
 * registry automatically gets all variants — no second list to keep in sync.
 */
const MOCK_TOPIC_VARIANTS: ((topic: TopicOption) => string)[] = [
  (topic) => `Good morning! Time for ${topic.label.toLowerCase()} — ${topic.promptHint}. One step at a time.`,
  (topic) => `Rise and shine — today calls for ${topic.label.toLowerCase()}: ${topic.promptHint}. Let's go.`,
  (topic) => `Here's your wake-up nudge: ${topic.promptHint}. That's ${topic.label.toLowerCase()}, right from the start.`,
];

/**
 * Deterministic fallback text without AI (mock mode / offline). `variantIndex`
 * picks between a few distinct pre-written phrasings for the `topic` basis
 * (rotated via modulo) — without it, "Generate More" would look broken in
 * mock mode by producing 3 identical suggestions.
 */
export function mockWakeText(alarm: Alarm, variantIndex = 0): string {
  const tone = toneOption(alarm.tone);
  switch (alarm.aiBasis) {
    case 'text': {
      const t = (alarm.basisText ?? '').trim();
      return t
        ? `Remember: ${t} — and that's exactly what you're starting your day with now, ${tone.label.toLowerCase()}.`
        : 'Get up and turn your text into reality — one step at a time.';
    }
    case 'source':
      return 'Your day starts with what you have on your mind right now. Take it in and get going — one clear first step is enough.';
    case 'topic':
    default: {
      const t = topicOption(alarm.topic ?? DEFAULT_TOPIC);
      const variant = MOCK_TOPIC_VARIANTS[variantIndex % MOCK_TOPIC_VARIANTS.length];
      return variant(t);
    }
  }
}
