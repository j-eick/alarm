/**
 * Provider-Abstraktionen der KI-Schicht.
 *
 * UI/Orchestrator kennen nur diese Interfaces — konkrete Anbieter (Claude,
 * Mock, ElevenLabs …) sind austauschbar. Neuer Anbieter = neue Datei, die das
 * Interface implementiert; kein aufrufender Code ändert sich.
 */

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

/** Wandelt Text in eine abspielbare Audiodatei um (oder null → Geräte-TTS). */
export interface TtsProvider {
  readonly id: string;
  /** Gibt einen lokalen Datei-URI zurück, oder null wenn kein Audio erzeugt wurde. */
  synthesize(text: string): Promise<string | null>;
}
