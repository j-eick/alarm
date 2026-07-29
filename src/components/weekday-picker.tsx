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
import { WEEKDAYS, WEEKDAY_LABELS, type Weekday, type WeekdayMode } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
// Kurze, weiche Farbüberblendung beim Zustandswechsel.
const FADE_DURATION = 180;

interface WeekdayPickerProps {
  /** Dauerhaft aktive Tage (jede Woche). */
  weekly: Weekday[];
  /** Tage, die in diesem Zyklus genau einmal klingeln. */
  once: Weekday[];
  onChange: (next: { weekly: Weekday[]; once: Weekday[] }) => void;
}

const sortDays = (days: Weekday[]) => [...days].sort((a, b) => a - b);

/** Nächster Zustand im Zyklus: off → once → weekly → off. */
function nextMode(mode: WeekdayMode): WeekdayMode {
  if (mode === 'off') return 'once';
  if (mode === 'once') return 'weekly';
  return 'off';
}

/**
 * Wochentag-Auswahl mit drei Zuständen pro Tag: nicht markiert (`off`),
 * einmalig in diesem Zyklus (`once`, kleiner Punkt oben rechts) und dauerhaft
 * jede Woche (`weekly`, voll gefüllt). Tippen schaltet zyklisch weiter.
 */
export function WeekdayPicker({ weekly, once, onChange }: WeekdayPickerProps) {
  const modeOf = (day: Weekday): WeekdayMode =>
    weekly.includes(day) ? 'weekly' : once.includes(day) ? 'once' : 'off';

  const cycle = (day: Weekday) => {
    const target = nextMode(modeOf(day));
    const nextWeekly = weekly.filter((d) => d !== day);
    const nextOnce = once.filter((d) => d !== day);
    if (target === 'weekly') nextWeekly.push(day);
    if (target === 'once') nextOnce.push(day);
    onChange({ weekly: sortDays(nextWeekly), once: sortDays(nextOnce) });
  };

  return (
    <View style={styles.row}>
      {WEEKDAYS.map((day) => (
        <WeekdayButton
          key={day}
          label={WEEKDAY_LABELS[day]}
          mode={modeOf(day)}
          onPress={() => cycle(day)}
        />
      ))}
    </View>
  );
}

interface WeekdayButtonProps {
  label: string;
  mode: WeekdayMode;
  onPress: () => void;
}

/**
 * Einzelner Wochentag-Button. `weekly` blendet Hintergrund und Rand weich in
 * die Akzentfarbe über; `once` zeigt einen kleinen Akzent-Punkt oben rechts,
 * ohne den Button zu füllen. Die Textfarbe wird bewusst direkt (ohne Animation)
 * gesetzt, damit sie auf beiden Hintergründen gut lesbar bleibt.
 */
function WeekdayButton({ label, mode, onPress }: WeekdayButtonProps) {
  const theme = useTheme();
  const filled = mode === 'weekly';

  // 0 = nicht gefüllt, 1 = gefüllt (weekly) — sanft interpoliert.
  const fill = useDerivedValue(() => withTiming(filled ? 1 : 0, { duration: FADE_DURATION }));
  // Punkt für den `once`-Zustand.
  const dot = useDerivedValue(() => withTiming(mode === 'once' ? 1 : 0, { duration: FADE_DURATION }));
  // Kleiner Druck-Effekt, unabhängig vom Zustand.
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(fill.value, [0, 1], [theme.backgroundElement, theme.accent]),
    borderColor: interpolateColor(fill.value, [0, 1], [theme.border, theme.accent]),
    transform: [{ scale: withTiming(pressed.value ? 0.94 : 1, { duration: 80 }) }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dot.value,
    transform: [{ scale: dot.value }],
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
      <ThemedText type="small" style={{ color: filled ? theme.accentText : theme.text }}>
        {label}
      </ThemedText>
      <Animated.View style={[styles.dot, { backgroundColor: theme.accent }, dotStyle]} />
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
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
