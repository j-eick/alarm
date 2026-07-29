# Alarm-Erstellung — Integration Checklist

Rework the alarm editor into the 4-step flow: **Quelle → Entwurf → Ton → Zeitplan**.
Prototype: [alarm-creation-flow.html](./alarm-creation-flow.html). Current editor: [`src/app/alarm/[id].tsx`](../src/app/alarm/%5Bid%5D.tsx).

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[?]` blocked on a decision.

---

## 0 · Decisions (blockers — resolve first)

- [?] **Tone list** — final set of tones (mockup uses `Sanft · Energetisch · Dramatisch · Trocken · Streng` as placeholders).
- [?] **Retire mood + content-type?** — new model is `topic + tone`; confirm the 11 moods + 3 content types go away (drives the data-model change below).
- [?] **Dictation approach** — start with the **native keyboard mic** on a `TextInput` (zero-dep, works in the simulator) vs. a real in-app STT service (later).

---

## 1 · Data model — [`src/types.ts`](../src/types.ts)

- [ ] Extend `Alarm`: `source: 'own' | 'ai'`, `text: string`, `topic?: TopicId`, `tone: ToneId`, `voice: VoiceId`.
- [ ] Decide fate of `context.mood` / `context.note` / `contentType` (remove or keep alongside).
- [ ] `createAlarmDraft()` defaults for the new fields — [`src/lib/alarm-factory.ts`](../src/lib/alarm-factory.ts).
- [ ] Storage back-compat: migrate/relax old persisted alarms — [`src/lib/storage.ts`](../src/lib/storage.ts).

## 2 · Content constants (new registries, mirror [`moods.ts`](../src/constants/moods.ts))

- [ ] `src/constants/tones.ts` — `ToneId`, labels, `promptHint` per tone.
- [ ] `src/constants/topics.ts` — `TopicId`, labels for the "Überrasch mich" picker.

## 3 · AI layer — [`src/lib/ai/`](../src/lib/ai/)

- [ ] Topic → text generation path (parallel to the current mood/content-type prompt).
- [ ] Apply **tone** to generation and/or TTS delivery.
- [ ] Voice **preview**: wire `elevenlabs-tts` so step 3 can play the draft — [`providers/elevenlabs-tts.ts`](../src/lib/ai/providers/elevenlabs-tts.ts).

## 4 · UI flow (rework the editor sheet)

- [ ] **Step 1 · Quelle** — source picker (`Eigener Text` / `Überrasch mich`).
- [ ] **Step 2a · Entwurf (own)** — `TextInput` + keyboard-mic dictation, editable.
- [ ] **Step 2b · Entwurf (ai)** — topic picker + AI draft + „Neu würfeln" (regenerate).
- [ ] **Step 3 · Ton & Stimme** — tone selector (new axis) + voice + „Vorhören" preview.
- [ ] **Step 4 · Zeitplan** — reuse [`WeekdayPicker`](../src/components/weekday-picker.tsx) + time + save.
- [ ] Step state + navigation (branch step 2 on the chosen source); keep the existing drag-to-dismiss sheet.

## 5 · Polish & verification

- [ ] Add the new tone chips / flow steps to the dev gallery — [`src/app/(dev)/gallery.tsx`](../src/app/(dev)/gallery.tsx).
- [ ] Loading + error states for generation and TTS.
- [ ] `npx tsc --noEmit` clean; walk the full flow in the iOS simulator.

---

**Suggested order:** `0 → 1 → 2 → 3 → 4 → 5`. Steps 1–3 can land behind the current editor before the UI rework, so the model + AI are ready when the screens go in.
