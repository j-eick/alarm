/**
 * Dev-Gallery: rendert die realen UI-Komponenten isoliert, interaktiv und in
 * Hell/Dunkel — damit sich das Aussehen präzise iterieren lässt, ohne durch die
 * echte App zu navigieren. Route: `/gallery`.
 *
 * Nur im Dev-Build erreichbar (`__DEV__`-Guard); im Release-Build leitet sie um.
 * Auf breiten Viewports (Web/Tablet) stehen Hell & Dunkel nebeneinander, sonst
 * schaltet ein Auto/Hell/Dunkel-Umschalter das ganze Blatt.
 */

import { Redirect } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Chip } from '@/components/chip';
import { ContentTypePicker } from '@/components/content-type-picker';
import { MoodPicker } from '@/components/mood-picker';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WeekdayPicker } from '@/components/weekday-picker';
import { Spacing } from '@/constants/theme';
import { type ColorSchemeName, ThemeSchemeContext, useTheme } from '@/hooks/use-theme';
import type { ContentTypeId, MoodId, Weekday } from '@/types';

type Mode = 'system' | 'light' | 'dark';

export default function GalleryRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <Gallery />;
}

function Gallery() {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<Mode>('system');

  // Breit genug (Web/Tablet) → Hell & Dunkel direkt nebeneinander vergleichen.
  if (width >= 720) {
    return (
      <View style={styles.split}>
        <ThemeColumn scheme="light" label="Hell" />
        <View style={styles.divider} />
        <ThemeColumn scheme="dark" label="Dunkel" />
      </View>
    );
  }

  return (
    <ThemeSchemeContext.Provider value={mode === 'system' ? null : mode}>
      <GalleryFrame toolbar={<ModeToggle mode={mode} onChange={setMode} />} />
    </ThemeSchemeContext.Provider>
  );
}

function ThemeColumn({ scheme, label }: { scheme: ColorSchemeName; label: string }) {
  return (
    <ThemeSchemeContext.Provider value={scheme}>
      <View style={styles.flex}>
        <GalleryFrame toolbar={<Pill label={label} />} />
      </View>
    </ThemeSchemeContext.Provider>
  );
}

function GalleryFrame({ toolbar }: { toolbar?: ReactNode }) {
  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.eyebrow}>
              DEV · KOMPONENTEN
            </ThemedText>
            <ThemedText type="subtitle">Gallery</ThemedText>
          </View>
          {toolbar}
        </View>

        <View style={styles.stories}>
          <Story name="ThemedText">
            <TextSpecimens />
          </Story>
          <Story name="Chip">
            <ChipDemo />
          </Story>
          <Story name="PrimaryButton">
            <ButtonSpecimens />
          </Story>
          <Story name="WeekdayPicker">
            <WeekdayDemo />
          </Story>
          <Story name="MoodPicker">
            <MoodDemo />
          </Story>
          <Story name="ContentTypePicker">
            <ContentTypeDemo />
          </Story>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/* ---------- Rahmen-Bausteine ---------- */

function Story({ name, children }: { name: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.story}>
      <View style={styles.storyHead}>
        <View style={[styles.dot, { backgroundColor: theme.accent }]} />
        <ThemedText type="smallBold">{name}</ThemedText>
      </View>
      <View style={[styles.stage, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const theme = useTheme();
  const items: { id: Mode; label: string }[] = [
    { id: 'system', label: 'Auto' },
    { id: 'light', label: 'Hell' },
    { id: 'dark', label: 'Dunkel' },
  ];
  return (
    <View style={[styles.toggle, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      {items.map((it) => {
        const active = it.id === mode;
        return (
          <Pressable
            key={it.id}
            onPress={() => onChange(it.id)}
            style={[styles.toggleBtn, active && { backgroundColor: theme.accent }]}>
            <ThemedText type="small" style={{ color: active ? theme.accentText : theme.text }}>
              {it.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function Pill({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

/* ---------- Komponenten-Stories ---------- */

function TextSpecimens() {
  return (
    <View style={styles.stack}>
      <ThemedText type="subtitle">Subtitle</ThemedText>
      <ThemedText type="default">Default — der normale Fließtext der App.</ThemedText>
      <ThemedText type="smallBold">Small Bold</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Small · sekundär
      </ThemedText>
      <ThemedText type="link">Link</ThemedText>
      <ThemedText type="code">const wecker = 6;</ThemedText>
    </View>
  );
}

function ChipDemo() {
  const [on, setOn] = useState(true);
  return (
    <View style={styles.row}>
      <Chip label="Toggle mich" selected={on} onPress={() => setOn((v) => !v)} />
      <Chip label="Ausgewählt" selected onPress={() => {}} />
      <Chip label="Inaktiv" selected={false} onPress={() => {}} />
    </View>
  );
}

function ButtonSpecimens() {
  return (
    <View style={styles.stack}>
      <PrimaryButton title="Primary" variant="primary" onPress={() => {}} />
      <PrimaryButton title="Ghost" variant="ghost" onPress={() => {}} />
      <PrimaryButton title="Danger" variant="danger" onPress={() => {}} />
      <PrimaryButton title="Disabled" disabled onPress={() => {}} />
      <PrimaryButton title="Loading" loading onPress={() => {}} />
    </View>
  );
}

function WeekdayDemo() {
  const [value, setValue] = useState<Weekday[]>([1, 2, 3, 4, 5]);
  return <WeekdayPicker value={value} onChange={setValue} />;
}

function MoodDemo() {
  const [value, setValue] = useState<MoodId>('motivated');
  return <MoodPicker value={value} onChange={setValue} />;
}

function ContentTypeDemo() {
  const [value, setValue] = useState<ContentTypeId>('motivationalTalk');
  return <ContentTypePicker value={value} onChange={setValue} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  split: { flex: 1, flexDirection: 'row' },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(128,128,128,0.35)' },
  content: { padding: Spacing.four, gap: Spacing.five },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  eyebrow: { letterSpacing: 1.5, marginBottom: 2 },
  stories: { gap: Spacing.five },
  story: { gap: Spacing.three },
  storyHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dot: { width: 7, height: 7, borderRadius: 4 },
  stage: {
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.three,
  },
  stack: { gap: Spacing.two, alignItems: 'flex-start' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, alignItems: 'center' },
  toggle: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 2,
  },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
});
