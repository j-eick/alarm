import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
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
import { PRESET_OPTIONS, presetOption } from '@/constants/presets';
import { Spacing } from '@/constants/theme';
import { TONE_OPTIONS, toneOption } from '@/constants/tones';
import { TOPIC_OPTIONS, topicOption } from '@/constants/topics';
import { VOICE_OPTIONS, voiceOption } from '@/constants/voices';
import { useTheme } from '@/hooks/use-theme';
import { useAlarms } from '@/hooks/use-alarms';
import { generateWakeText } from '@/lib/ai';
import { createAlarmDraft } from '@/lib/alarm-factory';
import { settingsRepo } from '@/lib/storage';
import { dateFromHourMinute, formatTime } from '@/lib/time';
import type { AiBasis, Alarm } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SCREEN_H = Dimensions.get('window').height;
const SPRING = { dampingRatio: 0.93, duration: 380 } as const;
const OVERSHOOT_PAD = 120;
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 800;

type Step = 'how' | 'preset' | 'basis' | 'toneVoice' | 'schedule';
type Mode = 'preset' | 'ki';

const KI_FLOW: Step[] = ['how', 'basis', 'toneVoice', 'schedule'];
const PRESET_FLOW: Step[] = ['how', 'preset', 'schedule'];

/**
 * Subtile Zusammenfassung der bereits getroffenen Entscheidungen — wird unter
 * den Statusbalken angezeigt, damit der Nutzer in Folgeschritten sieht, worauf
 * seine Auswahl basiert (Thema/eigener Text/Quelle, dann Ton & Stimme).
 */
function decisionCrumbs(step: Step, draft: Alarm): string[] {
  const basisLabel = (): string => {
    if (draft.source === 'verbatim') return 'Eigener Text';
    switch (draft.aiBasis) {
      case 'text':
        return 'Eigener Text · KI';
      case 'source':
        return 'Quelle';
      case 'topic':
      default:
        return `Thema · ${topicOption(draft.topic ?? 'motivation').label}`;
    }
  };
  const out: string[] = [];
  if (step === 'toneVoice' || step === 'schedule') out.push(basisLabel());
  if (step === 'schedule') {
    out.push(`Ton · ${toneOption(draft.tone).label}`);
    out.push(`Stimme · ${voiceOption(draft.voice).label}`);
  }
  return out;
}

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
  const initial = useMemo<Alarm>(
    () => (isNew ? createAlarmDraft() : (getById(id) ?? createAlarmDraft())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const [draft, setDraft] = useState<Alarm>(initial);
  const [step, setStep] = useState<Step>('how');
  const [mode, setMode] = useState<Mode>(initial.source === 'verbatim' ? 'ki' : 'ki');
  const [basisTab, setBasisTab] = useState<AiBasis>(
    initial.source === 'verbatim' ? 'text' : (initial.aiBasis ?? 'topic'),
  );
  const [verbatim, setVerbatim] = useState(initial.source === 'verbatim');
  const [textValue, setTextValue] = useState(initial.basisText ?? (initial.source === 'verbatim' ? initial.text : ''));
  const [sourceValue, setSourceValue] = useState(initial.sourceUrl ?? '');
  const [linkConsent, setLinkConsent] = useState(true);
  const [showConsent, setShowConsent] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  useEffect(() => {
    void settingsRepo.getLinkConsent().then(setLinkConsent);
  }, []);

  // Sprachausgabe beim Verlassen stoppen.
  useEffect(() => {
    return () => {
      void Speech.stop();
    };
  }, []);

  const translateY = useSharedValue(SCREEN_H);
  const backdropOpacity = useSharedValue(0);
  useEffect(() => {
    translateY.value = withSpring(0, SPRING);
    backdropOpacity.value = withTiming(1, { duration: 220 });
  }, [translateY, backdropOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

  const close = () => router.back();
  const animateClose = () => {
    Speech.stop();
    backdropOpacity.value = withTiming(0, { duration: 220 });
    translateY.value = withTiming(SCREEN_H, { duration: 220 }, (finished) => {
      if (finished) runOnJS(close)();
    });
  };

  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      const dy = Math.max(0, e.translationY);
      translateY.value = dy;
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

  // --- Grundlage (KI-Eingabe) -------------------------------------------------

  const applyTextMode = (value: string, asVerbatim: boolean) => {
    if (asVerbatim) patch({ source: 'verbatim', text: value });
    else patch({ source: 'ai', aiBasis: 'text', basisText: value });
  };

  const selectBasisTab = (tab: AiBasis) => {
    setBasisTab(tab);
    setGenError(null);
    if (tab === 'topic') patch({ source: 'ai', aiBasis: 'topic' });
    else if (tab === 'text') applyTextMode(textValue, verbatim);
    else {
      patch({ source: 'ai', aiBasis: 'source', sourceUrl: sourceValue });
      if (!linkConsent) setShowConsent(true);
    }
  };

  const acceptConsent = () => {
    void settingsRepo.setLinkConsent(true);
    setLinkConsent(true);
    setShowConsent(false);
  };

  const declineConsent = () => {
    setShowConsent(false);
    selectBasisTab('topic');
  };

  // --- Vorhören ---------------------------------------------------------------

  const preview = async () => {
    setGenError(null);
    setGenerating(true);
    Speech.stop();
    try {
      const { text } = await generateWakeText(draft);
      if (draft.source === 'ai') patch({ text });
      if (!text.trim()) {
        setGenError('Kein Text vorhanden.');
        return;
      }
      Speech.speak(text, { language: 'de-DE' });
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Konnte nicht generieren.');
    } finally {
      setGenerating(false);
    }
  };

  // --- Navigation -------------------------------------------------------------

  const flow = mode === 'preset' ? PRESET_FLOW : KI_FLOW;
  const stepIndex = Math.max(0, flow.indexOf(step));
  const crumbs = decisionCrumbs(step, draft);

  const goNext = () => {
    const next = flow[stepIndex + 1];
    if (next) setStep(next);
  };
  const goBack = () => {
    if (step === 'how') return animateClose();
    const prev = flow[stepIndex - 1];
    setStep(prev ?? 'how');
  };

  const chooseMode = (m: Mode) => {
    setMode(m);
    if (m === 'preset') setStep('preset');
    else {
      selectBasisTab(basisTab);
      setStep('basis');
    }
  };

  const choosePreset = (presetId: string) => {
    const p = presetOption(presetId);
    if (!p) return;
    patch({
      source: p.source,
      aiBasis: p.aiBasis,
      topic: p.topic,
      text: p.text ?? '',
      tone: p.tone,
      voice: p.voice,
    });
    setStep('schedule');
  };

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

  // Weiter erlaubt?
  const canProceed =
    step !== 'basis' ||
    (basisTab === 'topic'
      ? true
      : basisTab === 'text'
        ? textValue.trim().length > 0
        : sourceValue.trim().length > 0 && linkConsent);

  const topGap = insets.top + 36;

  return (
    <View style={styles.root}>
      <AnimatedPressable style={[styles.backdrop, backdropStyle]} onPress={animateClose} />

      <Animated.View
        style={[styles.sheetWrap, { top: topGap, height: SCREEN_H - topGap + OVERSHOOT_PAD }, sheetStyle]}>
        <SheetSurface>
          <GestureDetector gesture={dragGesture}>
            <View style={styles.handleZone}>
              <View style={[styles.grabber, { backgroundColor: theme.textSecondary }]} />
            </View>
          </GestureDetector>

          {/* Kopf: Zurück + Fortschritt */}
          <View style={styles.appbar}>
            <Pressable onPress={goBack} hitSlop={10} style={styles.back}>
              <Ionicons name="chevron-back" size={22} color={theme.text} />
            </Pressable>
            <View style={styles.progress}>
              {flow.slice(1).map((s, i) => (
                <View
                  key={s}
                  style={[
                    styles.progressSeg,
                    { backgroundColor: i < stepIndex ? theme.accent : theme.backgroundSelected },
                  ]}
                />
              ))}
            </View>
          </View>

          {crumbs.length > 0 && (
            <View style={styles.crumbs}>
              {crumbs.map((c) => (
                <View key={c} style={[styles.crumb, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {c}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {step === 'how' && (
              <>
                <ThemedText style={styles.stepTitle}>Wie soll dein Weckton entstehen?</ThemedText>
                <OptionCard
                  icon="albums-outline"
                  title="Vorlage"
                  desc="Fertigen Weckton auswählen — schnellster Weg."
                  onPress={() => chooseMode('preset')}
                  theme={theme}
                />
                <OptionCard
                  icon="sparkles-outline"
                  title="KI erstellt"
                  desc="Aus Thema, eigenem Text oder einer Quelle."
                  onPress={() => chooseMode('ki')}
                  theme={theme}
                />
              </>
            )}

            {step === 'preset' && (
              <>
                <ThemedText style={styles.stepTitle}>Vorlage wählen</ThemedText>
                {PRESET_OPTIONS.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => choosePreset(p.id)}
                    style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                    <View style={[styles.dot, { backgroundColor: p.color }]} />
                    <View style={styles.cardBody}>
                      <ThemedText type="smallBold">{p.label}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {p.description}
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
                  </Pressable>
                ))}
              </>
            )}

            {step === 'basis' && (
              <>
                <ThemedText style={styles.stepTitle}>Woraus soll die KI schöpfen?</ThemedText>
                <View style={styles.segmented}>
                  {(
                    [
                      { id: 'topic', label: 'Thema' },
                      { id: 'text', label: 'Eigener Text' },
                      { id: 'source', label: 'Quelle' },
                    ] as { id: AiBasis; label: string }[]
                  ).map((t) => {
                    const active = basisTab === t.id;
                    return (
                      <Pressable
                        key={t.id}
                        onPress={() => selectBasisTab(t.id)}
                        style={[
                          styles.segItem,
                          { backgroundColor: active ? theme.accent : theme.backgroundElement },
                        ]}>
                        <ThemedText type="small" style={{ color: active ? theme.accentText : theme.text }}>
                          {t.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>

                {basisTab === 'topic' && (
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
                )}

                {basisTab === 'text' && (
                  <View style={styles.section}>
                    <TextInput
                      value={textValue}
                      onChangeText={(v) => {
                        setTextValue(v);
                        applyTextMode(v, verbatim);
                      }}
                      placeholder="Tippe oder diktiere deinen Text …"
                      placeholderTextColor={theme.textSecondary}
                      multiline
                      style={[
                        styles.input,
                        styles.multiline,
                        { color: theme.text, backgroundColor: theme.backgroundElement },
                      ]}
                    />
                    <View style={styles.chipRow}>
                      <Chip
                        label="Wörtlich vorlesen"
                        selected={verbatim}
                        onPress={() => {
                          setVerbatim(true);
                          applyTextMode(textValue, true);
                        }}
                      />
                      <Chip
                        label="Von KI aufbereiten"
                        selected={!verbatim}
                        onPress={() => {
                          setVerbatim(false);
                          applyTextMode(textValue, false);
                        }}
                      />
                    </View>
                    <ThemedText type="small" themeColor="textSecondary">
                      {verbatim
                        ? 'Dein Text wird 1:1 vorgelesen.'
                        : 'Die KI erfasst Emotion & Bedeutung und verstärkt sie leicht.'}
                    </ThemedText>
                  </View>
                )}

                {basisTab === 'source' && (
                  <View style={styles.section}>
                    <TextInput
                      value={sourceValue}
                      onChangeText={(v) => {
                        setSourceValue(v);
                        patch({ sourceUrl: v });
                      }}
                      placeholder="Link (https://…) oder Text einfügen"
                      placeholderTextColor={theme.textSecondary}
                      autoCapitalize="none"
                      autoCorrect={false}
                      multiline
                      style={[
                        styles.input,
                        styles.multiline,
                        { color: theme.text, backgroundColor: theme.backgroundElement },
                      ]}
                    />
                    <ThemedText type="small" themeColor="textSecondary">
                      Du bist selbst dafür verantwortlich, ob du diese Quelle nutzen darfst — Verwendung auf eigenes Risiko.
                    </ThemedText>
                  </View>
                )}
              </>
            )}

            {step === 'toneVoice' && (
              <>
                <ThemedText style={styles.stepTitle}>Ton & Stimme</ThemedText>
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
                <PrimaryButton
                  title={generating ? 'Erstelle …' : 'Vorhören'}
                  variant="ghost"
                  loading={generating}
                  onPress={() => void preview()}
                />
                {draft.text.trim().length > 0 && !genError && (
                  <View style={[styles.previewBox, { backgroundColor: theme.backgroundElement }]}>
                    <ThemedText type="small">{draft.text}</ThemedText>
                  </View>
                )}
                {genError && (
                  <ThemedText type="small" style={{ color: theme.danger }}>
                    {genError}
                  </ThemedText>
                )}
              </>
            )}

            {step === 'schedule' && (
              <>
                <ThemedText style={styles.stepTitle}>Wann klingeln?</ThemedText>
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
                <Section title="Wochentage (leer = einmalig)">
                  <WeekdayPicker value={draft.weekdays} onChange={(weekdays) => patch({ weekdays })} />
                </Section>
                <Section title="Label">
                  <TextInput
                    value={draft.label}
                    onChangeText={(label) => patch({ label })}
                    placeholder="z.B. Arbeit"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
                  />
                </Section>
              </>
            )}
          </ScrollView>

          {/* Aktionsleiste */}
          <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.three + OVERSHOOT_PAD }]}>
            {step === 'schedule' ? (
              <>
                <PrimaryButton title="Speichern" onPress={() => void handleSave()} />
                {!isNew && <PrimaryButton title="Löschen" variant="danger" onPress={() => void handleDelete()} />}
              </>
            ) : step === 'basis' || step === 'toneVoice' ? (
              <PrimaryButton title="Weiter" onPress={goNext} disabled={!canProceed} />
            ) : null}
          </View>

          {/* Consent-Modal (Erstnutzung externe Quelle) */}
          {showConsent && (
            <View style={styles.consentOverlay}>
              <View style={[styles.consentCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <ThemedText type="smallBold">Externe Quelle nutzen</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Du kannst einen Text oder Link angeben, aus dem die KI einen Weckton erstellt. Bitte prüfe
                  selbst, ob du den Inhalt für diesen Zweck verwenden darfst. Die Nutzung erfolgt auf eigenes
                  Risiko.
                </ThemedText>
                <View style={styles.consentActions}>
                  <PrimaryButton title="Abbrechen" variant="ghost" onPress={declineConsent} />
                  <PrimaryButton title="Verstanden" onPress={acceptConsent} />
                </View>
              </View>
            </View>
          )}
        </SheetSurface>
      </Animated.View>
    </View>
  );
}

function OptionCard({
  icon,
  title,
  desc,
  onPress,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={[styles.cardIcon, { backgroundColor: theme.background }]}>
        <Ionicons name={icon} size={22} color={theme.accent} />
      </View>
      <View style={styles.cardBody}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {desc}
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
  sheetWrap: { position: 'absolute', left: 0, right: 0 },
  handleZone: { alignItems: 'center', paddingTop: Spacing.two, paddingBottom: Spacing.one },
  grabber: { width: 40, height: 5, borderRadius: 3, opacity: 0.4 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingBottom: Spacing.two },
  back: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  progress: { flexDirection: 'row', gap: 5, flex: 1 },
  progressSeg: { height: 4, flex: 1, borderRadius: 2 },
  // Entscheidungs-Zusammenfassung unter den Statusbalken; paddingBottom schafft
  // bewusst Abstand zur Kategorieüberschrift.
  crumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, paddingHorizontal: Spacing.four, paddingTop: Spacing.one, paddingBottom: Spacing.three },
  crumb: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.four, gap: Spacing.three },
  stepTitle: { fontSize: 22, fontWeight: '700', lineHeight: 28, marginBottom: Spacing.one },
  section: { gap: Spacing.two },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  cardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 2 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  segmented: { flexDirection: 'row', gap: Spacing.one },
  segItem: { flex: 1, paddingVertical: Spacing.two, borderRadius: Spacing.two, alignItems: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    minHeight: 48,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  previewBox: { padding: Spacing.three, borderRadius: Spacing.two },
  time: { fontSize: 56, fontWeight: '700', lineHeight: 62 },
  actions: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, gap: Spacing.two },
  consentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  consentCard: { width: '100%', maxWidth: 360, borderRadius: Spacing.three, borderWidth: 1, padding: Spacing.four, gap: Spacing.three },
  consentActions: { flexDirection: 'row', gap: Spacing.two, justifyContent: 'flex-end' },
});
