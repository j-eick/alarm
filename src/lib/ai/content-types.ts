/**
 * Registry der Weck-Inhaltstypen.
 *
 * Erweiterbar per Registry-Muster: Ein neuer Inhaltstyp wird hier ergänzt
 * (Eintrag in `CONTENT_TYPES`) und in `ContentTypeId` (types.ts) — aufrufender
 * Code (Orchestrator, UI-Picker) bleibt unverändert. Alle Funktionen sind rein.
 */

import { moodOption } from '@/constants/moods';
import type { ContentTypeId, MoodContext } from '@/types';

export interface ContentTypeDefinition {
  id: ContentTypeId;
  label: string;
  description: string;
  /** System-Prompt für das Sprachmodell. */
  systemPrompt: string;
  /** Baut den User-Prompt aus dem erfassten Kontext (rein). */
  buildUserPrompt: (context: MoodContext) => string;
  /** Deterministischer Fallback-Text ohne KI (Mock-Modus / Offline). */
  mockText: (context: MoodContext) => string;
}

/** Gemeinsamer Kontext-Satz für Prompts + Mock. */
function contextLine(context: MoodContext): string {
  const hint = moodOption(context.mood).promptHint;
  const note = context.note?.trim();
  return note ? `${hint} Zusätzlich: ${note}` : hint;
}

export const CONTENT_TYPES: Record<ContentTypeId, ContentTypeDefinition> = {
  motivationalTalk: {
    id: 'motivationalTalk',
    label: 'Motivational Talk',
    description: 'Ein kurzer, persönlicher Motivationsschub zum Aufwachen.',
    systemPrompt:
      'Du bist ein warmherziger, energiegebender Aufwach-Coach. Sprich den Nutzer direkt und ' +
      'persönlich an (Du-Form). Antworte auf Deutsch mit 2–4 Sätzen, die man in ~20–30 Sekunden ' +
      'vorlesen kann. Kein Markdown, keine Aufzählungen, keine Emojis — nur gesprochener Fließtext.',
    buildUserPrompt: (c) =>
      `Wecke mich mit einem motivierenden Zuspruch. Meine Lage: ${contextLine(c)}`,
    mockText: (c) => {
      const hint = moodOption(c.mood).promptHint;
      return (
        `Guten Morgen! ${hint} Und genau deshalb stehst du jetzt auf. ` +
        `Ein Schritt nach dem anderen — du schaffst das, und der Tag gehört dir.`
      );
    },
  },

  affirmation: {
    id: 'affirmation',
    label: 'Affirmation',
    description: 'Ruhige, positive Selbstbestätigung für einen sanften Start.',
    systemPrompt:
      'Du formulierst ruhige, positive Affirmationen auf Deutsch. Antworte mit 2–3 kurzen ' +
      'Ich-Sätzen, ruhig und bestärkend. Kein Markdown, keine Emojis — nur gesprochener Fließtext.',
    buildUserPrompt: (c) => `Gib mir passende Morgen-Affirmationen. Meine Lage: ${contextLine(c)}`,
    mockText: () =>
      'Ich bin ausgeruht genug, um zu beginnen. Ich gehe diesen Tag ruhig und klar an. ' +
      'Ich vertraue darauf, dass ich Schritt für Schritt vorankomme.',
  },

  newsBriefing: {
    id: 'newsBriefing',
    label: 'Tages-Fokus',
    description: 'Ein knappes Briefing, das den Fokus für den Tag setzt.',
    systemPrompt:
      'Du bist ein prägnanter Morgen-Assistent. Fasse auf Deutsch in 2–3 Sätzen einen fokussierten ' +
      'Start in den Tag zusammen, abgestimmt auf die Lage des Nutzers. Kein Markdown, keine Emojis.',
    buildUserPrompt: (c) =>
      `Gib mir einen fokussierten Tagesstart (ohne echte Nachrichten zu erfinden). Meine Lage: ${contextLine(c)}`,
    mockText: (c) => {
      const note = c.note?.trim();
      return note
        ? `Dein Fokus heute: ${note}. Beginne mit dem Wichtigsten, den Rest sortierst du danach.`
        : 'Dein Fokus heute: das Wichtigste zuerst. Ein klarer erster Schritt bringt den ganzen Tag ins Rollen.';
    },
  },
};

export function getContentType(id: ContentTypeId): ContentTypeDefinition {
  return CONTENT_TYPES[id];
}

/** Optionen für UI-Picker (aus der Registry abgeleitet). */
export const CONTENT_TYPE_OPTIONS = Object.values(CONTENT_TYPES);
