/**
 * Zentrale KI-Konfiguration.
 *
 * Keys/Modelle kommen aus Umgebungsvariablen (Expo inlined `EXPO_PUBLIC_*` zur
 * Build-Zeit). Ist kein Key gesetzt, läuft die App automatisch im Mock-Modus.
 *
 * ⚠️ Sicherheit: In dieser Prototyp-Iteration werden die Keys im Client
 * gehalten und direkt aufgerufen. Für ein Release gehört ein Backend-Proxy
 * davor — dann muss hier nur `anthropicBaseUrl`/`ttsBaseUrl` auf den Proxy
 * zeigen; die Provider-Implementierungen bleiben unverändert.
 */

const env = process.env;

export const aiConfig = {
  anthropic: {
    apiKey: env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
    model: env.EXPO_PUBLIC_ANTHROPIC_MODEL ?? 'claude-opus-4-8',
    baseUrl: env.EXPO_PUBLIC_ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com/v1/messages',
    maxTokens: 400,
  },
  /** Cloud-TTS (ElevenLabs als Beispiel-Anbieter). */
  tts: {
    apiKey: env.EXPO_PUBLIC_ELEVENLABS_API_KEY ?? '',
    voiceId: env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID ?? '21m00Tcm4TlvDq8ikWAM',
    baseUrl: env.EXPO_PUBLIC_ELEVENLABS_BASE_URL ?? 'https://api.elevenlabs.io/v1/text-to-speech',
  },
} as const;

/** Ist ein Text-Key vorhanden? Sonst → Mock-Text. */
export function hasTextKey(): boolean {
  return aiConfig.anthropic.apiKey.length > 0;
}

/** Ist ein Cloud-TTS-Key vorhanden? Sonst → Geräte-TTS beim Abspielen. */
export function hasTtsKey(): boolean {
  return aiConfig.tts.apiKey.length > 0;
}
