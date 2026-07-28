/**
 * TTS-Provider: ElevenLabs (Cloud).
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
import type { TtsProvider } from '@/lib/ai/providers/types';

export const elevenLabsTtsProvider: TtsProvider = {
  id: 'elevenlabs',

  async synthesize(text: string): Promise<string | null> {
    const { apiKey, voiceId, baseUrl } = aiConfig.tts;
    const res = await fetch(`${baseUrl}/${voiceId}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'audio/mpeg',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`ElevenLabs ${res.status}: ${detail.slice(0, 200)}`);
    }

    const bytes = new Uint8Array(await res.arrayBuffer());
    const file = new File(Paths.cache, `wake-${Date.now()}.mp3`);
    if (file.exists) file.delete();
    file.write(bytes);
    return file.uri;
  },
};
