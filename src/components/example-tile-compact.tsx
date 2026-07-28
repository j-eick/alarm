/**
 * Kompakte Beispiel-Kachel (Icon + Kurztitel) für die Reihe nebeneinander
 * über der Weckerliste. Gleiche Bildsprache wie „tile/v1-gradient-glow"
 * (Farbverlauf + Icon), nur reduziert. Präsentational.
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { WakeExample } from '@/constants/showcase';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ExampleTileCompactProps {
  example: WakeExample;
  onPress: () => void;
}

export function ExampleTileCompact({ example, onPress }: ExampleTileCompactProps) {
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
      <LinearGradient
        colors={[`${color}26`, `${color}05`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, { backgroundColor: `${color}14` }]} />

      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Ionicons name={example.icon} size={18} color="#ffffff" />
      </View>
      <ThemedText type="smallBold" numberOfLines={1} style={styles.title}>
        {example.shortTitle}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: Spacing.three,
    borderWidth: 1,
    overflow: 'hidden',
    padding: Spacing.two,
    alignItems: 'center',
    gap: Spacing.one,
  },
  pressed: { opacity: 0.85 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 13 },
  blob: { position: 'absolute', borderRadius: 999, width: 70, height: 70, top: -28, right: -20 },
});
