import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { PrimaryButton } from '@/components/primary-button';
import { SheetSurface } from '@/components/sheet-surface';
import { ThemedText } from '@/components/themed-text';
import { WeekdayPicker } from '@/components/weekday-picker';
import { Spacing } from '@/constants/theme';
import { TONE_OPTIONS } from '@/constants/tones';
import { TOPIC_OPTIONS } from '@/constants/topics';
import { VOICE_OPTIONS } from '@/constants/voices';
import { useTheme } from '@/hooks/use-theme';
import { useAlarms } from '@/hooks/use-alarms';
import { createAlarmDraft } from '@/lib/alarm-factory';
import { dateFromHourMinute, formatTime } from '@/lib/time';
import type { Alarm } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SCREEN_H = Dimensions.get('window').height;
// iOS-artige Feder: über das Dämpfungsverhältnis gesteuert. dampingRatio = 1
// bedeutet gar kein Überschwung; 0.93 lässt nur einen marginalen „Rubber-Band"-
// Rest übrig (deutlich unter dem vorherigen Verhalten).
const SPRING = { dampingRatio: 0.93, duration: 380 } as const;
// Das Sheet ragt um diesen Betrag unter den Bildschirmrand hinaus, damit ein
// Rest-Überschwung beim Einfahren nie den Backdrop unten freilegt.
const OVERSHOOT_PAD = 120;
/** Ab dieser Ziehdistanz (px) bzw. Geschwindigkeit schließt das Modal. */
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 800;

/** Kleiner Abschnittstitel. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {title.toUpperCase()}
      </ThemedText>
      {children}
    </View>
  );
}

export default function AlarmEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { getById, saveAlarm, deleteAlarm } = useAlarms();

  const isNew = id === 'new';
  // Entwurf einmalig initialisieren (neu oder aus dem Store geladen).
  const initial = useMemo<Alarm>(
    () => (isNew ? createAlarmDraft() : (getById(id) ?? createAlarmDraft())),
    // Bewusst nur an `id` gebunden — der Entwurf soll nicht bei jedem Render zurückgesetzt werden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const [draft, setDraft] = useState<Alarm>(initial);
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  // Sheet-Position: startet unterhalb des Viewports und federt beim Öffnen auf 0.
  const translateY = useSharedValue(SCREEN_H);
  // Backdrop-Deckkraft (0 = transparent, 1 = voll abgedunkelt). Fährt synchron
  // zum Sheet hoch bzw. beim Schließen wieder auf 0, damit die Abdunklung
  // sofort verschwindet und nicht erst beim Unmount des Screens.
  const backdropOpacity = useSharedValue(0);
  useEffect(() => {
    translateY.value = withSpring(0, SPRING);
    backdropOpacity.value = withTiming(1, { duration: 220 });
  }, [translateY, backdropOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

  const close = () => router.back();

  /** Sheet nach unten ausfahren, Backdrop ausblenden, danach schließen. */
  const animateClose = () => {
    backdropOpacity.value = withTiming(0, { duration: 220 });
    translateY.value = withTiming(SCREEN_H, { duration: 220 }, (finished) => {
      if (finished) runOnJS(close)();
    });
  };

  // Herunterziehen am Griff: Sheet folgt dem Finger; Loslassen schließt oder federt zurück.
  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      const dy = Math.max(0, e.translationY);
      translateY.value = dy;
      // Backdrop synchron zur Ziehdistanz aufhellen.
      backdropOpacity.value = Math.max(0, 1 - dy / SCREEN_H);
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_DISTANCE || e.velocityY > CLOSE_VELOCITY) {
        backdropOpacity.value = withTiming(0, { duration: 220 });
        translateY.value = withTiming(SCREEN_H, { duration: 220 }, (finished) => {
          if (finished) runOnJS(close)();
        });
      } else {
        translateY.value = withSpring(0, SPRING);
        backdropOpacity.value = withTiming(1, { duration: 220 });
      }
    });

  const patch = (changes: Partial<Alarm>) => setDraft((d) => ({ ...d, ...changes }));

  const onTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (date) patch({ hour: date.getHours(), minute: date.getMinutes() });
  };

  const handleSave = async () => {
    await saveAlarm(draft);
    animateClose();
  };

  const handleDelete = async () => {
    await deleteAlarm(draft.id);
    animateClose();
  };

  // Sheet startet ~ auf Höhe des Titels, sodass der Hintergrund oben durchscheint.
  const topGap = insets.top + 36;

  return (
    <View style={styles.root}>
      {/* Backdrop: Deckkraft wird animiert, damit die Abdunklung beim Schließen
          sofort verschwindet. Tippen schließt. */}
      <AnimatedPressable style={[styles.backdrop, backdropStyle]} onPress={animateClose} />

      <Animated.View style={[styles.sheetWrap, { top: topGap }, sheetStyle]}>
        <SheetSurface>
          {/* Griff zum Herunterziehen (Pan-Geste). */}
          <GestureDetector gesture={dragGesture}>
            <View style={styles.handleZone}>
              <View style={[styles.grabber, { backgroundColor: theme.textSecondary }]} />
            </View>
          </GestureDetector>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Uhrzeit */}
            <Section title="Uhrzeit">
              <Pressable onPress={() => setShowPicker((s) => !s)}>
                <ThemedText style={styles.time}>{formatTime(draft.hour, draft.minute)}</ThemedText>
              </Pressable>
              {showPicker && (
                <DateTimePicker
                  value={dateFromHourMinute(draft.hour, draft.minute)}
                  mode="time"
                  is24Hour
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                />
              )}
            </Section>

            {/* Wochentage */}
            <Section title="Wochentage (leer = einmalig)">
              <WeekdayPicker value={draft.weekdays} onChange={(weekdays) => patch({ weekdays })} />
            </Section>

            {/* Label */}
            <Section title="Label">
              <TextInput
                value={draft.label}
                onChangeText={(label) => patch({ label })}
                placeholder="z.B. Arbeit"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
              />
            </Section>

            {/* Quelle */}
            <Section title="Quelle">
              <View style={styles.chipRow}>
                <Chip
                  label="Eigener Text"
                  selected={draft.source === 'own'}
                  onPress={() => patch({ source: 'own' })}
                />
                <Chip
                  label="Überrasch mich"
                  selected={draft.source === 'ai'}
                  onPress={() => patch({ source: 'ai' })}
                />
              </View>
            </Section>

            {/* Entwurf — eigener Text (tippen/diktieren) oder Thema für die KI */}
            {draft.source === 'own' ? (
              <Section title="Dein Text">
                <TextInput
                  value={draft.text}
                  onChangeText={(text) => patch({ text })}
                  placeholder="Tippe oder diktiere deinen Weck-Text …"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  style={[
                    styles.input,
                    styles.multiline,
                    { color: theme.text, backgroundColor: theme.backgroundElement },
                  ]}
                />
              </Section>
            ) : (
              <Section title="Thema">
                <View style={styles.chipRow}>
                  {TOPIC_OPTIONS.map((t) => (
                    <Chip
                      key={t.id}
                      label={t.label}
                      selected={draft.topic === t.id}
                      onPress={() => patch({ topic: t.id })}
                    />
                  ))}
                </View>
              </Section>
            )}

            {/* Ton */}
            <Section title="Ton">
              <View style={styles.chipRow}>
                {TONE_OPTIONS.map((t) => (
                  <Chip
                    key={t.id}
                    label={t.label}
                    selected={draft.tone === t.id}
                    onPress={() => patch({ tone: t.id })}
                  />
                ))}
              </View>
            </Section>

            {/* Stimme */}
            <Section title="Stimme">
              <View style={styles.chipRow}>
                {VOICE_OPTIONS.map((v) => (
                  <Chip
                    key={v.id}
                    label={v.label}
                    selected={draft.voice === v.id}
                    onPress={() => patch({ voice: v.id })}
                  />
                ))}
              </View>
            </Section>
          </ScrollView>

          <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.three + OVERSHOOT_PAD }]}>
            <PrimaryButton title="Speichern" onPress={handleSave} />
            {!isNew && <PrimaryButton title="Löschen" variant="danger" onPress={handleDelete} />}
          </View>
        </SheetSurface>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
  // Absolut positioniert und unten über den Rand hinaus (bottom: -OVERSHOOT_PAD),
  // damit der Überschwung beim Einfahren den Backdrop nie freilegt.
  sheetWrap: { position: 'absolute', left: 0, right: 0, bottom: -OVERSHOOT_PAD },
  handleZone: { alignItems: 'center', paddingTop: Spacing.two, paddingBottom: Spacing.one },
  grabber: { width: 40, height: 5, borderRadius: 3, opacity: 0.4 },
  // flex:1 begrenzt die ScrollView-Höhe zwischen Griff und Aktionsleiste — sonst
  // wächst sie auf Inhaltshöhe und lässt sich nicht scrollen (untere Sektionen
  // werden abgeschnitten).
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
  },
  section: { gap: Spacing.two },
  time: { fontSize: 56, fontWeight: '700', lineHeight: 62 },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    minHeight: 48,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  actions: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, gap: Spacing.two },
});
