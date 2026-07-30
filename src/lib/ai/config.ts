/**
 * Central AI configuration.
 *
 * Keys/models come from environment variables (Expo inlines `EXPO_PUBLIC_*`
 * at build time). If no key is set, the app automatically runs in mock mode.
 *
 * ⚠️ Security: in this prototype iteration, keys are held client-side and
 * called directly. A release needs a backend proxy in front — then only
 * `anthropicBaseUrl`/`ttsBaseUrl` need to point at the proxy here; the
 * provider implementations stay unchanged.
 */

const env = process.env;

export const aiConfig = {
  anthropic: {
    apiKey: env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
    model: env.EXPO_PUBLIC_ANTHROPIC_MODEL ?? 'claude-opus-4-8',
    baseUrl: env.EXPO_PUBLIC_ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com/v1/messages',
    maxTokens: 400,
  },
  /** Cloud TTS (Fish Audio). */
  tts: {
    apiKey: env.EXPO_PUBLIC_FISHAUDIO_API_KEY ?? '',
    model: env.EXPO_PUBLIC_FISHAUDIO_MODEL ?? 's2.1-pro-free',
    baseUrl: env.EXPO_PUBLIC_FISHAUDIO_BASE_URL ?? 'https://api.fish.audio/v1/tts',
  },
} as const;

/** Is a text key present? Otherwise → mock text. */
export function hasTextKey(): boolean {
  return aiConfig.anthropic.apiKey.length > 0;
}

/** Is a cloud TTS key present? Otherwise → device TTS during playback. */
export function hasTtsKey(): boolean {
  return aiConfig.tts.apiKey.length > 0;
}
