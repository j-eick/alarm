/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { createContext, useContext } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ColorSchemeName = 'light' | 'dark';

/**
 * Optionaler Scheme-Override für einen Teilbaum.
 *
 * Ohne Provider (Standard) folgt `useTheme` weiterhin dem System — die App
 * verhält sich unverändert. Die Dev-Gallery (`app/(dev)/gallery.tsx`) nutzt den
 * Provider, um Hell & Dunkel gleichzeitig nebeneinander zu rendern.
 */
export const ThemeSchemeContext = createContext<ColorSchemeName | null>(null);

export function useTheme() {
  const override = useContext(ThemeSchemeContext);
  const scheme = useColorScheme();
  // Override gewinnt; sonst System; useColorScheme kann null/undefined liefern → 'light'.
  const active: ColorSchemeName = override ?? scheme ?? 'light';

  return Colors[active];
}
