/**
 * Text-Provider: Mock.
 *
 * Gibt den deterministischen Fallback-Text zurück (aus der Content-Type-
 * Registry vorgebaut). Dient als Default ohne API-Key und als Fehlerpfad,
 * wenn Claude nicht erreichbar ist.
 */

import type { TextProvider, TextRequest } from '@/lib/ai/providers/types';

export const mockTextProvider: TextProvider = {
  id: 'mock',

  async generate(req: TextRequest): Promise<string> {
    // Kleine künstliche Latenz, damit sich der Ablauf realistisch anfühlt.
    await new Promise((r) => setTimeout(r, 150));
    return req.fallbackText;
  },
};
