/**
 * Example wake-up sounds for the empty state — showing the range Attune
 * can generate (celebrity voice, singing, context-based …).
 *
 * Purely illustrative/extensible: new tile = new entry here. `color` gives
 * the tile its identity (icon + gradient); `icon` is an Ionicons name.
 */

import type Ionicons from '@expo/vector-icons/Ionicons';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface WakeExample {
  id: string;
  /** Small category heading (caps). */
  kicker: string;
  title: string;
  /** Very short title for the compact tiles (side by side). */
  shortTitle: string;
  description: string;
  icon: IoniconName;
  /** Accent color of the tile (works in light & dark). */
  color: string;
}

export const WAKE_EXAMPLES: WakeExample[] = [
  {
    id: 'celebrity-voice',
    kicker: 'Celebrity Voice',
    title: 'Shaken Awake by The Rock',
    shortTitle: 'The Rock',
    description: 'Powerful and direct — a motivational push that accepts no excuses.',
    icon: 'flame-outline',
    color: '#F76B15',
  },
  {
    id: 'singing-voice',
    kicker: 'Singing Voice',
    title: 'Elsa Sings You Awake',
    shortTitle: 'Elsa',
    description: 'Gentle and melodic — a wake-up call that eases you out of sleep.',
    icon: 'musical-notes-outline',
    color: '#3C9EFF',
  },
  {
    id: 'context-todos',
    kicker: 'From Your Context',
    title: 'Your Day From Yesterday',
    shortTitle: 'To-Do List',
    description: 'Picks up your prioritized tasks and brings you focused into the day.',
    icon: 'checkmark-done-outline',
    color: '#30A46C',
  },
];
