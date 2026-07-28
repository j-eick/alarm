import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, useColorScheme, type ViewStyle } from 'react-native';

import { SHEET_STYLE } from '@/constants/design';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface SheetSurfaceProps {
  children: ReactNode;
  style?: ViewStyle;
}

/**
 * Oberfläche des hochschiebenden Sheets. Der Look wird zentral über
 * SHEET_STYLE (constants/design.ts) gesteuert:
 *  - 'glass' → Blur + leichte Transparenz (Hintergrund scheint durch)
 *  - 'solid' → deckende Fläche (Effekt komplett aus)
 * So lässt sich der Effekt mit einem Wort entfernen.
 */
export function SheetSurface({ children, style }: SheetSurfaceProps) {
  const theme = useTheme();
  const scheme = useColorScheme();

  if (SHEET_STYLE === 'solid') {
    return <View style={[styles.surface, { backgroundColor: theme.background }, style]}>{children}</View>;
  }

  // 'glass': volle Hintergrundhelligkeit wie der Hauptbildschirm, nur mit
  // dezentem Blur/Transparenz. Hohe Deckkraft → klarer Kontrast zum
  // abgedunkelten Backdrop; der Blur scheint nur noch leicht durch.
  const tint = scheme === 'dark' ? 'dark' : 'light';
  const overlay = scheme === 'dark' ? 'rgba(0,0,0,0.86)' : 'rgba(255,255,255,0.92)';

  return (
    <View style={[styles.surface, style]}>
      <BlurView intensity={40} tint={tint} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: overlay }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    overflow: 'hidden',
  },
});
