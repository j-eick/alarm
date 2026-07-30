/**
 * Playback of the wake-up content.
 *
 * Two modes, behind a narrow API:
 *  - `audioUri` present  → plays the cloud TTS file via expo-audio.
 *  - `audioUri` == null  → reads the text aloud via device TTS (expo-speech).
 *
 * The calling screen doesn't know about this distinction — it only calls
 * `playWake`/`stopWake`.
 */

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

import type { GeneratedContent } from '@/types';

let activePlayer: AudioPlayer | null = null;

function disposePlayer(): void {
  if (activePlayer) {
    activePlayer.remove();
    activePlayer = null;
  }
}

/** Starts playback of the wake-up content. */
export async function playWake(content: GeneratedContent): Promise<void> {
  stopWake();

  // Play even in silent mode (typical for an alarm).
  await setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);

  if (content.audioUri) {
    activePlayer = createAudioPlayer(content.audioUri);
    activePlayer.play();
    return;
  }

  Speech.speak(content.text, { language: 'en-US', rate: 1.0, pitch: 1.0 });
}

/** Stops any running playback and releases resources. */
export function stopWake(): void {
  disposePlayer();
  Speech.stop();
}
