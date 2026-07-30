/**
 * KI-Orchestrator: erzeugt aus einem Alarm den Weck-Inhalt (Text + optional Audio).
 *
 * `generateWakeText` liefert nur den Text (für „Vorhören"/„Neu würfeln"),
 * `generateWakeContent` zusätzlich optionales Cloud-TTS-Audio. Bei
 * `source: 'verbatim'` wird der Text des Nutzers direkt genutzt; bei `'ai'`
 * schreibt Claude (bzw. der Mock) aus der jeweiligen `aiBasis`.
 */

import type { Alarm, GeneratedContent } from '@/types';

import { toneOption } from '@/constants/tones';

import { hasTextKey, hasTtsKey } from './config';
import { ingestSource } from './ingest-source';
import { buildSystemPrompt, buildUserPrompt, mockWakeText } from './prompt';
import { claudeTextProvider } from './providers/claude-text';
import { fishAudioTtsProvider } from './providers/fish-audio-tts';
import { mockTextProvider } from './providers/mock-text';
import type { TextRequest } from './providers/types';

export interface WakeText {
  text: string;
  source: GeneratedContent['source'];
}

/**
 * Nur der Text. Kann werfen, wenn eine externe Quelle (`aiBasis: 'source'`)
 * nicht eingelesen werden kann — Aufrufer sollten das dem Nutzer zeigen.
 */
export async function generateWakeText(alarm: Alarm): Promise<WakeText> {
  if (alarm.source === 'verbatim') {
    return { text: alarm.text.trim(), source: 'user' };
  }

  // Externe Quelle ggf. zuerst einlesen (wirft bei Fehler).
  let sourceContent: string | undefined;
  if (alarm.aiBasis === 'source') {
    sourceContent = await ingestSource(alarm.sourceUrl ?? '');
  }

  const req: TextRequest = {
    systemPrompt: buildSystemPrompt(alarm.tone),
    userPrompt: buildUserPrompt(alarm, sourceContent),
    maxTokens: 400,
    fallbackText: mockWakeText(alarm),
  };

  try {
    if (!hasTextKey()) throw new Error('no-key');
    return { text: await claudeTextProvider.generate(req), source: 'claude' };
  } catch {
    return { text: await mockTextProvider.generate(req), source: 'mock' };
  }
}

export async function generateWakeContent(alarm: Alarm): Promise<GeneratedContent> {
  const { text, source } = await generateWakeText(alarm);

  // Audio — Cloud-TTS nur mit Key und wenn Text vorhanden; Fehler unkritisch (Geräte-TTS greift).
  let audioUri: string | null = null;
  if (hasTtsKey() && text.length > 0) {
    try {
      audioUri = await fishAudioTtsProvider.synthesize(text, {
        voice: alarm.voice,
        speed: toneOption(alarm.tone).ttsSpeed,
      });
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
