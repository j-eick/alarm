/**
 * AI orchestrator: creates the wake-up content (text + optional audio) from an alarm.
 *
 * `generateWakeText` returns only the text (for "Preview"/"Re-roll"),
 * `generateWakeContent` additionally returns optional cloud TTS audio. For
 * `source: 'verbatim'`, the user's text is used directly; for `'ai'`,
 * Claude (or the mock) writes it based on the respective `aiBasis`.
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
 * Just the text. Can throw if an external source (`aiBasis: 'source'`)
 * can't be read — callers should show this to the user.
 */
export async function generateWakeText(alarm: Alarm): Promise<WakeText> {
  if (alarm.source === 'verbatim') {
    return { text: alarm.text.trim(), source: 'user' };
  }

  // Read the external source first if needed (throws on failure).
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

  // Audio — cloud TTS only with a key and when text is present; failure is non-critical (device TTS kicks in).
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
