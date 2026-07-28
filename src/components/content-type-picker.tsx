import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { Spacing } from '@/constants/theme';
import { CONTENT_TYPE_OPTIONS } from '@/lib/ai/content-types';
import type { ContentTypeId } from '@/types';

interface ContentTypePickerProps {
  value: ContentTypeId;
  onChange: (id: ContentTypeId) => void;
}

/** Auswahl des Weck-Inhaltstyps (aus der KI-Registry abgeleitet). */
export function ContentTypePicker({ value, onChange }: ContentTypePickerProps) {
  return (
    <View style={styles.row}>
      {CONTENT_TYPE_OPTIONS.map((c) => (
        <Chip
          key={c.id}
          label={c.label}
          selected={c.id === value}
          onPress={() => onChange(c.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
