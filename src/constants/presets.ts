import type { AiBasis, AlarmSource, ToneId, TopicId, VoiceId } from '@/types';

/**
 * Fertige Weckton-Vorlagen. Eine Vorlage befüllt den Entwurf vor (Quelle +
 * Ton + Stimme, ggf. Thema) und springt direkt zum Zeitplan.
 *
 * Erweiterbar per Registry-Muster: neue Vorlage = Eintrag hier.
 */
export interface PresetOption {
  id: string;
  label: string;
  description: string;
  /** Akzentfarbe der Kachel (funktioniert in Light & Dark). */
  color: string;
  source: AlarmSource;
  /** Bei `source: 'ai'`. */
  aiBasis?: AiBasis;
  topic?: TopicId;
  /** Bei `source: 'verbatim'` der vorzulesende Text. */
  text?: string;
  tone: ToneId;
  voice: VoiceId;
}

export const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'sanfter-start',
    label: 'Sanfter Start',
    description: 'Ruhig und achtsam aus dem Schlaf.',
    color: '#3C9EFF',
    source: 'ai',
    aiBasis: 'topic',
    topic: 'achtsamkeit',
    tone: 'sanft',
    voice: 'warm',
  },
  {
    id: 'power-motivation',
    label: 'Power-Motivation',
    description: 'Direkter Schub, der keine Ausreden gelten lässt.',
    color: '#F76B15',
    source: 'ai',
    aiBasis: 'topic',
    topic: 'motivation',
    tone: 'energetisch',
    voice: 'klar',
  },
  {
    id: 'tagesfokus',
    label: 'Tagesfokus',
    description: 'Das Wichtigste zuerst — klar sortiert in den Tag.',
    color: '#30A46C',
    source: 'ai',
    aiBasis: 'topic',
    topic: 'tagesfokus',
    tone: 'motivierend',
    voice: 'warm',
  },
  {
    id: 'gute-laune',
    label: 'Gute Laune',
    description: 'Dankbar und fröhlich den Tag begrüßen.',
    color: '#E5484D',
    source: 'ai',
    aiBasis: 'topic',
    topic: 'dankbarkeit',
    tone: 'froehlich',
    voice: 'warm',
  },
];

export function presetOption(id: string): PresetOption | undefined {
  return PRESET_OPTIONS.find((p) => p.id === id);
}
