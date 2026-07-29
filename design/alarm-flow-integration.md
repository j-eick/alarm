# Alarm-Erstellung — Integration Checklist

Rework the alarm editor into the 4-step flow: **Quelle → Entwurf → Ton → Zeitplan**.
Prototype: [alarm-creation-flow.html](./alarm-creation-flow.html). Current editor: [`src/app/alarm/[id].tsx`](../src/app/alarm/%5Bid%5D.tsx).

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[?]` blocked on a decision.

> **Zwei Dreiergruppen nicht verwechseln:**
> - **WAKE_EXAMPLES** ([showcase.ts](../src/constants/showcase.ts)) — The Rock / Elsa singt / Dein Tag — Hauptseite, illustrativ. **Keeper**, sollen den Create-Flow vorbefüllen.
> - **CONTENT_TYPES** ([content-types.ts](../src/lib/ai/content-types.ts)) — Motivational Talk / Affirmation / Tages-Fokus — nur im Editor. **Werden entfernt** (sauberer Schnitt).

---

## 0 · Decisions — RESOLVED

- [x] **Tone list** — final 7: `Sanft · Fröhlich · Energetisch · Motivierend · Dramatisch · Trocken · Streng`.
- [x] **Retire mood + content-type** — ja, sauberer Schnitt: `context.mood` + `contentType` raus, neues Modell `topic + tone`.
- [x] **Dictation** — natives **Tastatur-Mikro** auf `TextInput` (kein Dev-Build, bleibt in Expo Go). Kein In-App-Aufnahme-Button. Testen auf **echtem Gerät via Expo Go** (iOS-Simulator zeigt keine Diktier-Taste).

---

## 1 · Data model — [`src/types.ts`](../src/types.ts)

- [ ] Extend `Alarm`: `source: 'own' | 'ai'`, `text: string`, `topic?: TopicId`, `tone: ToneId`, `voice: VoiceId`.
- [ ] Remove `context.mood` / `contentType` (behalte ggf. `context.note` als optionalen Freitext).
- [ ] `createAlarmDraft()` defaults für die neuen Felder — [`src/lib/alarm-factory.ts`](../src/lib/alarm-factory.ts).
- [ ] Storage back-compat: alte persistierte Alarme migrieren/tolerant lesen — [`src/lib/storage.ts`](../src/lib/storage.ts).

## 2 · Content constants (neue Registries, analog [`moods.ts`](../src/constants/moods.ts))

- [ ] `src/constants/tones.ts` — `ToneId`, Labels, `promptHint` je Ton (die 7 aus §0).
- [ ] `src/constants/topics.ts` — `TopicId`, Labels für den „Überrasch mich"-Picker.
- [ ] `moods.ts` + `content-types.ts` nach dem Umbau entfernen/aufräumen.

## 3 · AI layer — [`src/lib/ai/`](../src/lib/ai/)

- [ ] Topic → Text-Generierung (ersetzt den mood/content-type-Prompt).
- [ ] **Ton** auf Generierung und/oder TTS-Delivery anwenden.
- [ ] Stimm-**Vorschau**: `elevenlabs-tts` verdrahten, damit Schritt 3 den Entwurf abspielt — [`providers/elevenlabs-tts.ts`](../src/lib/ai/providers/elevenlabs-tts.ts).

## 4 · UI flow (Editor-Sheet umbauen)

- [ ] **Step 1 · Quelle** — Source-Picker (`Eigener Text` / `Überrasch mich`).
- [ ] **Step 2a · Entwurf (own)** — `TextInput`, editierbar; Diktat über die **System-Tastatur** (kein eigener Button).
- [ ] **Step 2b · Entwurf (ai)** — Topic-Picker + KI-Entwurf + „Neu würfeln".
- [ ] **Step 3 · Ton & Stimme** — Ton-Selector (7) + Stimme + „Vorhören".
- [ ] **Step 4 · Zeitplan** — [`WeekdayPicker`](../src/components/weekday-picker.tsx) + Uhrzeit + Speichern.
- [ ] Step-State + Navigation (Step 2 verzweigt nach Quelle); Drag-to-dismiss-Sheet behalten.

## 5 · Hauptseite / Beispiele — [`index.tsx`](../src/app/index.tsx)

- [ ] **WAKE_EXAMPLES befüllen den Create-Flow vor** statt leerem `goCreate()` (Stimme/Ton/Thema als Params).
- [ ] Kacheln tragen ihre Facetten sichtbar (Stimme + Ton + Thema), damit die „Zutaten" ablesbar sind.
- [ ] Leerzustand als Bandbreiten-Showcase behalten; kompakte „VORSCHLÄGE"-Reihe bei vorhandenen Weckern behalten.

## 6 · Polish & verification

- [ ] Neue Ton-Chips / Flow-Schritte in die Dev-Gallery — [`src/app/(dev)/gallery.tsx`](../src/app/(dev)/gallery.tsx).
- [ ] Loading- + Error-States für Generierung und TTS.
- [ ] `npx tsc --noEmit` clean; ganzen Flow auf echtem Gerät (Diktat!) + Simulator durchspielen.

---

**Suggested order:** `1 → 2 → 3 → 5 → 4 → 6`. Modell/Konstanten/KI (1–3) und die Hauptseiten-Anbindung (5) können vor dem UI-Umbau (4) landen.
