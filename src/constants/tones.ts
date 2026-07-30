import type { ToneId } from '@/types';

export interface ToneOption {
  id: ToneId;
  label: string;
  /** Kurzbeschreibung des Sprech-Stils für den KI-Prompt / die TTS-Delivery. */
  promptHint: string;
  /** Sprechtempo für die TTS-Delivery (Fish Audio `prosody.speed`, 0.5–2.0). Default 1.0. */
  ttsSpeed?: number;
}

/**
 * Sprech-Töne (Delivery-Stil), unabhängig vom Inhalt. Reihenfolge = Anzeige.
 * Erweiterbar per Registry-Muster (neuer Ton = Eintrag hier + in `ToneId`).
 */
export const TONE_OPTIONS: ToneOption[] = [
  { id: 'sanft', label: 'Sanft', promptHint: 'behutsam, leise und beruhigend', ttsSpeed: 0.8 },
  { id: 'froehlich', label: 'Fröhlich', promptHint: 'gut gelaunt, positiv und warm', ttsSpeed: 1.1 },
  { id: 'energetisch', label: 'Energetisch', promptHint: 'treibend und wach machend, voller Energie', ttsSpeed: 1.35 },
  { id: 'motivierend', label: 'Motivierend', promptHint: 'aufbauend und bestärkend, wie ein Coach', ttsSpeed: 1.2 },
  { id: 'dramatisch', label: 'Dramatisch', promptHint: 'pathetisch und kinoreif, große Geste', ttsSpeed: 0.85 },
  { id: 'trocken', label: 'Trocken', promptHint: 'lakonisch, mit trockenem Humor', ttsSpeed: 0.95 },
  { id: 'streng', label: 'Streng', promptHint: 'bestimmt und kompromisslos, keine Ausreden', ttsSpeed: 1.0 },
];

const TONE_BY_ID: Record<ToneId, ToneOption> = Object.fromEntries(
  TONE_OPTIONS.map((t) => [t.id, t]),
) as Record<ToneId, ToneOption>;

export function toneOption(id: ToneId): ToneOption {
  return TONE_BY_ID[id];
}

export const DEFAULT_TONE: ToneId = 'motivierend';
