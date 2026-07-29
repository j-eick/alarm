import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { toneOption } from '@/constants/tones';
import { topicOption } from '@/constants/topics';
import { useTheme } from '@/hooks/use-theme';
import { formatTime } from '@/lib/time';
import { WEEKDAY_LABELS, type Alarm } from '@/types';

interface AlarmCardProps {
  alarm: Alarm;
  onPress: () => void;
  onToggle: (enabled: boolean) => void;
}

function weekdaysSummary(alarm: Alarm): string {
  const once = alarm.onceDays ?? [];
  if (alarm.weekdays.length === 0 && once.length === 0) return 'Einmalig';
  if (alarm.weekdays.length === 7) return 'Täglich';
  // Dauerhafte und einmalige Tage zusammen, aufsteigend; `once` mit Punkt markiert.
  const days = [...new Set([...alarm.weekdays, ...once])].sort((a, b) => a - b);
  return days.map((d) => (once.includes(d) ? `${WEEKDAY_LABELS[d]}•` : WEEKDAY_LABELS[d])).join(' · ');
}

/** Woher der Inhalt stammt — kurz für die Karte. */
function kindLabel(alarm: Alarm): string {
  if (alarm.source === 'verbatim') return 'Eigener Text';
  switch (alarm.aiBasis) {
    case 'text':
      return 'KI · eigener Text';
    case 'source':
      return 'KI · Quelle';
    case 'topic':
    default:
      return `KI · ${topicOption(alarm.topic ?? 'motivation').label}`;
  }
}

/** Listeneintrag eines Alarms mit Zeit, Meta und An/Aus-Schalter. */
export function AlarmCard({ alarm, onPress, onToggle }: AlarmCardProps) {
  const theme = useTheme();

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
          {kindLabel(alarm)} · {toneOption(alarm.tone).label}
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
