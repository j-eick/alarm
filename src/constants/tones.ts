import type { ToneId } from '@/types';

export interface ToneOption {
  id: ToneId;
  label: string;
  /** Short description of the speaking style for the AI prompt / TTS delivery. */
  promptHint: string;
  /** Speaking rate for TTS delivery (Fish Audio `prosody.speed`, 0.5–2.0). Default 1.0. */
  ttsSpeed?: number;
}

/**
 * Speaking tones (delivery style), independent of content. Order = display order.
 * Extensible via registry pattern (new tone = entry here + in `ToneId`).
 */
export const TONE_OPTIONS: ToneOption[] = [
  { id: 'gentle', label: 'Gentle', promptHint: 'careful, quiet and soothing', ttsSpeed: 0.8 },
  { id: 'cheerful', label: 'Cheerful', promptHint: 'upbeat, positive and warm', ttsSpeed: 1.1 },
  { id: 'energetic', label: 'Energetic', promptHint: 'driving and rousing, full of energy', ttsSpeed: 1.35 },
  { id: 'motivating', label: 'Motivating', promptHint: 'uplifting and encouraging, like a coach', ttsSpeed: 1.2 },
  { id: 'dramatic', label: 'Dramatic', promptHint: 'grandiose and cinematic, big gesture', ttsSpeed: 0.85 },
  { id: 'dry', label: 'Dry', promptHint: 'laconic, with dry humor', ttsSpeed: 0.95 },
  { id: 'strict', label: 'Strict', promptHint: 'firm and uncompromising, no excuses', ttsSpeed: 1.0 },
];

const TONE_BY_ID: Record<ToneId, ToneOption> = Object.fromEntries(
  TONE_OPTIONS.map((t) => [t.id, t]),
) as Record<ToneId, ToneOption>;

export function toneOption(id: ToneId): ToneOption {
  return TONE_BY_ID[id];
}

export const DEFAULT_TONE: ToneId = 'motivating';
