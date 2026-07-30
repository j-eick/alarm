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
// Short, soft color crossfade on state change.
const FADE_DURATION = 180;

interface WeekdayPickerProps {
  /** Permanently active days (every week). */
  weekly: Weekday[];
  /** Days that ring exactly once in this cycle. */
  once: Weekday[];
  onChange: (next: { weekly: Weekday[]; once: Weekday[] }) => void;
}

const sortDays = (days: Weekday[]) => [...days].sort((a, b) => a - b);

/** Next state in the cycle: off → once → weekly → off. */
function nextMode(mode: WeekdayMode): WeekdayMode {
  if (mode === 'off') return 'once';
  if (mode === 'once') return 'weekly';
  return 'off';
}

/**
 * Weekday picker with three states per day: not marked (`off`), once in
 * this cycle (`once`, small dot top-right) and permanently every week
 * (`weekly`, fully filled). Tapping cycles through the states.
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
 * Single weekday button. `weekly` softly crossfades background and border
 * into the accent color; `once` shows a small accent dot top-right, without
 * filling the button. Text color is deliberately set directly (without
 * animation) so it stays legible on both backgrounds.
 */
function WeekdayButton({ label, mode, onPress }: WeekdayButtonProps) {
  const theme = useTheme();
  const filled = mode === 'weekly';

  // 0 = not filled, 1 = filled (weekly) — softly interpolated.
  const fill = useDerivedValue(() => withTiming(filled ? 1 : 0, { duration: FADE_DURATION }));
  // Dot for the `once` state.
  const dot = useDerivedValue(() => withTiming(mode === 'once' ? 1 : 0, { duration: FADE_DURATION }));
  // Small press effect, independent of state.
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
