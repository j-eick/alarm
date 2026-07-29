import type { ToneId } from '@/types';

export interface ToneOption {
  id: ToneId;
  label: string;
  /** Kurzbeschreibung des Sprech-Stils für den KI-Prompt / die TTS-Delivery. */
  promptHint: string;
}

/**
 * Sprech-Töne (Delivery-Stil), unabhängig vom Inhalt. Reihenfolge = Anzeige.
 * Erweiterbar per Registry-Muster (neuer Ton = Eintrag hier + in `ToneId`).
 */
export const TONE_OPTIONS: ToneOption[] = [
  { id: 'sanft', label: 'Sanft', promptHint: 'behutsam, leise und beruhigend' },
  { id: 'froehlich', label: 'Fröhlich', promptHint: 'gut gelaunt, positiv und warm' },
  { id: 'energetisch', label: 'Energetisch', promptHint: 'treibend und wach machend, voller Energie' },
  { id: 'motivierend', label: 'Motivierend', promptHint: 'aufbauend und bestärkend, wie ein Coach' },
  { id: 'dramatisch', label: 'Dramatisch', promptHint: 'pathetisch und kinoreif, große Geste' },
  { id: 'trocken', label: 'Trocken', promptHint: 'lakonisch, mit trockenem Humor' },
  { id: 'streng', label: 'Streng', promptHint: 'bestimmt und kompromisslos, keine Ausreden' },
];

const TONE_BY_ID: Record<ToneId, ToneOption> = Object.fromEntries(
  TONE_OPTIONS.map((t) => [t.id, t]),
) as Record<ToneId, ToneOption>;

export function toneOption(id: ToneId): ToneOption {
  return TONE_BY_ID[id];
}

export const DEFAULT_TONE: ToneId = 'motivierend';
