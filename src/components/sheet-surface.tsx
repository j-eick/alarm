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
 * Surface of the sheet that slides up. The look is controlled centrally via
 * SHEET_STYLE (constants/design.ts):
 *  - 'glass' → blur + slight transparency (background shows through)
 *  - 'solid' → opaque surface (effect fully off)
 * This lets the effect be removed with a single word.
 */
export function SheetSurface({ children, style }: SheetSurfaceProps) {
  const theme = useTheme();
  const scheme = useColorScheme();

  if (SHEET_STYLE === 'solid') {
    return <View style={[styles.surface, { backgroundColor: theme.background }, style]}>{children}</View>;
  }

  // 'glass': full background brightness like the main screen, just with a
  // subtle blur/transparency. High opacity → clear contrast against the
  // darkened backdrop; the blur only shows through slightly.
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
