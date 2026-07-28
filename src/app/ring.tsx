import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAlarms } from '@/hooks/use-alarms';
import { generateWakeContent } from '@/lib/ai';
import { playWake, stopWake } from '@/lib/audio';
import { scheduleSnooze } from '@/lib/scheduler';
import { contentRepo } from '@/lib/storage';
import { formatTime } from '@/lib/time';
import type { GeneratedContent } from '@/types';

const SNOOZE_MINUTES = 5;

export default function RingScreen() {
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();
  const { getById, loading } = useAlarms();
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const startedRef = useRef(false);

  const alarm = alarmId ? getById(alarmId) : undefined;

  // Inhalt laden (zwischengespeichert) oder bei Bedarf frisch generieren, dann abspielen.
  useEffect(() => {
    if (loading || !alarmId || startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    (async () => {
      let loaded = await contentRepo.get(alarmId);
      if (!loaded && alarm) {
        loaded = await generateWakeContent(alarm);
        await contentRepo.set(loaded);
      }
      if (cancelled || !loaded) return;
      setContent(loaded);
      await playWake(loaded);
    })();

    return () => {
      cancelled = true;
      stopWake();
    };
  }, [loading, alarmId, alarm]);

  const handleStop = () => {
    stopWake();
    router.back();
  };

  const handleSnooze = async () => {
    stopWake();
    if (alarm) await scheduleSnooze(alarm, SNOOZE_MINUTES);
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <ThemedText style={styles.time}>
            {alarm ? formatTime(alarm.hour, alarm.minute) : '⏰'}
          </ThemedText>
          <ThemedText type="subtitle" style={styles.label}>
            {alarm?.label ?? 'Wecker'}
          </ThemedText>
        </View>

        <View style={styles.talk}>
          {content ? (
            <ThemedText type="default" style={styles.talkText}>
              {content.text}
            </ThemedText>
          ) : (
            <ActivityIndicator size="large" />
          )}
        </View>

        <View style={styles.actions}>
          <PrimaryButton title={`Schlummern (${SNOOZE_MINUTES} Min)`} variant="ghost" onPress={handleSnooze} />
          <PrimaryButton title="Stopp" onPress={handleStop} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: Spacing.four, justifyContent: 'space-between' },
  top: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.five },
  time: { fontSize: 72, fontWeight: '700', lineHeight: 78 },
  label: { textAlign: 'center' },
  talk: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.two },
  talkText: { fontSize: 22, lineHeight: 32, textAlign: 'center' },
  actions: { gap: Spacing.two },
});
