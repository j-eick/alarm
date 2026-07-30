/**
 * Provider abstractions of the AI layer.
 *
 * UI/orchestrator only know these interfaces — concrete providers (Claude,
 * mock, Fish Audio …) are swappable. New provider = new file implementing
 * the interface; no calling code changes.
 */

import type { VoiceId } from '@/types';

export interface TextRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  /** Deterministic fallback that mock/error paths return. */
  fallbackText: string;
}

/** Generates the wake-up text. */
export interface TextProvider {
  readonly id: 'claude' | 'mock';
  generate(req: TextRequest): Promise<string>;
}

export interface TtsSynthesizeOptions {
  voice: VoiceId;
  /** Speaking rate, see `ToneOption.ttsSpeed`. */
  speed?: number;
}

/** Turns text into a playable audio file (or null → device TTS). */
export interface TtsProvider {
  readonly id: string;
  /** Returns a local file URI, or null if no audio was generated. */
  synthesize(text: string, options: TtsSynthesizeOptions): Promise<string | null>;
}
