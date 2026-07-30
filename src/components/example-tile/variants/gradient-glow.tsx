/**
 * Tile design "v1-gradient-glow" (first iteration).
 *
 * Subtle diagonal gradient + soft blob artifacts, vector icon,
 * kicker/title/description. Minimalist-modern, theme-safe.
 * Activated via constants/design.ts → TILE_VARIANT.
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ExampleTileProps } from '../types';

export function GradientGlowTile({ example, onPress }: ExampleTileProps) {
  const theme = useTheme();
  const { color } = example;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      {/* Subtle diagonal gradient in the accent color */}
      <LinearGradient
        colors={[`${color}26`, `${color}05`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Soft blob artifacts for a bit of depth */}
      <View style={[styles.blob, styles.blobTop, { backgroundColor: `${color}14` }]} />
      <View style={[styles.blob, styles.blobBottom, { backgroundColor: `${color}0F` }]} />

      {/* Content */}
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: color }]}>
          <Ionicons name={example.icon} size={22} color="#ffffff" />
        </View>

        <View style={styles.body}>
          <ThemedText type="smallBold" style={[styles.kicker, { color }]}>
            {example.kicker.toUpperCase()}
          </ThemedText>
          <ThemedText type="smallBold" style={styles.title}>
            {example.title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {example.description}
          </ThemedText>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.textSecondary}
          style={styles.chevron}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: Spacing.four,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.85 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 3 },
  kicker: { fontSize: 11, letterSpacing: 1.2 },
  title: { fontSize: 16 },
  chevron: { opacity: 0.6 },
  // Decorative, soft-looking circles (clipped by overflow:hidden)
  blob: { position: 'absolute', borderRadius: 999 },
  blobTop: { width: 120, height: 120, top: -46, right: -34 },
  blobBottom: { width: 84, height: 84, bottom: -34, left: 48 },
});
