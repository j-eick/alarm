import type { MoodId } from '@/types';

export interface MoodOption {
  id: MoodId;
  label: string;
  emoji: string;
  /** Kurzbeschreibung für den KI-Prompt (Ich-Form des Users). */
  promptHint: string;
}

/** Auswahlmöglichkeiten für den MoodPicker; Reihenfolge = Anzeige-Reihenfolge. */
export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'tired', label: 'Müde', emoji: '😴', promptHint: 'Ich bin sehr müde und komme schwer aus dem Bett.' },
  { id: 'stressed', label: 'Gestresst', emoji: '😰', promptHint: 'Ich bin gestresst und habe viel vor mir.' },
  { id: 'motivated', label: 'Motiviert', emoji: '💪', promptHint: 'Ich bin motiviert und will den Tag angehen.' },
  { id: 'energetic', label: 'Energetisch', emoji: '⚡', promptHint: 'Ich bin voller Energie und Tatendrang.' },
  { id: 'focused', label: 'Fokussiert', emoji: '🎯', promptHint: 'Ich bin konzentriert und will fokussiert starten.' },
  { id: 'happy', label: 'Fröhlich', emoji: '😄', promptHint: 'Ich bin gut gelaunt und fröhlich.' },
  { id: 'calm', label: 'Entspannt', emoji: '😌', promptHint: 'Ich bin ruhig und entspannt.' },
  { id: 'neutral', label: 'Neutral', emoji: '🙂', promptHint: 'Mir geht es neutral.' },
  { id: 'anxious', label: 'Nervös', emoji: '😟', promptHint: 'Ich bin nervös/ängstlich vor dem Tag.' },
  { id: 'overwhelmed', label: 'Überfordert', emoji: '😵', promptHint: 'Ich fühle mich überfordert von dem, was ansteht.' },
  { id: 'sad', label: 'Bedrückt', emoji: '😔', promptHint: 'Ich fühle mich niedergeschlagen und bedrückt.' },
];

const MOOD_BY_ID: Record<MoodId, MoodOption> = Object.fromEntries(
  MOOD_OPTIONS.map((m) => [m.id, m]),
) as Record<MoodId, MoodOption>;

export function moodOption(id: MoodId): MoodOption {
  return MOOD_BY_ID[id];
}
