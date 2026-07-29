/**
 * Prompt-Bau für die KI-Generierung.
 *
 * Reine Funktionen ohne Seiteneffekte. Der Ton steuert den Sprech-Stil, die
 * `aiBasis` steuert den Inhalt:
 *  - topic  → vordefiniertes Thema.
 *  - text   → eigener Text; Emotion + Semantik erfassen und leicht verstärken.
 *  - source → aus extrahiertem Quelltext ein kurzes Weck-Szenario bauen.
 */

import { toneOption } from '@/constants/tones';
import { DEFAULT_TOPIC, topicOption } from '@/constants/topics';
import type { Alarm, ToneId } from '@/types';

const SYSTEM_BASE =
  'Du bist ein Aufwach-Sprecher für eine Wecker-App. Sprich den Nutzer direkt und ' +
  'persönlich an (Du-Form). Antworte auf Deutsch mit 2–4 Sätzen, die man in ' +
  '~20–30 Sekunden vorlesen kann. Kein Markdown, keine Aufzählungen, keine Emojis — ' +
  'nur gesprochener Fließtext.';

/** System-Prompt inkl. gewünschtem Sprech-Ton. */
export function buildSystemPrompt(tone: ToneId): string {
  return `${SYSTEM_BASE} Halte den Ton ${toneOption(tone).promptHint}.`;
}

/**
 * User-Prompt je nach Grundlage. `sourceContent` ist der bereits eingelesene
 * externe Quelltext (nur bei `aiBasis: 'source'`).
 */
export function buildUserPrompt(alarm: Alarm, sourceContent?: string): string {
  switch (alarm.aiBasis) {
    case 'text': {
      const t = (alarm.basisText ?? '').trim();
      return (
        'Nimm den folgenden Text als Grundlage. Erfasse seine Emotion und Bedeutung ' +
        'und verstärke sie leicht, ohne den Sinn zu verändern oder zu übertreiben. ' +
        `Forme daraus einen gesprochenen Weckruf.\n\nText: „${t}"`
      );
    }
    case 'source': {
      const c = (sourceContent ?? '').trim();
      return (
        'Der folgende Inhalt stammt aus einer externen Quelle. Erstelle daraus ein ' +
        'kurzes, stimmiges Weck-Szenario, das den Nutzer auf den Tag einstimmt — ' +
        `greife das Wesentliche auf, ohne wörtlich zu zitieren.\n\nQuelle: „${c}"`
      );
    }
    case 'topic':
    default: {
      const t = topicOption(alarm.topic ?? DEFAULT_TOPIC);
      return `Wecke mich mit etwas zum Thema „${t.label}": ${t.promptHint}.`;
    }
  }
}

/** Deterministischer Fallback-Text ohne KI (Mock-Modus / Offline). */
export function mockWakeText(alarm: Alarm): string {
  const tone = toneOption(alarm.tone);
  switch (alarm.aiBasis) {
    case 'text': {
      const t = (alarm.basisText ?? '').trim();
      return t
        ? `Erinnere dich: ${t} — und genau damit startest du jetzt, ${tone.label.toLowerCase()} in den Tag.`
        : 'Steh auf und mach deinen Text zur Wirklichkeit — ein Schritt nach dem anderen.';
    }
    case 'source':
      return 'Dein Tag beginnt mit dem, was dich gerade beschäftigt. Nimm es auf und leg los — ein klarer erster Schritt genügt.';
    case 'topic':
    default: {
      const t = topicOption(alarm.topic ?? DEFAULT_TOPIC);
      return `Guten Morgen! Zeit für ${t.label.toLowerCase()} — ${t.promptHint}. Ein Schritt nach dem anderen.`;
    }
  }
}
