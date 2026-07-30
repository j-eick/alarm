import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** Selectable chip (for weekdays, mood, content type). Presentational. */
export function Chip({ label, selected, onPress }: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.accent : theme.backgroundElement,
          borderColor: selected ? theme.accent : theme.border,
        },
      ]}>
      <ThemedText
        type="small"
        style={{ color: selected ? theme.accentText : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
  },
});
