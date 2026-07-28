/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  // useColorScheme kann 'light' | 'dark' | null | undefined liefern → auf 'light' defaulten.
  const theme = scheme ?? 'light';

  return Colors[theme];
}
