import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WEEKDAYS, WEEKDAY_LABELS, type Weekday } from '@/types';

interface WeekdayPickerProps {
  value: Weekday[];
  onChange: (weekdays: Weekday[]) => void;
}

/**
 * Mehrfachauswahl der Wochentage — 7 gleich breite, kompakte Buttons in einer
 * Zeile (flex:1, kein Umbruch). Leere Auswahl = einmaliger Alarm.
 */
export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  const theme = useTheme();

  const toggle = (day: Weekday) => {
    onChange(
      value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort((a, b) => a - b),
    );
  };

  return (
    <View style={styles.row}>
      {WEEKDAYS.map((day) => {
        const selected = value.includes(day);
        return (
          <Pressable
            key={day}
            onPress={() => toggle(day)}
            style={[
              styles.day,
              {
                backgroundColor: selected ? theme.accent : theme.backgroundElement,
                borderColor: selected ? theme.accent : theme.border,
              },
            ]}>
            <ThemedText type="small" style={{ color: selected ? theme.accentText : theme.text }}>
              {WEEKDAY_LABELS[day]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.one },
  day: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
