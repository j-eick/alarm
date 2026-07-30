import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'danger' | 'ghost' | 'neutral';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

/** Unified button in three variants. Purely presentational. */
export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: PrimaryButtonProps) {
  const theme = useTheme();

  const bg =
    variant === 'primary'
      ? theme.accent
      : variant === 'danger'
        ? theme.danger
        : variant === 'neutral'
          ? theme.textSecondary
          : 'transparent';
  const fg = variant === 'ghost' ? theme.accent : variant === 'neutral' ? theme.background : theme.accentText;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'ghost' && { borderWidth: 1, borderColor: theme.accent },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <ThemedText type="smallBold" style={{ color: fg }}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
