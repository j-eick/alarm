/**
 * Wiedergabe des Weck-Inhalts.
 *
 * Zwei Modi, hinter einer schmalen API:
 *  - `audioUri` vorhanden  → Abspielen der Cloud-TTS-Datei via expo-audio.
 *  - `audioUri` == null    → Vorlesen des Textes via Geräte-TTS (expo-speech).
 *
 * Der aufrufende Screen kennt diese Unterscheidung nicht — er ruft nur
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

/** Startet die Wiedergabe des Weck-Inhalts. */
export async function playWake(content: GeneratedContent): Promise<void> {
  stopWake();

  // Auch im Stumm-Modus abspielen (typisch für einen Wecker).
  await setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);

  if (content.audioUri) {
    activePlayer = createAudioPlayer(content.audioUri);
    activePlayer.play();
    return;
  }

  Speech.speak(content.text, { language: 'de-DE', rate: 1.0, pitch: 1.0 });
}

/** Stoppt jede laufende Wiedergabe und gibt Ressourcen frei. */
export function stopWake(): void {
  disposePlayer();
  Speech.stop();
}
