import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { greeting } from '@/lib/time';

/** Home screen header: time-dependent greeting, wordmark, tagline. Presentational. */
export function AppHeader() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        {greeting()}
      </ThemedText>

      <View style={styles.wordmarkRow}>
        <ThemedText style={styles.wordmark}>{APP_NAME}</ThemedText>
        <View style={[styles.dot, { backgroundColor: theme.accent }]} />
      </View>

      <ThemedText type="small" themeColor="textSecondary" style={styles.tagline}>
        {APP_TAGLINE}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.half, paddingTop: Spacing.two, paddingBottom: Spacing.five },
  wordmarkRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.one },
  wordmark: { fontSize: 34, fontWeight: '800', lineHeight: 38, letterSpacing: -0.5 },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  tagline: { maxWidth: 320 },
});
