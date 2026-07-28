import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { MOOD_OPTIONS } from '@/constants/moods';
import { Spacing } from '@/constants/theme';
import type { MoodId } from '@/types';

interface MoodPickerProps {
  value: MoodId;
  onChange: (mood: MoodId) => void;
}

/** Auswahl der Grundstimmung. */
export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <View style={styles.row}>
      {MOOD_OPTIONS.map((m) => (
        <Chip
          key={m.id}
          label={m.label}
          selected={m.id === value}
          onPress={() => onChange(m.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
