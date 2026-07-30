/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { createContext, useContext } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ColorSchemeName = 'light' | 'dark';

/**
 * Optional scheme override for a subtree.
 *
 * Without a provider (default), `useTheme` still follows the system — the
 * app behaves unchanged. The dev gallery (`app/(dev)/gallery.tsx`) uses the
 * provider to render light & dark side by side simultaneously.
 */
export const ThemeSchemeContext = createContext<ColorSchemeName | null>(null);

export function useTheme() {
  const override = useContext(ThemeSchemeContext);
  const scheme = useColorScheme();
  // Override wins; otherwise system; useColorScheme can return null/undefined → 'light'.
  const active: ColorSchemeName = override ?? scheme ?? 'light';

  return Colors[active];
}
