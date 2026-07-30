/**
 * TTS provider: Fish Audio (cloud, model `s2.1-pro-free`).
 *
 * Converts text into an MP3 file and stores it in the cache directory;
 * returns the file URI, which expo-audio can play. Without a key, this
 * provider is not used (the orchestrator checks `hasTtsKey`), and playback
 * falls back to device TTS (expo-speech).
 *
 * Note: this path only becomes active with a valid key and should then be
 * tested with a real key.
 */

import { File, Paths } from 'expo-file-system';

import { aiConfig } from '@/lib/ai/config';
import type { TtsProvider, TtsSynthesizeOptions } from '@/lib/ai/providers/types';
import type { VoiceId } from '@/types';

const env = process.env;

/**
 * Mapping `VoiceId → Fish Audio reference_id`. Placeholder — without an env
 * value, no `reference_id` is sent and Fish Audio uses its default voice.
 */
const REFERENCE_IDS: Record<VoiceId, string | undefined> = {
  warm: env.EXPO_PUBLIC_FISHAUDIO_VOICE_WARM || undefined,
  clear: env.EXPO_PUBLIC_FISHAUDIO_VOICE_CLEAR || undefined,
  deep: env.EXPO_PUBLIC_FISHAUDIO_VOICE_DEEP || undefined,
};

export const fishAudioTtsProvider: TtsProvider = {
  id: 'fish-audio',

  async synthesize(text: string, options: TtsSynthesizeOptions): Promise<string | null> {
    const { apiKey, model, baseUrl } = aiConfig.tts;
    const referenceId = REFERENCE_IDS[options.voice];

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
        model,
      },
      body: JSON.stringify({
        text,
        ...(referenceId ? { reference_id: referenceId } : {}),
        prosody: { speed: options.speed ?? 1.0 },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Fish Audio ${res.status}: ${detail.slice(0, 200)}`);
    }

    const bytes = new Uint8Array(await res.arrayBuffer());
    const file = new File(Paths.cache, `wake-${Date.now()}.mp3`);
    if (file.exists) file.delete();
    file.write(bytes);
    return file.uri;
  },
};
