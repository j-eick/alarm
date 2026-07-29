import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlarmCard } from '@/components/alarm-card';
import { AppHeader } from '@/components/app-header';
import { ExampleTile } from '@/components/example-tile';
import { ExampleTileCompact } from '@/components/example-tile-compact';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { WAKE_EXAMPLES } from '@/constants/showcase';
import { useAlarms } from '@/hooks/use-alarms';

export default function AlarmListScreen() {
  const { alarms, loading, toggleAlarm } = useAlarms();
  const hasAlarms = alarms.length > 0;

  const goCreate = () => router.push({ pathname: '/alarm/[id]', params: { id: 'new' } });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <FlatList
          data={alarms}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <AppHeader />
              {hasAlarms && (
                <>
                  <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
                    VORSCHLÄGE
                  </ThemedText>
                  <View style={styles.compactRow}>
                    {WAKE_EXAMPLES.map((ex) => (
                      <ExampleTileCompact key={ex.id} example={ex} onPress={goCreate} />
                    ))}
                  </View>
                  <ThemedText
                    type="smallBold"
                    themeColor="textSecondary"
                    style={[styles.sectionLabel, styles.sectionLabelTop]}>
                    DEINE WECKER
                  </ThemedText>
                </>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <AlarmCard
              alarm={item}
              onPress={() => router.push({ pathname: '/alarm/[id]', params: { id: item.id } })}
              onToggle={(enabled) => void toggleAlarm(item.id, enabled)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.three }} />}
          ListEmptyComponent={
            loading ? null : (
              <View style={styles.empty}>
                <ThemedText style={styles.emptyTitle}>Dein erster Weckton</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.emptyIntro}>
                  Nicht nur laut — ein kompletter Weckton, zugeschnitten auf dich. Zum Beispiel:
                </ThemedText>
                <View style={styles.tiles}>
                  {WAKE_EXAMPLES.map((ex) => (
                    <ExampleTile key={ex.id} example={ex} onPress={goCreate} />
                  ))}
                </View>
              </View>
            )
          }
        />
        <PrimaryButton title="Weckton erstellen" onPress={goCreate} style={styles.addButton} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.four },
  list: { paddingBottom: Spacing.three, flexGrow: 1 },
  sectionLabel: { letterSpacing: 1, marginBottom: Spacing.two },
  sectionLabelTop: { marginTop: Spacing.four },
  compactRow: { flexDirection: 'row', gap: Spacing.two },
  addButton: { marginBottom: Spacing.three },
  empty: { gap: Spacing.two },
  emptyTitle: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  emptyIntro: { marginBottom: Spacing.three },
  tiles: { gap: Spacing.three },
});
