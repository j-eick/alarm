import type { VoiceId } from '@/types';

export interface VoiceOption {
  id: VoiceId;
  label: string;
  /** Short description of the voice character. */
  description: string;
}

/**
 * Selectable voices for speech output. The mapping to a concrete TTS
 * provider voice (e.g. Fish Audio `reference_id`) happens later in the
 * AI layer; here the selection stays provider-independent.
 */
export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'warm', label: 'Narrator', description: 'warm & close' },
  { id: 'clear', label: 'Clear', description: 'neutral & crisp' },
  { id: 'deep', label: 'Deep', description: 'calm & low' },
];

const VOICE_BY_ID: Record<VoiceId, VoiceOption> = Object.fromEntries(
  VOICE_OPTIONS.map((v) => [v.id, v]),
) as Record<VoiceId, VoiceOption>;

export function voiceOption(id: VoiceId): VoiceOption {
  return VOICE_BY_ID[id];
}

export const DEFAULT_VOICE: VoiceId = 'warm';
