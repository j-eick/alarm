/**
 * Provider-Abstraktionen der KI-Schicht.
 *
 * UI/Orchestrator kennen nur diese Interfaces — konkrete Anbieter (Claude,
 * Mock, Fish Audio …) sind austauschbar. Neuer Anbieter = neue Datei, die das
 * Interface implementiert; kein aufrufender Code ändert sich.
 */

import type { VoiceId } from '@/types';

export interface TextRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  /** Deterministischer Fallback, den Mock-/Fehlerpfade zurückgeben. */
  fallbackText: string;
}

/** Erzeugt den Weck-Text. */
export interface TextProvider {
  readonly id: 'claude' | 'mock';
  generate(req: TextRequest): Promise<string>;
}

export interface TtsSynthesizeOptions {
  voice: VoiceId;
  /** Sprechtempo, siehe `ToneOption.ttsSpeed`. */
  speed?: number;
}

/** Wandelt Text in eine abspielbare Audiodatei um (oder null → Geräte-TTS). */
export interface TtsProvider {
  readonly id: string;
  /** Gibt einen lokalen Datei-URI zurück, oder null wenn kein Audio erzeugt wurde. */
  synthesize(text: string, options: TtsSynthesizeOptions): Promise<string | null>;
}
