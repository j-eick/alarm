import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { moodOption } from '@/constants/moods';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getContentType } from '@/lib/ai/content-types';
import { formatTime } from '@/lib/time';
import { WEEKDAY_LABELS, type Alarm } from '@/types';

interface AlarmCardProps {
  alarm: Alarm;
  onPress: () => void;
  onToggle: (enabled: boolean) => void;
}

function weekdaysSummary(alarm: Alarm): string {
  if (alarm.weekdays.length === 0) return 'Einmalig';
  if (alarm.weekdays.length === 7) return 'Täglich';
  return alarm.weekdays.map((d) => WEEKDAY_LABELS[d]).join(' · ');
}

/** Listeneintrag eines Alarms mit Zeit, Meta und An/Aus-Schalter. */
export function AlarmCard({ alarm, onPress, onToggle }: AlarmCardProps) {
  const theme = useTheme();
  const mood = moodOption(alarm.context.mood);
  const content = getContentType(alarm.contentType);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.left}>
        <ThemedText style={[styles.time, { opacity: alarm.enabled ? 1 : 0.4 }]}>
          {formatTime(alarm.hour, alarm.minute)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {alarm.label} · {weekdaysSummary(alarm)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {mood.emoji} {content.label}
        </ThemedText>
      </View>
      <Switch value={alarm.enabled} onValueChange={onToggle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  left: { flex: 1, gap: Spacing.half },
  time: { fontSize: 40, fontWeight: '700', lineHeight: 44 },
});
