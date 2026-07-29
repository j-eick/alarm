/**
 * KI-Orchestrator: erzeugt aus einem Alarm den Weck-Inhalt (Text + optional Audio).
 *
 * Öffentliche Schnittstelle der gesamten KI-Schicht. Bei `source: 'own'` wird der
 * Text des Nutzers direkt verwendet; bei `source: 'ai'` schreibt Claude (bzw. der
 * Mock) aus Thema + Ton. Danach optional Cloud-TTS. UI ruft nur `generateWakeContent`.
 */

import type { Alarm, GeneratedContent } from '@/types';

import { hasTextKey, hasTtsKey } from './config';
import { buildSystemPrompt, buildUserPrompt, mockWakeText } from './prompt';
import { claudeTextProvider } from './providers/claude-text';
import { elevenLabsTtsProvider } from './providers/elevenlabs-tts';
import { mockTextProvider } from './providers/mock-text';
import type { TextRequest } from './providers/types';

export async function generateWakeContent(alarm: Alarm): Promise<GeneratedContent> {
  let text: string;
  let source: GeneratedContent['source'];

  if (alarm.source === 'own') {
    // Eigener Text — keine Generierung nötig.
    text = alarm.text.trim();
    source = 'user';
  } else {
    // KI-Text aus Thema + Ton; Claude wenn Key vorhanden, sonst/​bei Fehler Mock.
    const req: TextRequest = {
      systemPrompt: buildSystemPrompt(alarm.tone),
      userPrompt: buildUserPrompt(alarm.topic),
      maxTokens: 400,
      fallbackText: mockWakeText(alarm),
    };
    try {
      if (!hasTextKey()) throw new Error('no-key');
      text = await claudeTextProvider.generate(req);
      source = 'claude';
    } catch {
      text = await mockTextProvider.generate(req);
      source = 'mock';
    }
  }

  // Audio — Cloud-TTS nur mit Key und wenn Text vorhanden; Fehler unkritisch (Geräte-TTS greift).
  let audioUri: string | null = null;
  if (hasTtsKey() && text.length > 0) {
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
