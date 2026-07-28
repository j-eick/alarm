import type { WakeExample } from '@/constants/showcase';

/** Props aller Kachel-Varianten — einheitlich, damit sie austauschbar sind. */
export interface ExampleTileProps {
  example: WakeExample;
  onPress: () => void;
}
