import type { VoiceId } from '@/types';

export interface VoiceOption {
  id: VoiceId;
  label: string;
  /** Kurzbeschreibung des Stimmcharakters. */
  description: string;
}

/**
 * Auswählbare Stimmen für die Sprachausgabe. Die Zuordnung zur konkreten
 * TTS-Anbieter-Stimme (z.B. ElevenLabs `voiceId`) passiert später in der
 * KI-Schicht; hier bleibt die Auswahl provider-unabhängig.
 */
export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'warm', label: 'Erzählerin', description: 'warm & nah' },
  { id: 'klar', label: 'Klar', description: 'neutral & deutlich' },
  { id: 'tief', label: 'Tief', description: 'ruhig & tief' },
];

const VOICE_BY_ID: Record<VoiceId, VoiceOption> = Object.fromEntries(
  VOICE_OPTIONS.map((v) => [v.id, v]),
) as Record<VoiceId, VoiceOption>;

export function voiceOption(id: VoiceId): VoiceOption {
  return VOICE_BY_ID[id];
}

export const DEFAULT_VOICE: VoiceId = 'warm';
