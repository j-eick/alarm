/**
 * Prompt-Bau für die KI-Generierung (Thema + Ton).
 *
 * Reine Funktionen ohne Seiteneffekte — ersetzt die frühere Content-Type-
 * Registry. Der Ton steuert den Sprech-Stil, das Thema den Inhalt.
 */

import { toneOption } from '@/constants/tones';
import { DEFAULT_TOPIC, topicOption } from '@/constants/topics';
import type { Alarm, ToneId, TopicId } from '@/types';

const SYSTEM_BASE =
  'Du bist ein Aufwach-Sprecher für eine Wecker-App. Sprich den Nutzer direkt und ' +
  'persönlich an (Du-Form). Antworte auf Deutsch mit 2–4 Sätzen, die man in ' +
  '~20–30 Sekunden vorlesen kann. Kein Markdown, keine Aufzählungen, keine Emojis — ' +
  'nur gesprochener Fließtext.';

/** System-Prompt inkl. gewünschtem Sprech-Ton. */
export function buildSystemPrompt(tone: ToneId): string {
  return `${SYSTEM_BASE} Halte den Ton ${toneOption(tone).promptHint}.`;
}

/** User-Prompt aus dem gewählten Thema. */
export function buildUserPrompt(topic: TopicId | undefined): string {
  const t = topicOption(topic ?? DEFAULT_TOPIC);
  return `Wecke mich mit etwas zum Thema „${t.label}": ${t.promptHint}.`;
}

/** Deterministischer Fallback-Text ohne KI (Mock-Modus / Offline). */
export function mockWakeText(alarm: Alarm): string {
  const t = topicOption(alarm.topic ?? DEFAULT_TOPIC);
  const tone = toneOption(alarm.tone);
  return (
    `Guten Morgen! Zeit für ${t.label.toLowerCase()} — ${t.promptHint}. ` +
    `Ein Schritt nach dem anderen, ${tone.label.toLowerCase()} in den Tag.`
  );
}
