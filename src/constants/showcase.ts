/**
 * Beispiel-Wecktöne für den Leerzustand — zeigen die Bandbreite, die Attune
 * generieren kann (Star-Stimme, Gesang, kontextbasiert …).
 *
 * Rein illustrativ/erweiterbar: neue Kachel = neuer Eintrag hier. `color` gibt
 * der Kachel ihre Identität (Icon + Farbverlauf); `icon` ist ein Ionicons-Name.
 */

import type Ionicons from '@expo/vector-icons/Ionicons';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface WakeExample {
  id: string;
  /** Kleine Kategorie-Überschrift (Caps). */
  kicker: string;
  title: string;
  /** Sehr kurzer Titel für die kompakten Kacheln (nebeneinander). */
  shortTitle: string;
  description: string;
  icon: IoniconName;
  /** Akzentfarbe der Kachel (funktioniert in Light & Dark). */
  color: string;
}

export const WAKE_EXAMPLES: WakeExample[] = [
  {
    id: 'celebrity-voice',
    kicker: 'Star-Stimme',
    title: 'Wachgerüttelt von The Rock',
    shortTitle: 'The Rock',
    description: 'Kraftvoll und direkt — ein Motivationsschub, der keine Ausreden gelten lässt.',
    icon: 'flame-outline',
    color: '#F76B15',
  },
  {
    id: 'singing-voice',
    kicker: 'Gesangsstimme',
    title: 'Elsa singt dich wach',
    shortTitle: 'Elsa',
    description: 'Sanft und melodisch — ein Weckruf, der dich behutsam aus dem Schlaf holt.',
    icon: 'musical-notes-outline',
    color: '#3C9EFF',
  },
  {
    id: 'context-todos',
    kicker: 'Aus deinem Kontext',
    title: 'Dein Tag von gestern',
    shortTitle: 'To-Do-Liste',
    description: 'Greift deine priorisierten Aufgaben auf und bringt dich fokussiert in den Tag.',
    icon: 'checkmark-done-outline',
    color: '#30A46C',
  },
];
