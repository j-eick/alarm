import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WEEKDAYS, WEEKDAY_LABELS, type Weekday } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
// Kurze, weiche Farbüberblendung beim (De-)Selektieren.
const FADE_DURATION = 180;

interface WeekdayPickerProps {
  value: Weekday[];
  onChange: (weekdays: Weekday[]) => void;
}

/**
 * Mehrfachauswahl der Wochentage — 7 gleich breite, kompakte Buttons in einer
 * Zeile (flex:1, kein Umbruch). Leere Auswahl = einmaliger Alarm.
 */
export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  const toggle = (day: Weekday) => {
    onChange(
      value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort((a, b) => a - b),
    );
  };

  return (
    <View style={styles.row}>
      {WEEKDAYS.map((day) => (
        <WeekdayButton
          key={day}
          label={WEEKDAY_LABELS[day]}
          selected={value.includes(day)}
          onPress={() => toggle(day)}
        />
      ))}
    </View>
  );
}

interface WeekdayButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * Einzelner Wochentag-Button. `selected` blendet Hintergrund und Rand weich
 * in die Akzentfarbe über; der Druck fügt eine kleine Skalierung hinzu. Die
 * Textfarbe wird bewusst direkt (ohne Animation) gesetzt, damit sie auf dem
 * hellen Hintergrund immer gut lesbar bleibt.
 */
function WeekdayButton({ label, selected, onPress }: WeekdayButtonProps) {
  const theme = useTheme();

  // 0 = nicht ausgewählt, 1 = ausgewählt — sanft interpoliert.
  const progress = useDerivedValue(() => withTiming(selected ? 1 : 0, { duration: FADE_DURATION }));
  // Kleiner Druck-Effekt, unabhängig von der Auswahl-Animation.
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.backgroundElement, theme.accent],
    ),
    borderColor: interpolateColor(progress.value, [0, 1], [theme.border, theme.accent]),
    transform: [{ scale: withTiming(pressed.value ? 0.94 : 1, { duration: 80 }) }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        pressed.value = 1;
      }}
      onPressOut={() => {
        pressed.value = 0;
      }}
      style={[styles.day, animatedStyle]}>
      <ThemedText type="small" style={{ color: selected ? theme.accentText : theme.text }}>
        {label}
      </ThemedText>
    </AnimatedPressable>
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
