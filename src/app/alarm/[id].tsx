import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
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
import { PRESET_OPTIONS, presetOption } from '@/constants/presets';
import { Spacing } from '@/constants/theme';
import { TONE_OPTIONS, toneOption } from '@/constants/tones';
import { TOPIC_OPTIONS, topicOption } from '@/constants/topics';
import { VOICE_OPTIONS, voiceOption } from '@/constants/voices';
import { useTheme } from '@/hooks/use-theme';
import { useAlarms } from '@/hooks/use-alarms';
import { generateWakeContent } from '@/lib/ai';
import { createAlarmDraft } from '@/lib/alarm-factory';
import { playWake, stopWake } from '@/lib/audio';
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
 * Subtle summary of the decisions already made — shown below the progress
 * bar so the user can see, in later steps, what their selection is based on
 * (topic/own text/source, then tone & voice).
 */
function decisionCrumbs(step: Step, draft: Alarm): string[] {
  const basisLabel = (): string => {
    if (draft.source === 'verbatim') return 'Own text';
    switch (draft.aiBasis) {
      case 'text':
        return 'Own text · AI';
      case 'source':
        return 'Source';
      case 'topic':
      default:
        return `Topic · ${topicOption(draft.topic ?? 'motivation').label}`;
    }
  };
  const out: string[] = [];
  if (step === 'toneVoice' || step === 'schedule') out.push(basisLabel());
  if (step === 'schedule') {
    out.push(`Tone · ${toneOption(draft.tone).label}`);
    out.push(`Voice · ${voiceOption(draft.voice).label}`);
  }
  return out;
}

/** Small section title. */
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
  const { getById, saveAlarm } = useAlarms();

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

  // Stop speech output when leaving.
  useEffect(() => {
    return () => {
      stopWake();
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
    stopWake();
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

  // --- Basis (AI input) --------------------------------------------------------

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

  // --- Preview ------------------------------------------------------------------

  const preview = async () => {
    setGenError(null);
    setGenerating(true);
    stopWake();
    try {
      const content = await generateWakeContent(draft);
      if (draft.source === 'ai') patch({ text: content.text });
      if (!content.text.trim()) {
        setGenError('No text available.');
        return;
      }
      await playWake(content);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Could not generate.');
    } finally {
      setGenerating(false);
    }
  };

  // --- Navigation ---------------------------------------------------------------

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

  // Allowed to proceed?
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

          {/* Header: back + progress */}
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
                <ThemedText style={styles.stepTitle}>How should your wake-up sound be created?</ThemedText>
                <OptionCard
                  icon="albums-outline"
                  title="Preset"
                  desc="Choose a ready-made wake-up sound — fastest way."
                  onPress={() => chooseMode('preset')}
                  theme={theme}
                />
                <OptionCard
                  icon="sparkles-outline"
                  title="AI-generated"
                  desc="From a topic, your own text, or a source."
                  onPress={() => chooseMode('ki')}
                  theme={theme}
                />
              </>
            )}

            {step === 'preset' && (
              <>
                <ThemedText style={styles.stepTitle}>Choose a Preset</ThemedText>
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
                <ThemedText style={styles.stepTitle}>What should the AI draw from?</ThemedText>
                <View style={styles.segmented}>
                  {(
                    [
                      { id: 'topic', label: 'Topic' },
                      { id: 'text', label: 'Own Text' },
                      { id: 'source', label: 'Source' },
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
                      placeholder="Type or dictate your text …"
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
                        label="Read verbatim"
                        selected={verbatim}
                        onPress={() => {
                          setVerbatim(true);
                          applyTextMode(textValue, true);
                        }}
                      />
                      <Chip
                        label="Refine with AI"
                        selected={!verbatim}
                        onPress={() => {
                          setVerbatim(false);
                          applyTextMode(textValue, false);
                        }}
                      />
                    </View>
                    <ThemedText type="small" themeColor="textSecondary">
                      {verbatim
                        ? 'Your text is read out 1:1.'
                        : 'The AI picks up emotion & meaning and amplifies them slightly.'}
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
                      placeholder="Paste a link (https://…) or text"
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
                      You are responsible for whether you&apos;re allowed to use this source — use at your own risk.
                    </ThemedText>
                  </View>
                )}
              </>
            )}

            {step === 'toneVoice' && (
              <>
                <ThemedText style={styles.stepTitle}>Tone & Voice</ThemedText>
                <Section title="Tone">
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
                <Section title="Voice">
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
                  title={generating ? 'Generating …' : 'Preview'}
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
                <ThemedText style={[styles.stepTitle, styles.stepTitleCentered]}>Alarm Time</ThemedText>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={[styles.section, styles.timeRow]}>
                  {showPicker ? (
                    <DateTimePicker
                      value={dateFromHourMinute(draft.hour, draft.minute)}
                      mode="time"
                      is24Hour
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onTimeChange}
                      style={styles.timeWheel}
                    />
                  ) : (
                    <Pressable onPress={() => setShowPicker(true)} style={styles.timeDisplay}>
                      <ThemedText style={styles.time}>{formatTime(draft.hour, draft.minute)}</ThemedText>
                    </Pressable>
                  )}
                </View>
                <Section title="Weekdays (•)">
                  <WeekdayPicker
                    weekly={draft.weekdays}
                    once={draft.onceDays}
                    onChange={({ weekly, once }) => patch({ weekdays: weekly, onceDays: once })}
                  />
                </Section>
                <Section title="Label">
                  <TextInput
                    value={draft.label}
                    onChangeText={(label) => patch({ label })}
                    placeholder="e.g. Work"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
                  />
                </Section>
              </>
            )}
          </ScrollView>

          {/* Action bar */}
          <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.three + OVERSHOOT_PAD }]}>
            {step === 'schedule' ? (
              <View style={styles.actionRow}>
                <PrimaryButton title="Cancel" variant="neutral" onPress={animateClose} style={styles.actionButton} />
                <PrimaryButton title="Save" onPress={() => void handleSave()} style={styles.actionButton} />
              </View>
            ) : step === 'basis' || step === 'toneVoice' ? (
              <PrimaryButton title="Next" onPress={goNext} disabled={!canProceed} />
            ) : null}
          </View>

          {/* Consent modal (first use of an external source) */}
          {showConsent && (
            <View style={styles.consentOverlay}>
              <View style={[styles.consentCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <ThemedText type="smallBold">Use External Source</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  You can provide a text or link for the AI to build a wake-up sound from. Please check
                  yourself whether you&apos;re allowed to use this content for this purpose. Use is at your own
                  risk.
                </ThemedText>
                <View style={styles.consentActions}>
                  <PrimaryButton title="Cancel" variant="ghost" onPress={declineConsent} />
                  <PrimaryButton title="Understood" onPress={acceptConsent} />
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
  // Decision summary below the progress bar; paddingBottom deliberately
  // creates spacing from the section heading.
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
  stepTitleCentered: { textAlign: 'center', marginBottom: Spacing.half },
  divider: { height: 2, borderRadius: 1, marginBottom: Spacing.three },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  timeDisplay: { flexShrink: 0 },
  timeWheel: { flex: 1 },
  time: { fontSize: 56, fontWeight: '700', lineHeight: 62 },
  actions: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, gap: Spacing.two },
  actionRow: { flexDirection: 'row', gap: Spacing.two },
  actionButton: { flex: 1 },
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
