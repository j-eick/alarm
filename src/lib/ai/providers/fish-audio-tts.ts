/**
 * TTS-Provider: Fish Audio (Cloud, Modell `s2.1-pro-free`).
 *
 * Wandelt Text in eine MP3-Datei um und speichert sie im Cache-Verzeichnis;
 * gibt den Datei-URI zurück, den expo-audio abspielen kann. Ohne Key wird
 * dieser Provider nicht verwendet (Orchestrator prüft `hasTtsKey`), und das
 * Abspielen fällt auf Geräte-TTS (expo-speech) zurück.
 *
 * Hinweis: Dieser Pfad ist erst mit gültigem Key aktiv und sollte dann mit
 * einem echten Key getestet werden.
 */

import { File, Paths } from 'expo-file-system';

import { aiConfig } from '@/lib/ai/config';
import type { TtsProvider, TtsSynthesizeOptions } from '@/lib/ai/providers/types';
import type { VoiceId } from '@/types';

const env = process.env;

/**
 * Zuordnung `VoiceId → Fish-Audio reference_id`. Platzhalter — ohne env-Wert
 * wird kein `reference_id` gesendet und Fish Audio nutzt seine Standardstimme.
 */
const REFERENCE_IDS: Record<VoiceId, string | undefined> = {
  warm: env.EXPO_PUBLIC_FISHAUDIO_VOICE_WARM || undefined,
  klar: env.EXPO_PUBLIC_FISHAUDIO_VOICE_KLAR || undefined,
  tief: env.EXPO_PUBLIC_FISHAUDIO_VOICE_TIEF || undefined,
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
