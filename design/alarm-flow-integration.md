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

## 1 · Data model — [`src/types.ts`](../src/types.ts) ✅ (commit `fda9e8c`)

- [x] Extend `Alarm`: `source: 'own' | 'ai'`, `text: string`, `topic?: TopicId`, `tone: ToneId`, `voice: VoiceId`.
- [x] Remove `context.mood` / `contentType` (`context.note` komplett entfallen — sauberer Schnitt).
- [x] `createAlarmDraft()` defaults für die neuen Felder — [`src/lib/alarm-factory.ts`](../src/lib/alarm-factory.ts).
- [x] Storage back-compat: `normalizeAlarm()` liest alte Alarme tolerant — [`src/lib/storage.ts`](../src/lib/storage.ts).

## 2 · Content constants (neue Registries) ✅

- [x] `src/constants/tones.ts` — `ToneId`, Labels, `promptHint` je Ton (die 7 aus §0).
- [x] `src/constants/topics.ts` — `TopicId`, Labels für den „Überrasch mich"-Picker.
- [x] `src/constants/voices.ts` — `VoiceId` (3 Stimmen).
- [x] `moods.ts` + `content-types.ts` + Picker entfernt.

## 3 · AI layer — [`src/lib/ai/`](../src/lib/ai/)

- [x] Topic → Text-Generierung — neue [`prompt.ts`](../src/lib/ai/prompt.ts) ersetzt `content-types.ts`.
- [x] **Ton** fließt in den System-Prompt (`buildSystemPrompt(tone)`).
- [ ] Stimm-**Vorschau**: `elevenlabs-tts` verdrahten (voice→voiceId), damit Schritt 3 abspielt — [`providers/elevenlabs-tts.ts`](../src/lib/ai/providers/elevenlabs-tts.ts). → verschoben nach §6.

## 4 · UI flow (Editor-Sheet)

> **Interim gelandet** (commit `fda9e8c`): Einzel-Sheet mit Quelle → Text/Thema → Ton → Stimme, eigener Text per System-Tastatur-Diktat. Der echte **4-Step-Stepper** steht noch aus.

- [~] **Step 1 · Quelle** — Source-Picker (als Chips im Sheet, noch kein eigener Schritt).
- [~] **Step 2a · Entwurf (own)** — `TextInput` mit Tastatur-Diktat ✔; ohne Stepper.
- [ ] **Step 2b · Entwurf (ai)** — Topic-Chips ✔, aber **KI-Entwurf + „Neu würfeln"** fehlt noch.
- [~] **Step 3 · Ton & Stimme** — Ton- + Stimm-Chips ✔; „Vorhören" fehlt.
- [ ] **Step 4 · Zeitplan** — Uhrzeit + `WeekdayPicker` (bereits im Sheet vorhanden).
- [ ] Echter Step-State + Navigation (Step 2 verzweigt nach Quelle); Drag-to-dismiss-Sheet behalten.

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
