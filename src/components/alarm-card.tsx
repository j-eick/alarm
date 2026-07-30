import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

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
  onDelete: () => void;
  onSwipeableWillOpen?: () => void;
}

function weekdaysSummary(alarm: Alarm): string {
  const once = alarm.onceDays ?? [];
  if (alarm.weekdays.length === 0 && once.length === 0) return 'Once';
  if (alarm.weekdays.length === 7) return 'Daily';
  // Recurring and one-off days combined, ascending; `once` days marked with a dot.
  const days = [...new Set([...alarm.weekdays, ...once])].sort((a, b) => a - b);
  return days.map((d) => (once.includes(d) ? `${WEEKDAY_LABELS[d]}•` : WEEKDAY_LABELS[d])).join(' · ');
}

/** Where the content comes from — short form for the card. */
function kindLabel(alarm: Alarm): string {
  if (alarm.source === 'verbatim') return 'Own text';
  switch (alarm.aiBasis) {
    case 'text':
      return 'AI · own text';
    case 'source':
      return 'AI · source';
    case 'topic':
    default:
      return `AI · ${topicOption(alarm.topic ?? 'motivation').label}`;
  }
}

/** List entry for an alarm with time, meta and on/off switch. Swipe left to reveal delete. */
export const AlarmCard = forwardRef<Swipeable, AlarmCardProps>(function AlarmCard(
  { alarm, onPress, onToggle, onDelete, onSwipeableWillOpen },
  ref,
) {
  const theme = useTheme();

  return (
    <Swipeable
      ref={ref}
      overshootRight={false}
      onSwipeableWillOpen={onSwipeableWillOpen}
      renderRightActions={() => (
        <Pressable
          onPress={onDelete}
          style={[styles.deleteAction, { backgroundColor: theme.danger }]}>
          <Ionicons name="trash-outline" size={22} color={theme.accentText} />
        </Pressable>
      )}>
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
    </Swipeable>
  );
});

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
  deleteAction: {
    width: Spacing.five + Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.three,
    marginLeft: Spacing.two,
  },
});
