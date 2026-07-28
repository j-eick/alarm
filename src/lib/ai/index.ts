/**
 * KI-Orchestrator: erzeugt aus einem Alarm den Weck-Inhalt (Text + optional Audio).
 *
 * Öffentliche Schnittstelle der gesamten KI-Schicht. Wählt Provider anhand der
 * Konfiguration und fällt bei fehlendem Key oder Fehler robust auf den Mock
 * bzw. Geräte-TTS zurück. UI ruft ausschließlich `generateWakeContent`.
 */

import type { Alarm, GeneratedContent } from '@/types';

import { hasTextKey, hasTtsKey } from './config';
import { getContentType } from './content-types';
import { claudeTextProvider } from './providers/claude-text';
import { elevenLabsTtsProvider } from './providers/elevenlabs-tts';
import { mockTextProvider } from './providers/mock-text';
import type { TextRequest } from './providers/types';

export async function generateWakeContent(alarm: Alarm): Promise<GeneratedContent> {
  const def = getContentType(alarm.contentType);
  const req: TextRequest = {
    systemPrompt: def.systemPrompt,
    userPrompt: def.buildUserPrompt(alarm.context),
    maxTokens: 400,
    fallbackText: def.mockText(alarm.context),
  };

  // 1) Text — Claude wenn Key vorhanden, sonst bzw. bei Fehler Mock.
  let text: string;
  let source: GeneratedContent['source'];
  try {
    if (!hasTextKey()) throw new Error('no-key');
    text = await claudeTextProvider.generate(req);
    source = 'claude';
  } catch {
    text = await mockTextProvider.generate(req);
    source = 'mock';
  }

  // 2) Audio — Cloud-TTS nur mit Key; Fehler ist unkritisch (Geräte-TTS greift).
  let audioUri: string | null = null;
  if (hasTtsKey()) {
    try {
      audioUri = await elevenLabsTtsProvider.synthesize(text);
    } catch {
      audioUri = null;
    }
  }

  return {
    alarmId: alarm.id,
    text,
    audioUri,
    source,
    generatedAt: Date.now(),
  };
}
